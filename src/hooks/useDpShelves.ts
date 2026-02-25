import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { DpShelf, CreateDpShelfInput } from '@/types/domestic-pro';

export function useDpShelves(zoneId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();
  const [shelves, setShelves] = useState<DpShelf[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShelves = useCallback(async () => {
    if (!user || !company) {
      setShelves([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('dp_shelves')
        .select('*, zone:dp_zones(id, name, code)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (zoneId) {
        query = query.eq('zone_id', zoneId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setShelves((data || []) as DpShelf[]);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      toast.error('Failed to load shelves');
    } finally {
      setLoading(false);
    }
  }, [user, company, zoneId]);

  const createShelf = async (input: CreateDpShelfInput): Promise<DpShelf | null> => {
    if (!user || !company) return null;
    try {
      const { data, error } = await supabase
        .from('dp_shelves')
        .insert({ company_id: company.id, ...input })
        .select()
        .single();
      if (error) throw error;
      toast.success('Shelf created');
      await fetchShelves();
      return data as DpShelf;
    } catch (error: any) {
      console.error('Error creating shelf:', error);
      toast.error(error.message?.includes('duplicate') ? 'Shelf code already exists in this zone' : 'Failed to create shelf');
      return null;
    }
  };

  const updateShelf = async (id: string, updates: Partial<DpShelf>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_shelves').update(updates).eq('id', id);
      if (error) throw error;
      toast.success('Shelf updated');
      await fetchShelves();
      return true;
    } catch (error) {
      console.error('Error updating shelf:', error);
      toast.error('Failed to update shelf');
      return false;
    }
  };

  const deleteShelf = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('dp_shelves').delete().eq('id', id);
      if (error) throw error;
      toast.success('Shelf deleted');
      await fetchShelves();
      return true;
    } catch (error) {
      console.error('Error deleting shelf:', error);
      toast.error('Failed to delete shelf');
      return false;
    }
  };

  useEffect(() => { fetchShelves(); }, [fetchShelves]);

  return { shelves, loading, createShelf, updateShelf, deleteShelf, refetch: fetchShelves };
}
