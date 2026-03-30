import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { SalesQuotation, QuotationStatus } from '@/types/sales';

export function useQuotations() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    if (!user || !company) { setQuotations([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('sales_quotations')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuotations((data || []) as SalesQuotation[]);
    } catch (e) {
      console.error('Error fetching quotations:', e);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createQuotation = async (input: {
    client_id?: string;
    lead_id?: string;
    expiry_date?: string;
    notes?: string;
    subtotal?: number;
    tax_amount?: number;
    total_amount?: number;
  }): Promise<SalesQuotation | null> => {
    if (!user || !company) { toast.error('Company not found'); return null; }
    try {
      const num = `QTN-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('sales_quotations')
        .insert({
          company_id: company.id,
          quotation_number: num,
          client_id: input.client_id || null,
          lead_id: input.lead_id || null,
          expiry_date: input.expiry_date || null,
          notes: input.notes || null,
          subtotal: input.subtotal || 0,
          tax_amount: input.tax_amount || 0,
          total_amount: input.total_amount || 0,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success('Quotation created');
      await fetchQuotations();
      return data as SalesQuotation;
    } catch (e) {
      console.error('Error creating quotation:', e);
      toast.error('Failed to create quotation');
      return null;
    }
  };

  const updateQuotation = async (id: string, updates: Partial<SalesQuotation>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sales_quotations')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Quotation updated');
      await fetchQuotations();
      return true;
    } catch (e) {
      console.error('Error updating quotation:', e);
      toast.error('Failed to update quotation');
      return false;
    }
  };

  const deleteQuotation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sales_quotations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Quotation deleted');
      await fetchQuotations();
      return true;
    } catch (e) {
      console.error('Error deleting quotation:', e);
      toast.error('Failed to delete quotation');
      return false;
    }
  };

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  return { quotations, loading, createQuotation, updateQuotation, deleteQuotation, refetch: fetchQuotations };
}
