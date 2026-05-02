import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ScanType = 'product' | 'invoice' | 'document' | 'shipment_label';

export interface VisionResult {
  detected?: boolean;
  matched_item_sku?: string;
  matched_item_name?: string;
  matched_item_id?: string;
  detected_quantity?: number;
  confidence?: number;
  suggested_location_id?: string;
  suggested_location_name?: string;
  suggested_action?: 'add' | 'avoid' | 'place_on_shelf' | 'unknown';
  reasoning?: string;
  current_stock_advice?: string;
  total_quantity_on_hand?: number;
  current_stock?: Array<{ quantity: number; location: { name: string } | null }>;
  // Invoice fields
  vendor_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  total?: number;
  currency?: string;
  line_items?: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
  [k: string]: unknown;
}

export function useVisionScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);

  const scan = useCallback(async (imageBase64: string, scanType: ScanType, language: 'ar' | 'en' = 'en') => {
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-vision', {
        body: { image_base64: imageBase64, scan_type: scanType, language },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scan failed');
      setResult(data.result);
      return data.result as VisionResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Scan failed';
      toast.error(msg);
      return null;
    } finally {
      setScanning(false);
    }
  }, []);

  const reset = useCallback(() => setResult(null), []);

  return { scan, scanning, result, reset };
}
