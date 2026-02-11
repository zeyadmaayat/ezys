// SaaS Multi-Tenant ERP Type Definitions

export type CompanyPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type ClientType = 'CLIENT' | 'VENDOR';
export type ShipmentStatusV2 = 'CREATED' | 'PICKED_UP' | 'IN_WAREHOUSE' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check';
export type InvoiceStatusV2 = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

// Status flow order for validation
export const SHIPMENT_STATUS_ORDER: ShipmentStatusV2[] = [
  'CREATED',
  'PICKED_UP',
  'IN_WAREHOUSE',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatusV2, string> = {
  CREATED: 'Created',
  PICKED_UP: 'Picked Up',
  IN_WAREHOUSE: 'In Warehouse',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered'
};

export interface Company {
  id: string;
  name: string;
  logo: string | null;
  plan: CompanyPlan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  type: ClientType;
  email: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  company_id: string;
  name: string;
  location: string | null;
  address_line1: string | null;
  city: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShipmentV2 {
  id: string;
  company_id: string;
  client_id: string | null;
  warehouse_id: string | null;
  origin: string;
  destination: string;
  status: ShipmentStatusV2;
  expected_delivery: string | null;
  actual_delivery: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  client?: Client;
  warehouse?: Warehouse;
}

export interface InvoiceV2 {
  id: string;
  company_id: string;
  shipment_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatusV2;
  issued_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  shipment?: ShipmentV2;
}

export interface Payment {
  id: string;
  company_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
  created_by: string | null;
  created_at: string;
  // Joined relations
  invoice?: InvoiceV2;
}

// Dashboard stats
export interface DashboardStats {
  totalShipments: number;
  createdCount: number;
  inTransitCount: number;
  deliveredCount: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
}

// Form types
export interface CreateShipmentInput {
  client_id?: string;
  warehouse_id?: string;
  origin: string;
  destination: string;
  expected_delivery?: string;
  notes?: string;
}

export interface CreateClientInput {
  name: string;
  type: ClientType;
  email?: string;
  phone?: string;
  address?: Record<string, unknown>;
}

export interface CreateWarehouseInput {
  name: string;
  location?: string;
  address_line1?: string;
  city?: string;
  country?: string;
}

export interface CreateInvoiceInput {
  shipment_id: string;
  amount: number;
  currency?: string;
  due_date?: string;
  notes?: string;
}

export const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'JOD', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR'] as const;

export interface CreatePaymentInput {
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}
