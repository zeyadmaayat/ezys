import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Inventory, InventoryLedgerEntry, InventoryMovementType } from '@/types/erp';

export function useInventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          item:items(*),
          location:locations(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setInventory((data || []) as Inventory[]);
    } catch (error: unknown) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const adjustInventory = async (
    itemId: string,
    locationId: string,
    quantity: number,
    movementType: InventoryMovementType,
    notes?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    try {
      // Calculate new quantity based on movement type
      const isAddition = ['Inbound', 'Return'].includes(movementType);
      const adjustedQuantity = isAddition ? quantity : -quantity;

      // Upsert inventory record
      const { data: currentInventory } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .single();

      const newQuantity = (currentInventory?.quantity || 0) + adjustedQuantity;

      if (newQuantity < 0) {
        toast.error('Insufficient stock');
        return false;
      }

      const { error: inventoryError } = await supabase
        .from('inventory')
        .upsert({
          item_id: itemId,
          location_id: locationId,
          quantity: newQuantity,
        }, {
          onConflict: 'item_id,location_id',
        });

      if (inventoryError) throw inventoryError;

      // Create ledger entry
      const { error: ledgerError } = await supabase
        .from('inventory_ledger')
        .insert({
          item_id: itemId,
          location_id: locationId,
          movement_type: movementType,
          quantity: adjustedQuantity,
          notes,
          created_by: user.id,
        });

      if (ledgerError) throw ledgerError;
      
      toast.success('Inventory updated');
      await fetchInventory();
      return true;
    } catch (error: unknown) {
      console.error('Error adjusting inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    }
  };

  const getStockByItem = (itemId: string): number => {
    return inventory
      .filter(inv => inv.item_id === itemId)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const getStockByLocation = (locationId: string): Inventory[] => {
    return inventory.filter(inv => inv.location_id === locationId);
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    adjustInventory,
    getStockByItem,
    getStockByLocation,
    refetch: fetchInventory,
  };
}

export function useInventoryLedger(itemId?: string, locationId?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<InventoryLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = useCallback(async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('inventory_ledger')
        .select(`
          *,
          item:items(*),
          location:locations(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (itemId) {
        query = query.eq('item_id', itemId);
      }
      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries((data || []) as InventoryLedgerEntry[]);
    } catch (error: unknown) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  }, [user, itemId, locationId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return { entries, loading, refetch: fetchLedger };
}
