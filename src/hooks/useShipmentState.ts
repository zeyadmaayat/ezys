import { useState, useCallback, useMemo } from 'react';

export interface ShipmentState {
  // Step 1: Origin
  origin_country: string;
  origin_city_or_port: string;
  // Step 2: Destination
  destination_country: string;
  destination_city_or_port: string;
  // Step 3: Shipment basics
  shipment_type: 'Commercial' | 'Personal' | '';
  delivery_type: 'Door-to-Door' | 'Port-to-Port' | '';
  // Step 4: Cargo details
  product_category: string;
  hs_code: string;
  dangerous_goods: boolean;
  // Step 5: Size
  weight_kg: string;
  volume_cbm: string;
  cartons_count: string;
  // Step 6: Preference
  priority: 'Cheapest' | 'Fastest' | 'Balanced' | '';
  urgency_notes: string;
}

const initialState: ShipmentState = {
  origin_country: '',
  origin_city_or_port: '',
  destination_country: '',
  destination_city_or_port: '',
  shipment_type: '',
  delivery_type: '',
  product_category: '',
  hs_code: '',
  dangerous_goods: false,
  weight_kg: '',
  volume_cbm: '',
  cartons_count: '',
  priority: '',
  urgency_notes: '',
};

export function useShipmentState() {
  const [state, setState] = useState<ShipmentState>(initialState);

  const updateField = useCallback(<K extends keyof ShipmentState>(
    field: K,
    value: ShipmentState[K]
  ) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<ShipmentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Check which required fields are missing
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!state.origin_country) missing.push('origin_country');
    if (!state.destination_country) missing.push('destination_country');
    if (!state.shipment_type) missing.push('shipment_type');
    if (!state.product_category && !state.hs_code) missing.push('product_category');
    if (!state.weight_kg) missing.push('weight_kg');
    if (!state.volume_cbm && !state.cartons_count) missing.push('volume_or_cartons');
    if (!state.priority) missing.push('priority');
    if (!state.delivery_type) missing.push('delivery_type');
    return missing;
  }, [state]);

  const isComplete = missingFields.length === 0;

  // Convert state to text for AI context
  const toContextString = useCallback(() => {
    const parts: string[] = [];
    if (state.origin_country) {
      parts.push(`Origin: ${state.origin_country}${state.origin_city_or_port ? `, ${state.origin_city_or_port}` : ''}`);
    }
    if (state.destination_country) {
      parts.push(`Destination: ${state.destination_country}${state.destination_city_or_port ? `, ${state.destination_city_or_port}` : ''}`);
    }
    if (state.shipment_type) parts.push(`Shipment Type: ${state.shipment_type}`);
    if (state.delivery_type) parts.push(`Delivery Type: ${state.delivery_type}`);
    if (state.product_category) parts.push(`Product Category: ${state.product_category}`);
    if (state.hs_code) parts.push(`HS Code: ${state.hs_code}`);
    if (state.dangerous_goods) parts.push(`Dangerous Goods: Yes`);
    if (state.weight_kg) parts.push(`Weight: ${state.weight_kg} kg`);
    if (state.volume_cbm) parts.push(`Volume: ${state.volume_cbm} CBM`);
    if (state.cartons_count) parts.push(`Cartons: ${state.cartons_count}`);
    if (state.priority) parts.push(`Priority: ${state.priority}`);
    if (state.urgency_notes) parts.push(`Urgency Notes: ${state.urgency_notes}`);
    return parts.length > 0 ? parts.join('\n') : 'No shipment details provided yet.';
  }, [state]);

  return {
    state,
    updateField,
    updateMultiple,
    reset,
    missingFields,
    isComplete,
    toContextString,
  };
}

export type ShipmentStateHook = ReturnType<typeof useShipmentState>;
