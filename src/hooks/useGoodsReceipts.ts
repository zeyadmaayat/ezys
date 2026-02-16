import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { GoodsReceipt, GoodsReceiptLine } from '@/types/grn';

export function useGoodsReceipts() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    if (!user || !company) { setReceipts([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('goods_receipts')
        .select(`
          *,
          purchase_order:purchase_orders!goods_receipts_po_id_fkey(
            id, po_number, vendor_id,
            vendor:clients!purchase_orders_vendor_id_fkey(id, name)
          ),
          warehouse:warehouses(id, name),
          goods_receipt_lines(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReceipts((data || []) as unknown as GoodsReceipt[]);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      toast.error('Failed to load goods receipts');
    } finally { setLoading(false); }
  }, [user, company]);

  const createGRN = async (
    poId: string,
    warehouseId: string | null,
    notes: string | null,
    lines: Omit<GoodsReceiptLine, 'id' | 'grn_id' | 'created_at'>[]
  ) => {
    if (!user || !company) return null;
    try {
      const { data: grn, error } = await supabase
        .from('goods_receipts')
        .insert({
          company_id: company.id,
          grn_number: '',
          po_id: poId,
          warehouse_id: warehouseId,
          notes,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (lines.length > 0) {
        const lineInserts = lines.map(l => ({
          grn_id: grn.id,
          po_line_id: l.po_line_id,
          item_id: l.item_id || null,
          item_name: l.item_name,
          quantity_received: l.quantity_received,
          quantity_accepted: l.quantity_accepted,
          quantity_rejected: l.quantity_rejected,
          unit: l.unit,
          rejection_reason: l.rejection_reason || null,
        }));
        const { error: lineErr } = await supabase.from('goods_receipt_lines').insert(lineInserts as any);
        if (lineErr) throw lineErr;
      }

      toast.success('GRN created');
      await fetchReceipts();
      return grn;
    } catch (error) {
      console.error('Error creating GRN:', error);
      toast.error('Failed to create GRN');
      return null;
    }
  };

  const postGRN = async (grnId: string) => {
    if (!user || !company) return false;
    try {
      // Fetch the GRN with lines
      const { data: grn, error: grnErr } = await supabase
        .from('goods_receipts')
        .select('*, goods_receipt_lines(*)')
        .eq('id', grnId)
        .single();
      if (grnErr) throw grnErr;

      const grnData = grn as unknown as GoodsReceipt;
      if (grnData.status === 'Posted') {
        toast.error('GRN already posted');
        return false;
      }

      const lines = grnData.goods_receipt_lines || [];

      // Validate: received = accepted + rejected
      for (const line of lines) {
        if (Math.abs(line.quantity_received - (line.quantity_accepted + line.quantity_rejected)) > 0.001) {
          toast.error(`Line "${line.item_name}": received ≠ accepted + rejected`);
          return false;
        }
      }

      // Update po_lines received_quantity
      for (const line of lines) {
        const { data: poLine } = await supabase
          .from('po_lines')
          .select('received_quantity')
          .eq('id', line.po_line_id)
          .single();
        
        const newReceivedQty = (poLine?.received_quantity || 0) + line.quantity_accepted;
        const { error: updateErr } = await supabase
          .from('po_lines')
          .update({ received_quantity: newReceivedQty } as any)
          .eq('id', line.po_line_id);
        if (updateErr) throw updateErr;
      }

      // Update PO status
      const { data: poLines } = await supabase
        .from('po_lines')
        .select('quantity, received_quantity')
        .eq('po_id', grnData.po_id);

      if (poLines) {
        const allReceived = poLines.every(l => l.received_quantity >= l.quantity);
        const someReceived = poLines.some(l => l.received_quantity > 0);
        const newStatus = allReceived ? 'Received' : someReceived ? 'Partially_Received' : 'Sent';
        
        await supabase
          .from('purchase_orders')
          .update({ status: newStatus } as any)
          .eq('id', grnData.po_id);
      }

      // Update inventory (using existing inventory table)
      for (const line of lines) {
        if (line.quantity_accepted > 0 && line.item_id) {
          // Find a location for this warehouse or use a default
          let locationId: string | null = null;
          if (grnData.warehouse_id) {
            // Try to find a location matching the warehouse
            const { data: locations } = await supabase
              .from('locations')
              .select('id')
              .eq('company_id', company.id)
              .limit(1);
            locationId = locations?.[0]?.id || null;
          }

          if (locationId) {
            // Upsert inventory
            const { data: existing } = await supabase
              .from('inventory')
              .select('quantity')
              .eq('item_id', line.item_id)
              .eq('location_id', locationId)
              .single();

            const newQty = (existing?.quantity || 0) + line.quantity_accepted;
            await supabase
              .from('inventory')
              .upsert({
                item_id: line.item_id,
                location_id: locationId,
                quantity: newQty,
              } as any, { onConflict: 'item_id,location_id' });

            // Ledger entry
            await supabase.from('inventory_ledger').insert({
              item_id: line.item_id,
              location_id: locationId,
              movement_type: 'Inbound' as any,
              quantity: line.quantity_accepted,
              reference_id: grnId,
              reference_type: 'GRN',
              notes: `GRN ${grnData.grn_number} - accepted qty`,
              created_by: user.id,
            } as any);
          }
        }
      }

      // Mark GRN as posted
      const { error: postErr } = await supabase
        .from('goods_receipts')
        .update({ status: 'Posted' } as any)
        .eq('id', grnId);
      if (postErr) throw postErr;

      toast.success('GRN posted successfully');
      await fetchReceipts();
      return true;
    } catch (error) {
      console.error('Error posting GRN:', error);
      toast.error('Failed to post GRN');
      return false;
    }
  };

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  return { receipts, loading, createGRN, postGRN, refetch: fetchReceipts };
}
