// Domestic Pro Module Types

export type DpShipmentStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'RECEIVED_AT_ORIGIN'
  | 'IN_TRANSIT'
  | 'RECEIVED_AT_DESTINATION'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export type DpVehicleType = 'motorcycle' | 'sedan' | 'van' | 'pickup' | 'truck';

export const DP_STATUS_ORDER: DpShipmentStatus[] = [
  'CREATED',
  'PICKED_UP',
  'RECEIVED_AT_ORIGIN',
  'IN_TRANSIT',
  'RECEIVED_AT_DESTINATION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const DP_STATUS_LABELS: Record<DpShipmentStatus, string> = {
  CREATED: 'Created',
  PICKED_UP: 'Picked Up',
  RECEIVED_AT_ORIGIN: 'Received at Origin',
  IN_TRANSIT: 'In Transit',
  RECEIVED_AT_DESTINATION: 'Received at Destination',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
};

export const DP_VALID_TRANSITIONS: Record<DpShipmentStatus, DpShipmentStatus[]> = {
  CREATED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['RECEIVED_AT_ORIGIN', 'CANCELLED'],
  RECEIVED_AT_ORIGIN: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED_AT_DESTINATION', 'CANCELLED'],
  RECEIVED_AT_DESTINATION: ['OUT_FOR_DELIVERY', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

export const DP_VEHICLE_LABELS: Record<DpVehicleType, string> = {
  motorcycle: 'Motorcycle',
  sedan: 'Sedan',
  van: 'Van',
  pickup: 'Pickup Truck',
  truck: 'Truck',
};

// Entity interfaces
export interface DpZone {
  id: string;
  company_id: string;
  warehouse_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DpShelf {
  id: string;
  company_id: string;
  zone_id: string;
  name: string;
  code: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  zone?: DpZone;
}

export interface DpDriver {
  id: string;
  company_id: string;
  name: string;
  phone: string | null;
  vehicle_type: DpVehicleType;
  vehicle_plate: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DpShipment {
  id: string;
  company_id: string;
  barcode: string;
  sender_name: string;
  sender_phone: string | null;
  sender_address: string | null;
  sender_city: string | null;
  receiver_name: string;
  receiver_phone: string | null;
  receiver_address: string | null;
  receiver_city: string | null;
  origin_warehouse_id: string | null;
  current_warehouse_id: string | null;
  destination_warehouse_id: string | null;
  zone_id: string | null;
  shelf_id: string | null;
  driver_id: string | null;
  status: DpShipmentStatus;
  is_cod: boolean;
  cod_amount: number;
  weight_kg: number | null;
  pieces_count: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  origin_warehouse?: { id: string; name: string };
  destination_warehouse?: { id: string; name: string };
  current_warehouse?: { id: string; name: string };
  driver?: DpDriver;
  zone?: DpZone;
  shelf?: DpShelf;
}

export interface DpStatusLog {
  id: string;
  company_id: string;
  shipment_id: string;
  old_status: DpShipmentStatus | null;
  new_status: DpShipmentStatus;
  changed_by: string | null;
  warehouse_id: string | null;
  notes: string | null;
  created_at: string;
}

// Form input types
export interface CreateDpZoneInput {
  warehouse_id: string;
  name: string;
  code: string;
}

export interface CreateDpShelfInput {
  zone_id: string;
  name: string;
  code: string;
  capacity?: number;
}

export interface CreateDpDriverInput {
  name: string;
  phone?: string;
  vehicle_type: DpVehicleType;
  vehicle_plate?: string;
}

export interface CreateDpShipmentInput {
  sender_name: string;
  sender_phone?: string;
  sender_address?: string;
  sender_city?: string;
  receiver_name: string;
  receiver_phone?: string;
  receiver_address?: string;
  receiver_city?: string;
  origin_warehouse_id?: string;
  destination_warehouse_id?: string;
  driver_id?: string;
  is_cod?: boolean;
  cod_amount?: number;
  weight_kg?: number;
  pieces_count?: number;
  notes?: string;
}
