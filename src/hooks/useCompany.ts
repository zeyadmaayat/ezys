import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Company } from '@/types/saas-erp';

export function useCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      // First get user's company_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.company_id) {
        setCompany(null);
        setLoading(false);
        return;
      }

      // Then fetch the company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError) throw companyError;

      setCompany(companyData as Company);
    } catch (error: unknown) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCompany = async (name: string): Promise<Company | null> => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      // Create company - trigger will auto-assign admin role and link profile
      const { error: companyError } = await supabase
        .from('companies')
        .insert({ name });

      if (companyError) throw companyError;

      // Wait briefly for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch the newly created company via updated profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.company_id) {
        const { data: newCompany } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
        
        if (newCompany) {
          setCompany(newCompany as Company);
          toast.success('Company created successfully');
          return newCompany as Company;
        }
      }
      
      // Fallback: refetch normally
      await fetchCompany();
      toast.success('Company created successfully');
      return company;
    } catch (error: unknown) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
      return null;
    }
  };

  const updateCompany = async (updates: Partial<Company>): Promise<boolean> => {
    if (!company) {
      toast.error('No company found');
      return false;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;

      setCompany(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Company updated');
      return true;
    } catch (error: unknown) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
      return false;
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    loading,
    createCompany,
    updateCompany,
    refetch: fetchCompany,
    hasCompany: !!company,
  };
}
