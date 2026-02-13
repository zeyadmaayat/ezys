import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { PurchaseRequisition, RequisitionLine, RequisitionStatus } from '@/types/procurement';

export function useRequisitions() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequisitions = useCallback(async () => {
    if (!user || !company) { setRequisitions([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('purchase_requisitions')
        .select('*, lines:requisition_lines(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequisitions((data || []) as unknown as PurchaseRequisition[]);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      toast.error('Failed to load requisitions');
    } finally { setLoading(false); }
  }, [user, company]);

  const createRequisition = async (
    data: { priority: string; required_date?: string; notes?: string },
    lines: Omit<RequisitionLine, 'id' | 'requisition_id' | 'created_at'>[]
  ) => {
    if (!user || !company) return null;
    try {
      const { data: req, error } = await supabase
        .from('purchase_requisitions')
        .insert({
          company_id: company.id,
          requested_by: user.id,
          requisition_number: '',
          priority: data.priority as any,
          required_date: data.required_date || null,
          notes: data.notes || null,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (lines.length > 0) {
        const lineInserts = lines.map(l => ({
          requisition_id: req.id,
          item_id: l.item_id || null,
          item_name: l.item_name,
          quantity: l.quantity,
          unit: l.unit,
          estimated_unit_price: l.estimated_unit_price || 0,
          notes: l.notes || null,
        }));
        const { error: lineErr } = await supabase.from('requisition_lines').insert(lineInserts as any);
        if (lineErr) throw lineErr;
      }

      toast.success('Requisition created');
      await fetchRequisitions();
      return req;
    } catch (error) {
      console.error('Error creating requisition:', error);
      toast.error('Failed to create requisition');
      return null;
    }
  };

  const updateStatus = async (id: string, status: RequisitionStatus) => {
    try {
      const { error } = await supabase
        .from('purchase_requisitions')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
      await fetchRequisitions();
      return true;
    } catch (error) {
      console.error('Error updating requisition:', error);
      toast.error('Failed to update');
      return false;
    }
  };

  useEffect(() => { fetchRequisitions(); }, [fetchRequisitions]);

  return { requisitions, loading, createRequisition, updateStatus, refetch: fetchRequisitions };
}
