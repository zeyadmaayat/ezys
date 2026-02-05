import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { Payment, CreatePaymentInput } from '@/types/saas-erp';

export function usePayments() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user || !company) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices_v2(*)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments((data || []) as Payment[]);
    } catch (error: unknown) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createPayment = async (input: CreatePaymentInput): Promise<Payment | null> => {
    if (!user || !company) {
      toast.error('Company not found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          company_id: company.id,
          invoice_id: input.invoice_id,
          amount: input.amount,
          method: input.method,
          reference: input.reference || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Mark invoice as paid
      await supabase
        .from('invoices_v2')
        .update({ status: 'Paid', paid_at: new Date().toISOString() })
        .eq('id', input.invoice_id);

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE',
        p_entity_type: 'payment',
        p_entity_id: data.id,
        p_new_values: data,
      });

      toast.success('Payment recorded');
      await fetchPayments();
      return data as Payment;
    } catch (error: unknown) {
      console.error('Error creating payment:', error);
      toast.error('Failed to record payment');
      return null;
    }
  };

  const getPaymentsByInvoice = (invoiceId: string): Payment[] => {
    return payments.filter(p => p.invoice_id === invoiceId);
  };

  const getTotalPayments = (invoiceId: string): number => {
    return getPaymentsByInvoice(invoiceId).reduce((sum, p) => sum + Number(p.amount), 0);
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    createPayment,
    getPaymentsByInvoice,
    getTotalPayments,
    refetch: fetchPayments,
  };
}
