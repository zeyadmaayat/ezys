import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ShipmentStatus = 'Planned' | 'Booked' | 'In_Transit' | 'Cleared' | 'Delivered';

export interface Shipment {
  id: string;
  plan_id: string | null;
  user_id: string;
  status: ShipmentStatus;
  created_at: string;
  updated_at: string;
  // Joined from shipment_plans
  shipment_state?: {
    origin_country?: string;
    destination_country?: string;
    product_category?: string;
    weight_kg?: string;
  };
  plan_title?: string;
}

export function useShipments() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    if (!user) {
      setShipments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_plans (
            title,
            shipment_state
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedShipments: Shipment[] = (data || []).map((s: any) => ({
        id: s.id,
        plan_id: s.plan_id,
        user_id: s.user_id,
        status: s.status as ShipmentStatus,
        created_at: s.created_at,
        updated_at: s.updated_at,
        shipment_state: s.shipment_plans?.shipment_state as Shipment['shipment_state'],
        plan_title: s.shipment_plans?.title,
      }));

      setShipments(formattedShipments);
    } catch (error: any) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (planId: string): Promise<Shipment | null> => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          plan_id: planId,
          user_id: user.id,
          status: 'Planned' as ShipmentStatus,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default document entries
      const documentTypes = ['Commercial_Invoice', 'Packing_List', 'Bill_of_Lading'] as const;
      await supabase
        .from('shipment_documents')
        .insert(
          documentTypes.map(type => ({
            shipment_id: data.id,
            document_type: type,
            status: 'Missing' as const,
          }))
        );

      toast.success('Shipment created successfully');
      await fetchShipments();
      return data as Shipment;
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment');
      return null;
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: ShipmentStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status })
        .eq('id', shipmentId);

      if (error) throw error;

      setShipments(prev =>
        prev.map(s => (s.id === shipmentId ? { ...s, status, updated_at: new Date().toISOString() } : s))
      );

      toast.success('Status updated');
      return true;
    } catch (error: any) {
      console.error('Error updating shipment status:', error);
      toast.error('Failed to update status');
      return false;
    }
  };

  const deleteShipment = async (shipmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipmentId);

      if (error) throw error;

      setShipments(prev => prev.filter(s => s.id !== shipmentId));
      toast.success('Shipment deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
      return false;
    }
  };

  const getShipmentById = async (shipmentId: string): Promise<Shipment | null> => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_plans (
            title,
            shipment_state
          )
        `)
        .eq('id', shipmentId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        plan_id: data.plan_id,
        user_id: data.user_id,
        status: data.status as ShipmentStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        shipment_state: (data as any).shipment_plans?.shipment_state as Shipment['shipment_state'],
        plan_title: (data as any).shipment_plans?.title,
      };
    } catch (error: any) {
      console.error('Error fetching shipment:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [user]);

  return {
    shipments,
    loading,
    createShipment,
    updateShipmentStatus,
    deleteShipment,
    getShipmentById,
    refetch: fetchShipments,
  };
}
