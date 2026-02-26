import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';

export interface DpInventorySession {
  id: string;
  company_id: string;
  warehouse_id: string;
  started_by: string | null;
  status: string | null;
  created_at: string | null;
  closed_at: string | null;
}

export interface DpInventoryScan {
  id: string;
  company_id: string;
  session_id: string;
  shipment_id: string;
  scanned_by: string | null;
  scanned_at: string | null;
}

export interface DpInventorySummary {
  expected_count: number;
  scanned_count: number;
  missing_count: number;
}

export function useDpInventory() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [sessions, setSessions] = useState<DpInventorySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user || !company) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('dp_inventory_sessions')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSessions((data || []) as DpInventorySession[]);
    } catch (error) {
      console.error('Error fetching inventory sessions:', error);
      toast.error('Failed to load inventory sessions');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createSession = async (warehouseId: string): Promise<DpInventorySession | null> => {
    if (!user || !company) return null;
    try {
      const { data, error } = await supabase
        .from('dp_inventory_sessions')
        .insert({
          company_id: company.id,
          warehouse_id: warehouseId,
          started_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success('Inventory session started');
      await fetchSessions();
      return data as DpInventorySession;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to start inventory session');
      return null;
    }
  };

  const closeSession = async (sessionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('dp_inventory_sessions')
        .update({ status: 'CLOSED', closed_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
      toast.success('Session closed');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
      return false;
    }
  };

  const scanBarcode = async (sessionId: string, barcode: string): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('dp_scan_inventory', {
        _session_id: sessionId,
        _barcode: barcode,
      });
      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('Error scanning:', error);
      return 'ERROR';
    }
  };

  const getSummary = async (sessionId: string): Promise<DpInventorySummary | null> => {
    try {
      const { data, error } = await supabase.rpc('dp_inventory_summary', {
        _session_id: sessionId,
      });
      if (error) throw error;
      const rows = data as unknown as DpInventorySummary[];
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting summary:', error);
      return null;
    }
  };

  const getScans = async (sessionId: string): Promise<DpInventoryScan[]> => {
    try {
      const { data, error } = await supabase
        .from('dp_inventory_scans')
        .select('*')
        .eq('session_id', sessionId)
        .order('scanned_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DpInventoryScan[];
    } catch {
      return [];
    }
  };

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return {
    sessions,
    loading,
    createSession,
    closeSession,
    scanBarcode,
    getSummary,
    getScans,
    refetch: fetchSessions,
  };
}
