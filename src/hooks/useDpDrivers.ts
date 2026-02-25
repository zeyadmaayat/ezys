import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { DpDriver, CreateDpDriverInput } from '@/types/domestic-pro';

export function useDpDrivers() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [drivers, setDrivers] = useState<DpDriver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = useCallback(async () => {
    if (!user || !company) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dp_drivers')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers((data || []) as DpDriver[]);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createDriver = async (input: CreateDpDriverInput): Promise<DpDriver | null> => {
    if (!user || !company) return null;
    try {
      const { data, error } = await supabase
        .from('dp_drivers')
        .insert({ company_id: company.id, created_by: user.id, ...input })
        .select()
        .single();
      if (error) throw error;
      toast.success('Driver added');
      await fetchDrivers();
      return data as DpDriver;
    } catch (error) {
      console.error('Error creating driver:', error);
      toast.error('Failed to add driver');
      return null;
    }
  };

  const updateDriver = async (id: string, updates: Partial<DpDriver>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_drivers').update(updates).eq('id', id);
      if (error) throw error;
      toast.success('Driver updated');
      await fetchDrivers();
      return true;
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver');
      return false;
    }
  };

  const deleteDriver = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_drivers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Driver removed');
      await fetchDrivers();
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to remove driver');
      return false;
    }
  };

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  return { drivers, loading, createDriver, updateDriver, deleteDriver, refetch: fetchDrivers };
}
