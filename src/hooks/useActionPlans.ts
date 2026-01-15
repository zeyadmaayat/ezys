import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActionPlan, ActionStep } from '@/types/action-plan';
import { toast } from 'sonner';

interface DatabaseActionPlan {
  id: string;
  user_id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  category: string;
  difficulty: string;
  estimated_time_en: string | null;
  estimated_time_ar: string | null;
  actions: ActionStep[];
  created_at: string;
  updated_at: string;
}

export const useActionPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedPlans: ActionPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        title_en: plan.title_en,
        title_ar: plan.title_ar,
        description_en: plan.description_en || '',
        description_ar: plan.description_ar || '',
        category: plan.category as ActionPlan['category'],
        difficulty: plan.difficulty as ActionPlan['difficulty'],
        estimatedTime_en: plan.estimated_time_en || '',
        estimatedTime_ar: plan.estimated_time_ar || '',
        actions: plan.actions || [],
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      }));

      setPlans(mappedPlans);
    } catch (error: any) {
      console.error('Error fetching action plans:', error);
      toast.error('Failed to load action plans');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: ActionPlan): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to save action plans');
      return false;
    }

    try {
      const { error } = await supabase
        .from('action_plans')
        .insert({
          user_id: user.id,
          title_en: plan.title_en,
          title_ar: plan.title_ar,
          description_en: plan.description_en,
          description_ar: plan.description_ar,
          category: plan.category,
          difficulty: plan.difficulty,
          estimated_time_en: plan.estimatedTime_en,
          estimated_time_ar: plan.estimatedTime_ar,
          actions: plan.actions as any
        });

      if (error) throw error;

      toast.success('Action plan saved successfully');
      await fetchPlans();
      return true;
    } catch (error: any) {
      console.error('Error saving action plan:', error);
      toast.error('Failed to save action plan');
      return false;
    }
  };

  const updatePlan = async (id: string, plan: Partial<ActionPlan>): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update action plans');
      return false;
    }

    try {
      const updateData: Record<string, any> = {};
      if (plan.title_en !== undefined) updateData.title_en = plan.title_en;
      if (plan.title_ar !== undefined) updateData.title_ar = plan.title_ar;
      if (plan.description_en !== undefined) updateData.description_en = plan.description_en;
      if (plan.description_ar !== undefined) updateData.description_ar = plan.description_ar;
      if (plan.category !== undefined) updateData.category = plan.category;
      if (plan.difficulty !== undefined) updateData.difficulty = plan.difficulty;
      if (plan.estimatedTime_en !== undefined) updateData.estimated_time_en = plan.estimatedTime_en;
      if (plan.estimatedTime_ar !== undefined) updateData.estimated_time_ar = plan.estimatedTime_ar;
      if (plan.actions !== undefined) updateData.actions = plan.actions;

      const { error } = await supabase
        .from('action_plans')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Action plan updated successfully');
      await fetchPlans();
      return true;
    } catch (error: any) {
      console.error('Error updating action plan:', error);
      toast.error('Failed to update action plan');
      return false;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete action plans');
      return false;
    }

    try {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Action plan deleted successfully');
      await fetchPlans();
      return true;
    } catch (error: any) {
      console.error('Error deleting action plan:', error);
      toast.error('Failed to delete action plan');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    } else {
      setPlans([]);
    }
  }, [user]);

  return {
    plans,
    loading,
    fetchPlans,
    savePlan,
    updatePlan,
    deletePlan
  };
};
