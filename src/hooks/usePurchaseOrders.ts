import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { PurchaseOrder, POLine, POStatus } from '@/types/procurement';

export function usePurchaseOrders() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPOs = useCallback(async () => {
    if (!user || !company) { setPurchaseOrders([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, vendor:clients!purchase_orders_vendor_id_fkey(id, name, type), po_lines(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPurchaseOrders((data || []) as unknown as PurchaseOrder[]);
    } catch (error) {
      console.error('Error fetching POs:', error);
      toast.error('Failed to load purchase orders');
    } finally { setLoading(false); }
  }, [user, company]);

  const createPO = async (
    data: { vendor_id?: string; requisition_id?: string; payment_terms?: string; delivery_date?: string; currency?: string; notes?: string },
    lines: Omit<POLine, 'id' | 'po_id' | 'created_at'>[]
  ) => {
    if (!user || !company) return null;
    try {
      const totalAmount = lines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0);
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .insert({
          company_id: company.id,
          po_number: '',
          vendor_id: data.vendor_id || null,
          requisition_id: data.requisition_id || null,
          payment_terms: data.payment_terms || null,
          delivery_date: data.delivery_date || null,
          currency: data.currency || 'SAR',
          total_amount: totalAmount,
          notes: data.notes || null,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (lines.length > 0) {
        const lineInserts = lines.map((l, idx) => ({
          po_id: po.id,
          line_number: l.line_number || idx + 1,
          item_id: l.item_id || null,
          item_name: l.item_name,
          quantity: l.quantity,
          received_quantity: 0,
          unit: l.unit,
          unit_price: l.unit_price,
          notes: l.notes || null,
        }));
        const { error: lineErr } = await supabase.from('po_lines').insert(lineInserts as any);
        if (lineErr) throw lineErr;
      }

      toast.success('Purchase Order created');
      await fetchPOs();
      return po;
    } catch (error) {
      console.error('Error creating PO:', error);
      toast.error('Failed to create PO');
      return null;
    }
  };

  const updateStatus = async (id: string, status: POStatus) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('PO status updated');
      await fetchPOs();
      return true;
    } catch (error) {
      console.error('Error updating PO:', error);
      toast.error('Failed to update PO');
      return false;
    }
  };

  useEffect(() => { fetchPOs(); }, [fetchPOs]);

  return { purchaseOrders, loading, createPO, updateStatus, refetch: fetchPOs };
}
