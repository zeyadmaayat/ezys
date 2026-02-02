// ERP Type Definitions

export type AppRole = 'admin' | 'operations' | 'warehouse' | 'finance' | 'viewer' | 'user';

export type OrderStatus = 'Draft' | 'Confirmed' | 'Cancelled' | 'ConvertedToShipment';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
export type InventoryMovementType = 'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment' | 'Return';
export type LocationType = 'warehouse' | 'distribution_center' | 'pickup_point' | 'customer_site';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  billing_address: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  location_type: LocationType;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  barcode: string | null;
  weight_kg: number | null;
  dimensions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  pickup_location_id: string | null;
  delivery_location_id: string | null;
  delivery_address: Record<string, unknown>;
  status: OrderStatus;
  notes: string | null;
  requested_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  pickup_location?: Location;
  delivery_location?: Location;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number | null;
  notes: string | null;
  created_at: string;
  item?: Item;
}

export interface Inventory {
  id: string;
  item_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  updated_at: string;
  item?: Item;
  location?: Location;
}

export interface InventoryLedgerEntry {
  id: string;
  item_id: string;
  location_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  item?: Item;
  location?: Location;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  shipment_id: string | null;
  order_id: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Extended Shipment type with new fields
export interface ExtendedShipment {
  id: string;
  plan_id: string | null;
  user_id: string;
  status: 'Planned' | 'Booked' | 'In_Transit' | 'Cleared' | 'Delivered';
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  order_id: string | null;
  tracking_number: string | null;
  driver_name: string | null;
  vehicle_plate: string | null;
  planned_pickup_date: string | null;
  planned_delivery_date: string | null;
  actual_pickup_at: string | null;
  actual_delivery_at: string | null;
  pod_image_url: string | null;
  pod_receiver_name: string | null;
  pod_signature: string | null;
  pod_notes: string | null;
  customer?: Customer;
  order?: Order;
}

// CSV Export utility type
export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}
