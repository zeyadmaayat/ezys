import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { BlanketOrder, BlanketOrderLine, BlanketStatus } from '@/types/procurement';

export function useBlanketOrders() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [blanketOrders, setBlanketOrders] = useState<BlanketOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlankets = useCallback(async () => {
    if (!user || !company) { setBlanketOrders([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('blanket_orders')
        .select('*, vendor:clients!blanket_orders_vendor_id_fkey(id, name), blanket_order_lines(*), blanket_releases(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBlanketOrders((data || []) as unknown as BlanketOrder[]);
    } catch (error) {
      console.error('Error fetching blanket orders:', error);
      toast.error('Failed to load blanket orders');
    } finally { setLoading(false); }
  }, [user, company]);

  const createBlanket = async (
    data: {
      vendor_id?: string;
      start_date: string;
      end_date: string;
      release_frequency_months?: number;
      currency?: string;
      total_contract_value?: number;
      notes?: string;
    },
    lines: Omit<BlanketOrderLine, 'id' | 'blanket_order_id' | 'created_at' | 'total_released'>[]
  ) => {
    if (!user || !company) return null;
    try {
      const nextRelease = new Date(data.start_date);
      nextRelease.setMonth(nextRelease.getMonth() + (data.release_frequency_months || 6));

      const { data: blanket, error } = await supabase
        .from('blanket_orders')
        .insert({
          company_id: company.id,
          blanket_number: '',
          vendor_id: data.vendor_id || null,
          start_date: data.start_date,
          end_date: data.end_date,
          release_frequency_months: data.release_frequency_months || 6,
          next_release_date: nextRelease.toISOString().split('T')[0],
          currency: data.currency || 'SAR',
          total_contract_value: data.total_contract_value || 0,
          notes: data.notes || null,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (lines.length > 0) {
        const lineInserts = lines.map(l => ({
          blanket_order_id: blanket.id,
          item_id: l.item_id || null,
          item_name: l.item_name,
          quantity_per_release: l.quantity_per_release,
          unit: l.unit,
          unit_price: l.unit_price,
          total_released: 0,
          notes: l.notes || null,
        }));
        const { error: lineErr } = await supabase.from('blanket_order_lines').insert(lineInserts as any);
        if (lineErr) throw lineErr;
      }

      toast.success('Blanket order created');
      await fetchBlankets();
      return blanket;
    } catch (error) {
      console.error('Error creating blanket order:', error);
      toast.error('Failed to create blanket order');
      return null;
    }
  };

  const updateStatus = async (id: string, status: BlanketStatus) => {
    try {
      const { error } = await supabase
        .from('blanket_orders')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Blanket order status updated');
      await fetchBlankets();
      return true;
    } catch (error) {
      console.error('Error updating blanket order:', error);
      toast.error('Failed to update');
      return false;
    }
  };

  useEffect(() => { fetchBlankets(); }, [fetchBlankets]);

  return { blanketOrders, loading, createBlanket, updateStatus, refetch: fetchBlankets };
}
