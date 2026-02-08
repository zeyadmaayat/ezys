import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/erp';

interface UseCurrentUserRolesResult {
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasAllRoles: (roles: AppRole[]) => boolean;
  // Convenience role checks
  isAdmin: boolean;
  isOperations: boolean;
  isWarehouse: boolean;
  isFinance: boolean;
  isViewer: boolean;
  // Permission checks for SaaS features
  canManageShipments: boolean;
  canUpdateShipmentStatus: boolean;
  canManageClients: boolean;
  canManageWarehouses: boolean;
  canManageInvoices: boolean;
  canRecordPayments: boolean;
  canViewOnly: boolean;
  refetch: () => Promise<void>;
}

export function useCurrentUserRoles(): UseCurrentUserRolesResult {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      setRoles((data || []).map(r => r.role as AppRole));
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Role check utilities
  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const hasAnyRole = useCallback((checkRoles: AppRole[]) => 
    checkRoles.some(role => roles.includes(role)), [roles]);
  const hasAllRoles = useCallback((checkRoles: AppRole[]) => 
    checkRoles.every(role => roles.includes(role)), [roles]);

  // Convenience role checks
  const isAdmin = useMemo(() => hasRole('admin'), [hasRole]);
  const isOperations = useMemo(() => hasRole('operations'), [hasRole]);
  const isWarehouse = useMemo(() => hasRole('warehouse'), [hasRole]);
  const isFinance = useMemo(() => hasRole('finance'), [hasRole]);
  const isViewer = useMemo(() => hasRole('viewer'), [hasRole]);

  // Permission checks for SaaS features
  // Admin has all permissions, other roles have specific permissions
  const canManageShipments = useMemo(() => 
    isAdmin || isOperations, [isAdmin, isOperations]);
  
  const canUpdateShipmentStatus = useMemo(() => 
    isAdmin || isOperations || isWarehouse, [isAdmin, isOperations, isWarehouse]);
  
  const canManageClients = useMemo(() => 
    isAdmin || isOperations, [isAdmin, isOperations]);
  
  const canManageWarehouses = useMemo(() => 
    isAdmin || isWarehouse, [isAdmin, isWarehouse]);
  
  const canManageInvoices = useMemo(() => 
    isAdmin || isFinance, [isAdmin, isFinance]);
  
  const canRecordPayments = useMemo(() => 
    isAdmin || isFinance, [isAdmin, isFinance]);
  
  const canViewOnly = useMemo(() => 
    isViewer && !isAdmin && !isOperations && !isWarehouse && !isFinance, 
    [isViewer, isAdmin, isOperations, isWarehouse, isFinance]);

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isOperations,
    isWarehouse,
    isFinance,
    isViewer,
    canManageShipments,
    canUpdateShipmentStatus,
    canManageClients,
    canManageWarehouses,
    canManageInvoices,
    canRecordPayments,
    canViewOnly,
    refetch: fetchRoles,
  };
}
