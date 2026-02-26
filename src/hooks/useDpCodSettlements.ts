import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';

export interface DpCodSettlement {
  id: string;
  company_id: string;
  driver_id: string;
  created_by: string | null;
  total_assigned: number | null;
  total_collected: number | null;
  variance: number | null;
  status: string | null;
  created_at: string | null;
  closed_at: string | null;
}

export interface DpCodSettlementLine {
  id: string;
  settlement_id: string;
  shipment_id: string;
  cod_amount: number;
  collected: boolean | null;
}

export function useDpCodSettlements() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [settlements, setSettlements] = useState<DpCodSettlement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    if (!user || !company) {
      setSettlements([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('dp_cod_settlements')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSettlements((data || []) as DpCodSettlement[]);
    } catch (error) {
      console.error('Error fetching COD settlements:', error);
      toast.error('Failed to load COD settlements');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const createSettlement = async (driverId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('dp_create_cod_settlement', {
        _driver_id: driverId,
      });
      if (error) throw error;
      toast.success('COD settlement created');
      await fetchSettlements();
      return data as string;
    } catch (error) {
      console.error('Error creating settlement:', error);
      toast.error('Failed to create settlement');
      return null;
    }
  };

  const getLines = async (settlementId: string): Promise<DpCodSettlementLine[]> => {
    try {
      const { data, error } = await supabase
        .from('dp_cod_settlement_lines')
        .select('*')
        .eq('settlement_id', settlementId);
      if (error) throw error;
      return (data || []) as DpCodSettlementLine[];
    } catch {
      return [];
    }
  };

  const markCollected = async (lineId: string, collected: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('dp_cod_settlement_lines')
        .update({ collected })
        .eq('id', lineId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating line:', error);
      return false;
    }
  };

  const closeSettlement = async (settlementId: string, totalCollected: number): Promise<boolean> => {
    try {
      const settlement = settlements.find(s => s.id === settlementId);
      const variance = totalCollected - (settlement?.total_assigned || 0);
      const { error } = await supabase
        .from('dp_cod_settlements')
        .update({
          status: 'CLOSED',
          total_collected: totalCollected,
          variance,
          closed_at: new Date().toISOString(),
        })
        .eq('id', settlementId);
      if (error) throw error;
      toast.success('Settlement closed');
      await fetchSettlements();
      return true;
    } catch (error) {
      console.error('Error closing settlement:', error);
      toast.error('Failed to close settlement');
      return false;
    }
  };

  useEffect(() => { fetchSettlements(); }, [fetchSettlements]);

  return {
    settlements,
    loading,
    createSettlement,
    getLines,
    markCollected,
    closeSettlement,
    refetch: fetchSettlements,
  };
}
