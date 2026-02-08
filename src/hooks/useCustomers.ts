import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { Customer, CustomerAddress } from '@/types/erp';
import type { Json } from '@/integrations/supabase/types';

export function useCustomers() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!user || !company) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers((data || []) as Customer[]);
    } catch (error: unknown) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createCustomer = async (customer: Partial<Customer>): Promise<Customer | null> => {
    if (!user || !company) {
      toast.error('You must be logged in with a company');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name!,
          phone: customer.phone || null,
          email: customer.email || null,
          billing_address: (customer.billing_address || {}) as Json,
          created_by: user.id,
          company_id: company.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Customer created');
      await fetchCustomers();
      return data as Customer;
    } catch (error: unknown) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.billing_address) {
        updateData.billing_address = updates.billing_address as Json;
      }
      
      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Customer updated');
      await fetchCustomers();
      return true;
    } catch (error: unknown) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Customer deleted');
      await fetchCustomers();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}

export function useCustomerAddresses(customerId: string | null) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!customerId) {
      setAddresses([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses((data || []) as CustomerAddress[]);
    } catch (error: unknown) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const addAddress = async (address: Omit<CustomerAddress, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: address.customer_id,
          label: address.label,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || null,
          city: address.city || null,
          state: address.state || null,
          postal_code: address.postal_code || null,
          country: address.country,
          is_default: address.is_default,
        });

      if (error) throw error;
      
      toast.success('Address added');
      await fetchAddresses();
      return true;
    } catch (error: unknown) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      return false;
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return { addresses, loading, addAddress, refetch: fetchAddresses };
}
