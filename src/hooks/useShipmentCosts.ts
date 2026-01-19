import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CostType = 'Freight' | 'Customs' | 'Clearance' | 'Insurance' | 'LastMile' | 'Storage' | 'Other';

export interface ShipmentCost {
  id: string;
  shipment_id: string;
  user_id: string;
  cost_type: CostType;
  estimate_amount: number | null;
  actual_amount: number | null;
  currency: string;
  vendor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostTotals {
  totalEstimate: number;
  totalActual: number;
  variance: number;
  variancePercent: number | null;
}

export const COST_TYPE_LABELS: Record<CostType, string> = {
  Freight: 'Freight',
  Customs: 'Customs Duties',
  Clearance: 'Clearance Fees',
  Insurance: 'Insurance',
  LastMile: 'Last Mile Delivery',
  Storage: 'Storage/Warehousing',
  Other: 'Other',
};

export function useShipmentCosts(shipmentId: string | undefined) {
  const { user } = useAuth();
  const [costs, setCosts] = useState<ShipmentCost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCosts = useCallback(async () => {
    if (!shipmentId || !user) {
      setCosts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shipment_costs')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCosts((data as ShipmentCost[]) || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
      toast.error('Failed to load costs');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, user]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const addCost = async (cost: Omit<ShipmentCost, 'id' | 'user_id' | 'shipment_id' | 'created_at' | 'updated_at'>) => {
    if (!shipmentId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('shipment_costs')
        .insert({
          shipment_id: shipmentId,
          user_id: user.id,
          cost_type: cost.cost_type,
          estimate_amount: cost.estimate_amount,
          actual_amount: cost.actual_amount,
          currency: cost.currency || 'USD',
          vendor_name: cost.vendor_name,
          notes: cost.notes,
        })
        .select()
        .single();

      if (error) throw error;
      setCosts(prev => [...prev, data as ShipmentCost]);
      toast.success('Cost added');
      return data as ShipmentCost;
    } catch (error) {
      console.error('Error adding cost:', error);
      toast.error('Failed to add cost');
      return null;
    }
  };

  const updateCost = async (costId: string, updates: Partial<ShipmentCost>) => {
    try {
      const { error } = await supabase
        .from('shipment_costs')
        .update({
          cost_type: updates.cost_type,
          estimate_amount: updates.estimate_amount,
          actual_amount: updates.actual_amount,
          currency: updates.currency,
          vendor_name: updates.vendor_name,
          notes: updates.notes,
        })
        .eq('id', costId);

      if (error) throw error;
      setCosts(prev => prev.map(c => c.id === costId ? { ...c, ...updates } : c));
      toast.success('Cost updated');
      return true;
    } catch (error) {
      console.error('Error updating cost:', error);
      toast.error('Failed to update cost');
      return false;
    }
  };

  const deleteCost = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;
      setCosts(prev => prev.filter(c => c.id !== costId));
      toast.success('Cost deleted');
      return true;
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast.error('Failed to delete cost');
      return false;
    }
  };

  const totals: CostTotals = {
    totalEstimate: costs.reduce((sum, c) => sum + (c.estimate_amount || 0), 0),
    totalActual: costs.reduce((sum, c) => sum + (c.actual_amount || 0), 0),
    variance: costs.reduce((sum, c) => sum + (c.actual_amount || 0), 0) - costs.reduce((sum, c) => sum + (c.estimate_amount || 0), 0),
    variancePercent: null,
  };

  if (totals.totalEstimate > 0) {
    totals.variancePercent = ((totals.variance / totals.totalEstimate) * 100);
  }

  return {
    costs,
    loading,
    totals,
    addCost,
    updateCost,
    deleteCost,
    refetch: fetchCosts,
  };
}
