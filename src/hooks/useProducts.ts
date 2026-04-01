import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';

export interface SalesProduct {
  id: string;
  company_id: string;
  category: string;
  subcategory: string | null;
  segment: string | null;
  name: string;
  speed: string | null;
  capacity: string | null;
  price_jd: number;
  sim_price_jd: number;
  includes_sim: boolean;
  includes_mifi: boolean;
  includes_router: boolean;
  includes_extender: boolean;
  includes_voip: boolean;
  includes_wifi_modem: boolean;
  device_info: string | null;
  customer_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const { user } = useAuth();
  const { company } = useCompany();
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) { setProducts([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('sales_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      setProducts((data || []) as SalesProduct[]);
    } catch (e) {
      console.error('Error fetching products:', e);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = [...new Set(products.map(p => p.category))];
  const getByCategory = (cat: string) => products.filter(p => p.category === cat);
  const getBySubcategory = (sub: string) => products.filter(p => p.subcategory === sub);

  return { products, loading, categories, getByCategory, getBySubcategory, refetch: fetchProducts };
}
