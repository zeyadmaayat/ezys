export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social_media' | 'exhibition' | 'other';
export type QuotationStatus = 'draft' | 'sent' | 'confirmed' | 'cancelled';

export interface SalesLead {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  source: LeadSource;
  status: LeadStatus;
  assigned_to: string | null;
  expected_revenue: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  source?: LeadSource;
  expected_revenue?: number;
  notes?: string;
}

export interface SalesQuotation {
  id: string;
  company_id: string;
  quotation_number: string;
  client_id: string | null;
  lead_id: string | null;
  status: QuotationStatus;
  issue_date: string;
  expiry_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesQuotationLine {
  id: string;
  quotation_id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
  unit: string;
  created_at: string;
}
