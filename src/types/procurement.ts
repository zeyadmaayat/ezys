// Procurement Module Type Definitions

export type RequisitionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted';
export type PRPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partially_Received' | 'Received' | 'Closed' | 'Cancelled';
export type RTVStatus = 'Draft' | 'Approved' | 'Shipped' | 'Received_by_Vendor' | 'Credited' | 'Closed';
export type ReturnReason = 'Defective' | 'Wrong_Item' | 'Damaged' | 'Quality_Issue' | 'Expired' | 'Other';
export type RTVResolution = 'Replace' | 'Refund' | 'Credit';
export type BlanketStatus = 'Active' | 'Paused' | 'Expired' | 'Cancelled';

export interface PurchaseRequisition {
  id: string;
  company_id: string;
  requisition_number: string;
  requested_by: string;
  status: RequisitionStatus;
  priority: PRPriority;
  required_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lines?: RequisitionLine[];
}

export interface RequisitionLine {
  id: string;
  requisition_id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_unit_price: number;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  company_id: string;
  po_number: string;
  vendor_id: string | null;
  requisition_id: string | null;
  status: POStatus;
  payment_terms: string | null;
  delivery_date: string | null;
  currency: string;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  vendor?: { id: string; name: string; type: string };
  requisition?: PurchaseRequisition;
  po_lines?: POLine[];
}

export interface POLine {
  id: string;
  po_id: string;
  line_number: number;
  item_id: string | null;
  item_name: string;
  quantity: number;
  received_quantity: number;
  unit: string;
  unit_price: number;
  notes: string | null;
  created_at: string;
}

export interface ReturnOrder {
  id: string;
  company_id: string;
  rtv_number: string;
  po_id: string;
  po_line_id: string | null;
  vendor_id: string | null;
  status: RTVStatus;
  return_reason: ReturnReason;
  quantity: number;
  unit: string;
  tracking_number: string | null;
  credit_amount: number;
  resolution: RTVResolution | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  purchase_order?: PurchaseOrder;
  vendor?: { id: string; name: string };
  po_line?: POLine;
}

export interface BlanketOrder {
  id: string;
  company_id: string;
  blanket_number: string;
  vendor_id: string | null;
  status: BlanketStatus;
  start_date: string;
  end_date: string;
  release_frequency_months: number;
  next_release_date: string | null;
  currency: string;
  total_contract_value: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  vendor?: { id: string; name: string };
  blanket_order_lines?: BlanketOrderLine[];
  blanket_releases?: BlanketRelease[];
}

export interface BlanketOrderLine {
  id: string;
  blanket_order_id: string;
  item_id: string | null;
  item_name: string;
  quantity_per_release: number;
  unit: string;
  unit_price: number;
  total_released: number;
  notes: string | null;
  created_at: string;
}

export interface BlanketRelease {
  id: string;
  blanket_order_id: string;
  po_id: string | null;
  release_number: number;
  release_date: string;
  status: string;
  created_at: string;
}

export interface InternalMessage {
  id: string;
  company_id: string;
  entity_type: string;
  entity_id: string;
  sender_id: string;
  sender_name: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
