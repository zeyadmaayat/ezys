import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { DpZone, CreateDpZoneInput } from '@/types/domestic-pro';

export function useDpZones(warehouseId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();
  const [zones, setZones] = useState<DpZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = useCallback(async () => {
    if (!user || !company) {
      setZones([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('dp_zones')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setZones((data || []) as DpZone[]);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, [user, company, warehouseId]);

  const createZone = async (input: CreateDpZoneInput): Promise<DpZone | null> => {
    if (!user || !company) return null;
    try {
      const { data, error } = await supabase
        .from('dp_zones')
        .insert({ company_id: company.id, ...input })
        .select()
        .single();
      if (error) throw error;
      toast.success('Zone created');
      await fetchZones();
      return data as DpZone;
    } catch (error: any) {
      console.error('Error creating zone:', error);
      toast.error(error.message?.includes('duplicate') ? 'Zone code already exists' : 'Failed to create zone');
      return null;
    }
  };

  const updateZone = async (id: string, updates: Partial<DpZone>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_zones').update(updates).eq('id', id);
      if (error) throw error;
      toast.success('Zone updated');
      await fetchZones();
      return true;
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Failed to update zone');
      return false;
    }
  };

  const deleteZone = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_zones').delete().eq('id', id);
      if (error) throw error;
      toast.success('Zone deleted');
      await fetchZones();
      return true;
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
      return false;
    }
  };

  useEffect(() => { fetchZones(); }, [fetchZones]);

  return { zones, loading, createZone, updateZone, deleteZone, refetch: fetchZones };
}
