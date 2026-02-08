import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { Warehouse, CreateWarehouseInput } from '@/types/saas-erp';

export function useWarehouses() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = useCallback(async () => {
    if (!user || !company) {
      setWarehouses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWarehouses((data || []) as Warehouse[]);
    } catch (error: unknown) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createWarehouse = async (input: CreateWarehouseInput): Promise<Warehouse | null> => {
    if (!user || !company) {
      toast.error('Company not found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          company_id: company.id,
          name: input.name,
          location: input.location || null,
          address_line1: input.address_line1 || null,
          city: input.city || null,
          country: input.country || 'SA',
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE',
        p_entity_type: 'warehouse',
        p_entity_id: data.id,
        p_new_values: data,
      });

      toast.success('Warehouse created');
      await fetchWarehouses();
      return data as Warehouse;
    } catch (error: unknown) {
      console.error('Error creating warehouse:', error);
      toast.error('Failed to create warehouse');
      return null;
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>): Promise<boolean> => {
    try {
      const { data: oldData } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'UPDATE',
        p_entity_type: 'warehouse',
        p_entity_id: id,
        p_old_values: oldData,
        p_new_values: { ...oldData, ...updates },
      });

      toast.success('Warehouse updated');
      await fetchWarehouses();
      return true;
    } catch (error: unknown) {
      console.error('Error updating warehouse:', error);
      toast.error('Failed to update warehouse');
      return false;
    }
  };

  const deleteWarehouse = async (id: string): Promise<boolean> => {
    try {
      // Fetch old data before delete for audit
      const { data: oldData } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit event for deletion
      await supabase.rpc('log_audit_event', {
        p_action: 'DELETE',
        p_entity_type: 'warehouse',
        p_entity_id: id,
        p_old_values: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      });

      toast.success('Warehouse deleted');
      await fetchWarehouses();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting warehouse:', error);
      toast.error('Failed to delete warehouse');
      return false;
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return {
    warehouses,
    loading,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    refetch: fetchWarehouses,
  };
}
