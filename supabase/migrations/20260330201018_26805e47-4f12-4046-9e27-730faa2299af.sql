
-- =============================================
-- SALES / CRM MODULE TABLES
-- =============================================

-- 1) Sales Leads
CREATE TABLE public.sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  name text NOT NULL,
  email text,
  phone text,
  company_name text,
  source text DEFAULT 'website',
  status text DEFAULT 'new',
  assigned_to uuid,
  expected_revenue numeric DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company leads"
  ON public.sales_leads FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage leads"
  ON public.sales_leads FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')))
  WITH CHECK (company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')));

-- 2) Sales Quotations
CREATE TABLE public.sales_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  quotation_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id),
  lead_id uuid REFERENCES public.sales_leads(id),
  status text DEFAULT 'draft',
  issue_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  currency text DEFAULT 'SAR',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company quotations"
  ON public.sales_quotations FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage quotations"
  ON public.sales_quotations FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')))
  WITH CHECK (company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations')));

-- 3) Sales Quotation Lines
CREATE TABLE public.sales_quotation_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.sales_quotations(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id),
  item_name text NOT NULL,
  quantity numeric DEFAULT 1,
  unit_price numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  unit text DEFAULT 'pcs',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_quotation_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access via parent quotation"
  ON public.sales_quotation_lines FOR ALL TO authenticated
  USING (quotation_id IN (
    SELECT id FROM public.sales_quotations
    WHERE company_id = get_user_company_id(auth.uid())
  ))
  WITH CHECK (quotation_id IN (
    SELECT id FROM public.sales_quotations
    WHERE company_id = get_user_company_id(auth.uid())
  ));
