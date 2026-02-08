import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { ShipmentV2, CreateShipmentInput, ShipmentStatusV2 } from '@/types/saas-erp';
import { SHIPMENT_STATUS_ORDER } from '@/types/saas-erp';

export function useShipmentsV2() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [shipments, setShipments] = useState<ShipmentV2[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = useCallback(async () => {
    if (!user || !company) {
      setShipments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shipments_v2')
        .select(`
          *,
          client:clients(*),
          warehouse:warehouses(*)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShipments((data || []) as ShipmentV2[]);
    } catch (error: unknown) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createShipment = async (input: CreateShipmentInput): Promise<ShipmentV2 | null> => {
    if (!user || !company) {
      toast.error('Company not found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('shipments_v2')
        .insert({
          company_id: company.id,
          client_id: input.client_id || null,
          warehouse_id: input.warehouse_id || null,
          origin: input.origin,
          destination: input.destination,
          expected_delivery: input.expected_delivery || null,
          notes: input.notes || null,
          created_by: user.id,
          status: 'CREATED',
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE',
        p_entity_type: 'shipment',
        p_entity_id: data.id,
        p_new_values: data,
      });

      toast.success(`Shipment ${data.tracking_number} created`);
      await fetchShipments();
      return data as ShipmentV2;
    } catch (error: unknown) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment');
      return null;
    }
  };

  const updateShipmentStatus = async (id: string, newStatus: ShipmentStatusV2): Promise<boolean> => {
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
      toast.error('Shipment not found');
      return false;
    }

    // Client-side validation (server also validates via trigger)
    const currentIdx = SHIPMENT_STATUS_ORDER.indexOf(shipment.status);
    const newIdx = SHIPMENT_STATUS_ORDER.indexOf(newStatus);

    if (newIdx < currentIdx) {
      toast.error('Cannot move status backward');
      return false;
    }
    if (newIdx > currentIdx + 1) {
      toast.error('Cannot skip status steps');
      return false;
    }

    try {
      const { error } = await supabase
        .from('shipments_v2')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'STATUS_UPDATE',
        p_entity_type: 'shipment',
        p_entity_id: id,
        p_old_values: { status: shipment.status },
        p_new_values: { status: newStatus },
      });

      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      await fetchShipments();
      return true;
    } catch (error: unknown) {
      console.error('Error updating shipment status:', error);
      const errMsg = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errMsg);
      return false;
    }
  };

  const updateShipment = async (id: string, updates: Partial<ShipmentV2>): Promise<boolean> => {
    try {
      const { data: oldData } = await supabase
        .from('shipments_v2')
        .select('*')
        .eq('id', id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { client, warehouse, ...restUpdates } = updates;

      const { error } = await supabase
        .from('shipments_v2')
        .update(restUpdates)
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'UPDATE',
        p_entity_type: 'shipment',
        p_entity_id: id,
        p_old_values: JSON.parse(JSON.stringify(oldData)),
        p_new_values: JSON.parse(JSON.stringify({ ...oldData, ...restUpdates })),
      });

      toast.success('Shipment updated');
      await fetchShipments();
      return true;
    } catch (error: unknown) {
      console.error('Error updating shipment:', error);
      toast.error('Failed to update shipment');
      return false;
    }
  };

  const deleteShipment = async (id: string): Promise<boolean> => {
    try {
      // Fetch old data before delete for audit
      const { data: oldData } = await supabase
        .from('shipments_v2')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('shipments_v2')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit event for deletion
      await supabase.rpc('log_audit_event', {
        p_action: 'DELETE',
        p_entity_type: 'shipment',
        p_entity_id: id,
        p_old_values: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      });

      toast.success('Shipment deleted');
      await fetchShipments();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
      return false;
    }
  };

  const getShipmentById = async (id: string): Promise<ShipmentV2 | null> => {
    try {
      const { data, error } = await supabase
        .from('shipments_v2')
        .select(`
          *,
          client:clients(*),
          warehouse:warehouses(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ShipmentV2;
    } catch (error: unknown) {
      console.error('Error fetching shipment:', error);
      return null;
    }
  };

  const getDeliveredShipments = () => {
    return shipments.filter(s => s.status === 'DELIVERED');
  };

  const getNextStatus = (current: ShipmentStatusV2): ShipmentStatusV2 | null => {
    const idx = SHIPMENT_STATUS_ORDER.indexOf(current);
    if (idx < SHIPMENT_STATUS_ORDER.length - 1) {
      return SHIPMENT_STATUS_ORDER[idx + 1];
    }
    return null;
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return {
    shipments,
    loading,
    createShipment,
    updateShipment,
    updateShipmentStatus,
    deleteShipment,
    getShipmentById,
    getDeliveredShipments,
    getNextStatus,
    refetch: fetchShipments,
  };
}
