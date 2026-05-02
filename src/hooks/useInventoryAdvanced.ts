// Hooks for new inventory advanced features
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';

// =============== Reorder Rules ===============
export interface ReorderRule {
  id: string;
  company_id: string;
  item_id: string;
  location_id: string | null;
  min_quantity: number;
  max_quantity: number;
  reorder_quantity: number;
  preferred_vendor_id: string | null;
  lead_time_days: number;
  is_active: boolean;
  auto_create_po: boolean;
  created_at: string;
  item?: { id: string; sku: string; name: string };
  location?: { id: string; name: string };
}

export function useReorderRules() {
  const { user } = useAuth(); const { company } = useCompany();
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!user || !company) { setRules([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('inventory_reorder_rules')
        .select('*, item:items(id, sku, name), location:locations(id, name)')
        .eq('company_id', company.id).order('created_at', { ascending: false });
      if (error) throw error;
      setRules((data || []) as ReorderRule[]);
    } catch (e) { console.error(e); toast.error('Failed to load reorder rules'); }
    finally { setLoading(false); }
  }, [user, company]);

  const createRule = async (input: Partial<ReorderRule>) => {
    if (!company) return false;
    try {
      const { error } = await supabase.from('inventory_reorder_rules').insert({
        company_id: company.id,
        item_id: input.item_id!,
        location_id: input.location_id || null,
        min_quantity: input.min_quantity || 0,
        max_quantity: input.max_quantity || 0,
        reorder_quantity: input.reorder_quantity || 0,
        is_active: input.is_active ?? true,
      });
      if (error) throw error;
      toast.success('Reorder rule created'); await fetchRules(); return true;
    } catch (e) { toast.error('Failed to create rule'); return false; }
  };

  const deleteRule = async (id: string) => {
    try { await supabase.from('inventory_reorder_rules').delete().eq('id', id); toast.success('Deleted'); await fetchRules(); }
    catch { toast.error('Failed'); }
  };

  useEffect(() => { fetchRules(); }, [fetchRules]);
  return { rules, loading, createRule, deleteRule, refetch: fetchRules };
}

// =============== Inventory Transfers ===============
export interface InventoryTransfer {
  id: string; transfer_number: string; from_location_id: string; to_location_id: string;
  status: string; transfer_date: string; completed_at: string | null; notes: string | null;
  from_location?: { id: string; name: string }; to_location?: { id: string; name: string };
}

export function useInventoryTransfers() {
  const { user } = useAuth(); const { company } = useCompany();
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = useCallback(async () => {
    if (!user || !company) { setTransfers([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('inventory_transfers')
        .select('*, from_location:locations!inventory_transfers_from_location_id_fkey(id, name), to_location:locations!inventory_transfers_to_location_id_fkey(id, name)')
        .eq('company_id', company.id).order('created_at', { ascending: false });
      if (error) throw error;
      setTransfers((data || []) as InventoryTransfer[]);
    } catch (e) {
      // fallback without joins (no FK names)
      const { data } = await supabase.from('inventory_transfers').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
      setTransfers((data || []) as InventoryTransfer[]);
    }
    finally { setLoading(false); }
  }, [user, company]);

  const createTransfer = async (input: { from_location_id: string; to_location_id: string; lines: Array<{ item_id: string; quantity: number }>; notes?: string }) => {
    if (!company || !user) return false;
    try {
      const { data: t, error } = await supabase.from('inventory_transfers').insert({
        company_id: company.id, from_location_id: input.from_location_id, to_location_id: input.to_location_id,
        notes: input.notes || null, created_by: user.id,
      }).select().single();
      if (error) throw error;
      const lines = input.lines.map(l => ({ transfer_id: t.id, item_id: l.item_id, quantity: l.quantity }));
      await supabase.from('inventory_transfer_lines').insert(lines);
      toast.success('Transfer created'); await fetchTransfers(); return true;
    } catch { toast.error('Failed'); return false; }
  };

  const executeTransfer = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('execute_inventory_transfer', { _transfer_id: id });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) { toast.error(result.error || 'Failed'); return false; }
      toast.success('Transfer executed'); await fetchTransfers(); return true;
    } catch { toast.error('Failed'); return false; }
  };

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);
  return { transfers, loading, createTransfer, executeTransfer, refetch: fetchTransfers };
}

// =============== Cycle Count ===============
export interface CycleCountSession {
  id: string; session_number: string; location_id: string; status: string;
  started_at: string; closed_at: string | null; notes: string | null;
  location?: { id: string; name: string };
}

export function useCycleCount() {
  const { user } = useAuth(); const { company } = useCompany();
  const [sessions, setSessions] = useState<CycleCountSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user || !company) { setSessions([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('cycle_count_sessions')
        .select('*, location:locations(id, name)')
        .eq('company_id', company.id).order('started_at', { ascending: false });
      if (error) throw error;
      setSessions((data || []) as CycleCountSession[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user, company]);

  const createSession = async (location_id: string, notes?: string) => {
    if (!company || !user) return null;
    try {
      const { data, error } = await supabase.from('cycle_count_sessions').insert({
        company_id: company.id, location_id, started_by: user.id, notes: notes || null,
      }).select().single();
      if (error) throw error;
      // Seed lines from current inventory at this location
      const { data: invRows } = await supabase.from('inventory').select('item_id, quantity').eq('location_id', location_id);
      if (invRows && invRows.length) {
        const lines = invRows.map(r => ({ session_id: data.id, item_id: r.item_id, expected_quantity: r.quantity }));
        await supabase.from('cycle_count_lines').insert(lines);
      }
      toast.success('Session created'); await fetchSessions(); return data;
    } catch { toast.error('Failed'); return null; }
  };

  const closeSession = async (id: string) => {
    try { await supabase.from('cycle_count_sessions').update({ status: 'Closed', closed_at: new Date().toISOString() }).eq('id', id); toast.success('Closed'); await fetchSessions(); }
    catch { toast.error('Failed'); }
  };

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  return { sessions, loading, createSession, closeSession, refetch: fetchSessions };
}

// =============== Item Batches ===============
export interface ItemBatch {
  id: string; item_id: string; location_id: string;
  lot_number: string | null; serial_number: string | null;
  expiry_date: string | null; manufacture_date: string | null;
  quantity: number; unit_cost: number; status: string; notes: string | null;
  created_at: string;
  item?: { id: string; sku: string; name: string };
  location?: { id: string; name: string };
}

export function useItemBatches() {
  const { user } = useAuth(); const { company } = useCompany();
  const [batches, setBatches] = useState<ItemBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = useCallback(async () => {
    if (!user || !company) { setBatches([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('item_batches')
        .select('*, item:items(id, sku, name), location:locations(id, name)')
        .eq('company_id', company.id).order('expiry_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setBatches((data || []) as ItemBatch[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user, company]);

  const createBatch = async (input: Partial<ItemBatch>) => {
    if (!company) return false;
    try {
      const { error } = await supabase.from('item_batches').insert({
        company_id: company.id,
        item_id: input.item_id!,
        location_id: input.location_id!,
        lot_number: input.lot_number || null,
        serial_number: input.serial_number || null,
        expiry_date: input.expiry_date || null,
        quantity: input.quantity || 0,
        unit_cost: input.unit_cost || 0,
      });
      if (error) throw error;
      toast.success('Batch added'); await fetchBatches(); return true;
    } catch { toast.error('Failed'); return false; }
  };

  useEffect(() => { fetchBatches(); }, [fetchBatches]);
  return { batches, loading, createBatch, refetch: fetchBatches };
}
