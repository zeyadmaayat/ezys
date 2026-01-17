import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ShipmentState } from './useShipmentState';
import { Json } from '@/integrations/supabase/types';

export interface SavedShipmentPlan {
  id: string;
  user_id: string;
  title: string;
  shipment_state: ShipmentState;
  generated_plan: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useShipmentPlans() {
  const { user } = useAuth();
  const [savedPlans, setSavedPlans] = useState<SavedShipmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipment_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data properly
      setSavedPlans((data || []).map(plan => ({
        ...plan,
        shipment_state: plan.shipment_state as unknown as ShipmentState
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved plans.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const savePlan = useCallback(async (
    title: string,
    shipmentState: ShipmentState,
    generatedPlan: string | null,
    existingId?: string
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save plans.',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      if (existingId) {
        // Update existing plan
        const { error } = await supabase
          .from('shipment_plans')
          .update({
            title,
            shipment_state: shipmentState as unknown as Json,
            generated_plan: generatedPlan,
            status: generatedPlan ? 'completed' : 'draft',
          })
          .eq('id', existingId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: 'Saved',
          description: 'Plan updated successfully.',
        });
        
        await fetchPlans();
        return existingId;
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from('shipment_plans')
          .insert([{
            user_id: user.id,
            title,
            shipment_state: shipmentState as unknown as Json,
            generated_plan: generatedPlan,
            status: generatedPlan ? 'completed' : 'draft',
          }])
          .select('id')
          .single();

        if (error) throw error;
        
        toast({
          title: 'Saved',
          description: 'Plan saved successfully.',
        });
        
        await fetchPlans();
        return data?.id || null;
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save plan.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPlans]);

  const deletePlan = useCallback(async (planId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shipment_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: 'Deleted',
        description: 'Plan deleted successfully.',
      });
      
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPlans]);

  return {
    savedPlans,
    isLoading,
    fetchPlans,
    savePlan,
    deletePlan,
  };
}
