import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';

export interface DpDashboardStats {
  totalShipments: number;
  created: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  returned: number;
  cancelled: number;
  totalDrivers: number;
  activeDrivers: number;
  totalCodPending: number;
}

export function useDpDashboardStats() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [stats, setStats] = useState<DpDashboardStats>({
    totalShipments: 0, created: 0, pickedUp: 0, inTransit: 0,
    delivered: 0, returned: 0, cancelled: 0,
    totalDrivers: 0, activeDrivers: 0, totalCodPending: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user || !company) { setLoading(false); return; }
    try {
      const [shipmentsRes, driversRes] = await Promise.all([
        supabase.from('dp_shipments').select('status, is_cod, cod_amount').eq('company_id', company.id),
        supabase.from('dp_drivers').select('is_active').eq('company_id', company.id),
      ]);

      const shipments = shipmentsRes.data || [];
      const drivers = driversRes.data || [];

      const countByStatus = (s: string) => shipments.filter(sh => sh.status === s).length;
      const codPending = shipments
        .filter(sh => sh.is_cod && sh.status !== 'DELIVERED' && sh.status !== 'CANCELLED')
        .reduce((sum, sh) => sum + (sh.cod_amount || 0), 0);

      setStats({
        totalShipments: shipments.length,
        created: countByStatus('CREATED'),
        pickedUp: countByStatus('PICKED_UP'),
        inTransit: countByStatus('IN_TRANSIT'),
        delivered: countByStatus('DELIVERED'),
        returned: countByStatus('RETURNED'),
        cancelled: countByStatus('CANCELLED'),
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.is_active).length,
        totalCodPending: codPending,
      });
    } catch (error) {
      console.error('Error fetching DP stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
