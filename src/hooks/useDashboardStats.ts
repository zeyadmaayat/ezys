import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import type { DashboardStats } from '@/types/saas-erp';

export function useDashboardStats() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    createdCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user || !company) {
      setLoading(false);
      return;
    }

    try {
      // Fetch shipments
      const { data: shipments } = await supabase
        .from('shipments_v2')
        .select('status')
        .eq('company_id', company.id);

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices_v2')
        .select('status, amount')
        .eq('company_id', company.id);

      const shipmentsData = shipments || [];
      const invoicesData = invoices || [];

      setStats({
        totalShipments: shipmentsData.length,
        createdCount: shipmentsData.filter(s => s.status === 'CREATED').length,
        inTransitCount: shipmentsData.filter(s => 
          ['PICKED_UP', 'IN_WAREHOUSE', 'OUT_FOR_DELIVERY'].includes(s.status)
        ).length,
        deliveredCount: shipmentsData.filter(s => s.status === 'DELIVERED').length,
        pendingInvoices: invoicesData.filter(i => ['Draft', 'Sent', 'Overdue'].includes(i.status)).length,
        paidInvoices: invoicesData.filter(i => i.status === 'Paid').length,
        totalRevenue: invoicesData
          .filter(i => i.status === 'Paid')
          .reduce((sum, i) => sum + Number(i.amount), 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
