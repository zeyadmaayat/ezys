import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { SalesLead, CreateLeadInput, LeadStatus } from '@/types/sales';

export function useLeads() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!user || !company) { setLeads([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('sales_leads')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data || []) as SalesLead[]);
    } catch (e) {
      console.error('Error fetching leads:', e);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createLead = async (input: CreateLeadInput): Promise<SalesLead | null> => {
    if (!user || !company) { toast.error('Company not found'); return null; }
    try {
      const { data, error } = await supabase
        .from('sales_leads')
        .insert({
          company_id: company.id,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          company_name: input.company_name || null,
          source: input.source || 'website',
          expected_revenue: input.expected_revenue || 0,
          notes: input.notes || null,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success('Lead created');
      await fetchLeads();
      return data as SalesLead;
    } catch (e) {
      console.error('Error creating lead:', e);
      toast.error('Failed to create lead');
      return null;
    }
  };

  const updateLead = async (id: string, updates: Partial<SalesLead>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sales_leads')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Lead updated');
      await fetchLeads();
      return true;
    } catch (e) {
      console.error('Error updating lead:', e);
      toast.error('Failed to update lead');
      return false;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sales_leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted');
      await fetchLeads();
      return true;
    } catch (e) {
      console.error('Error deleting lead:', e);
      toast.error('Failed to delete lead');
      return false;
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => leads.filter(l => l.status === status);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { leads, loading, createLead, updateLead, deleteLead, getLeadsByStatus, refetch: fetchLeads };
}
