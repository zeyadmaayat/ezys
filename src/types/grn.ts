export type GRNStatus = 'Draft' | 'Posted';

export interface GoodsReceipt {
  id: string;
  company_id: string;
  grn_number: string;
  po_id: string;
  received_date: string;
  warehouse_id: string | null;
  status: GRNStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  purchase_order?: {
    id: string;
    po_number: string;
    vendor_id: string | null;
    vendor?: { id: string; name: string };
  };
  warehouse?: { id: string; name: string } | null;
  goods_receipt_lines?: GoodsReceiptLine[];
}

export interface GoodsReceiptLine {
  id: string;
  grn_id: string;
  po_line_id: string;
  item_id: string | null;
  item_name: string;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  unit: string;
  rejection_reason: string | null;
  created_at: string;
}
