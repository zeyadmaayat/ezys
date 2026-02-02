import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Item } from '@/types/erp';
import type { Json } from '@/integrations/supabase/types';

export function useItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('sku');

      if (error) throw error;
      setItems((data || []) as Item[]);
    } catch (error: unknown) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createItem = async (item: Partial<Item>): Promise<Item | null> => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          sku: item.sku!,
          name: item.name!,
          description: item.description || null,
          unit: item.unit || 'pcs',
          barcode: item.barcode || null,
          weight_kg: item.weight_kg || null,
          dimensions: (item.dimensions || {}) as Json,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Item created');
      await fetchItems();
      return data as Item;
    } catch (error: unknown) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.dimensions) {
        updateData.dimensions = updates.dimensions as Json;
      }
      
      const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Item updated');
      await fetchItems();
      return true;
    } catch (error: unknown) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Item deleted');
      await fetchItems();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      return false;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
}
