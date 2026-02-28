import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';

export interface DpDriverRiskScore {
  driver_id: string;
  company_id: string;
  risk_points: number | null;
  updated_at: string | null;
}

export function useDpDriverRiskScores() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [scores, setScores] = useState<DpDriverRiskScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!user || !company) { setScores([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('dp_driver_risk_score')
        .select('*')
        .eq('company_id', company.id);
      if (error) throw error;
      setScores((data || []) as DpDriverRiskScore[]);
    } catch (error) {
      console.error('Error fetching risk scores:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  const getScore = (driverId: string): number => {
    const s = scores.find(s => s.driver_id === driverId);
    return s?.risk_points || 0;
  };

  return { scores, loading, getScore, refetch: fetchScores };
}
