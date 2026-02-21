import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { Expense, CreateExpenseInput } from '@/types/saas-erp';

export function useExpenses() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user || !company) { setExpenses([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, purchase_order:purchase_orders(id, po_number), shipment:shipments_v2(id, tracking_number)')
        .eq('company_id', company.id)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      setExpenses((data || []) as unknown as Expense[]);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally { setLoading(false); }
  }, [user, company]);

  const createExpense = async (input: CreateExpenseInput) => {
    if (!user || !company) return null;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          company_id: company.id,
          expense_number: '',
          category: input.category,
          amount: input.amount,
          currency: input.currency || 'SAR',
          expense_date: input.expense_date || new Date().toISOString().split('T')[0],
          vendor_name: input.vendor_name || null,
          description: input.description || null,
          reference: input.reference || null,
          po_id: input.po_id || null,
          shipment_id: input.shipment_id || null,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success('Expense recorded');
      await fetchExpenses();
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
      return null;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Expense deleted');
      await fetchExpenses();
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      return false;
    }
  };

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  return { expenses, loading, createExpense, deleteExpense, refetch: fetchExpenses };
}
