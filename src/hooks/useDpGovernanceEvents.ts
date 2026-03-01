import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';

export interface DpGovernanceEvent {
  id: string;
  company_id: string;
  event_type: string;
  severity: string;
  driver_id: string | null;
  shipment_id: string | null;
  reference_id: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  severity_points: number | null;
  version: number | null;
  created_at: string | null;
}

export function useDpGovernanceEvents() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [events, setEvents] = useState<DpGovernanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user || !company) { setEvents([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('dp_governance_events')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setEvents((data || []) as DpGovernanceEvent[]);
    } catch (error) {
      console.error('Error fetching governance events:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}
