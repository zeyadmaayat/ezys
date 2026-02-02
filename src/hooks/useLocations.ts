import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Location, LocationType } from '@/types/erp';

export function useLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLocations((data || []) as Location[]);
    } catch (error: unknown) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createLocation = async (location: Partial<Location>): Promise<Location | null> => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: location.name!,
          location_type: location.location_type || 'warehouse',
          address_line1: location.address_line1,
          address_line2: location.address_line2,
          city: location.city,
          state: location.state,
          postal_code: location.postal_code,
          country: location.country || 'SA',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Location created');
      await fetchLocations();
      return data as Location;
    } catch (error: unknown) {
      console.error('Error creating location:', error);
      toast.error('Failed to create location');
      return null;
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Location updated');
      await fetchLocations();
      return true;
    } catch (error: unknown) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
      return false;
    }
  };

  const deleteLocation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Location deleted');
      await fetchLocations();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
      return false;
    }
  };

  const getLocationsByType = (type: LocationType) => {
    return locations.filter(loc => loc.location_type === type);
  };

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationsByType,
    refetch: fetchLocations,
  };
}
