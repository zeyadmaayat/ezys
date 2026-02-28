import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';

export interface DpRiskAlert {
  id: string;
  company_id: string;
  driver_id: string | null;
  shipment_id: string | null;
  alert_type: string;
  message: string | null;
  created_at: string | null;
}

export function useDpRiskAlerts() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [alerts, setAlerts] = useState<DpRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user || !company) { setAlerts([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('dp_risk_alerts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAlerts((data || []) as DpRiskAlert[]);
    } catch (error) {
      console.error('Error fetching risk alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  return { alerts, loading, refetch: fetchAlerts };
}
