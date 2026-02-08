import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { Client, CreateClientInput, ClientType } from '@/types/saas-erp';

export function useClients() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user || !company) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClients((data || []) as Client[]);
    } catch (error: unknown) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createClient = async (input: CreateClientInput): Promise<Client | null> => {
    if (!user || !company) {
      toast.error('Company not found');
      return null;
    }

    try {
      const insertData = {
        company_id: company.id,
        name: input.name,
        type: input.type,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || {},
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE',
        p_entity_type: 'client',
        p_entity_id: data.id,
        p_new_values: JSON.parse(JSON.stringify(data)),
      });

      toast.success('Client created');
      await fetchClients();
      return data as Client;
    } catch (error: unknown) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<boolean> => {
    try {
      const { data: oldData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { address, ...restUpdates } = updates;
      const updatePayload = address 
        ? { ...restUpdates, address: address as Record<string, unknown> }
        : restUpdates;

      const { error } = await supabase
        .from('clients')
        .update(updatePayload as any)
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'UPDATE',
        p_entity_type: 'client',
        p_entity_id: id,
        p_old_values: JSON.parse(JSON.stringify(oldData)),
        p_new_values: JSON.parse(JSON.stringify({ ...oldData, ...updates })),
      });

      toast.success('Client updated');
      await fetchClients();
      return true;
    } catch (error: unknown) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      // Fetch old data before delete for audit
      const { data: oldData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit event for deletion
      await supabase.rpc('log_audit_event', {
        p_action: 'DELETE',
        p_entity_type: 'client',
        p_entity_id: id,
        p_old_values: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      });

      toast.success('Client deleted');
      await fetchClients();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  };

  const getClientsByType = (type: ClientType) => {
    return clients.filter(c => c.type === type);
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    getClientsByType,
    refetch: fetchClients,
  };
}
