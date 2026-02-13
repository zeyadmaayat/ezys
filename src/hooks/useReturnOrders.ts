import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { ReturnOrder, RTVStatus } from '@/types/procurement';

export function useReturnOrders() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRTVs = useCallback(async () => {
    if (!user || !company) { setReturnOrders([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('return_orders')
        .select('*, purchase_order:purchase_orders(id, po_number, vendor_id), vendor:clients!return_orders_vendor_id_fkey(id, name), po_line:po_lines(id, line_number, item_name, quantity)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReturnOrders((data || []) as unknown as ReturnOrder[]);
    } catch (error) {
      console.error('Error fetching RTVs:', error);
      toast.error('Failed to load return orders');
    } finally { setLoading(false); }
  }, [user, company]);

  const createRTV = async (data: {
    po_id: string;
    po_line_id?: string;
    vendor_id?: string;
    return_reason: string;
    quantity: number;
    unit?: string;
    resolution?: string;
    notes?: string;
  }) => {
    if (!user || !company) return null;
    try {
      const { data: rtv, error } = await supabase
        .from('return_orders')
        .insert({
          company_id: company.id,
          rtv_number: '',
          po_id: data.po_id,
          po_line_id: data.po_line_id || null,
          vendor_id: data.vendor_id || null,
          return_reason: data.return_reason as any,
          quantity: data.quantity,
          unit: data.unit || 'pcs',
          resolution: data.resolution || null,
          notes: data.notes || null,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success('Return order created');
      await fetchRTVs();
      return rtv;
    } catch (error) {
      console.error('Error creating RTV:', error);
      toast.error('Failed to create return order');
      return null;
    }
  };

  const updateStatus = async (id: string, status: RTVStatus) => {
    try {
      const { error } = await supabase
        .from('return_orders')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('RTV status updated');
      await fetchRTVs();
      return true;
    } catch (error) {
      console.error('Error updating RTV:', error);
      toast.error('Failed to update RTV');
      return false;
    }
  };

  useEffect(() => { fetchRTVs(); }, [fetchRTVs]);

  return { returnOrders, loading, createRTV, updateStatus, refetch: fetchRTVs };
}
