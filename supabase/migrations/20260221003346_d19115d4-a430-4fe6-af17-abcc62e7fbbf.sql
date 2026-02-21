
-- =============================================
-- 1. Expenses table
-- =============================================
CREATE TYPE public.expense_category AS ENUM (
  'Freight', 'Customs', 'Insurance', 'Warehouse', 'Fuel', 
  'Maintenance', 'Salaries', 'Utilities', 'Office', 'Marketing', 'Other'
);

CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  expense_number TEXT NOT NULL DEFAULT '',
  category public.expense_category NOT NULL DEFAULT 'Other',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name TEXT,
  description TEXT,
  reference TEXT,
  po_id UUID REFERENCES public.purchase_orders(id),
  shipment_id UUID REFERENCES public.shipments_v2(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate expense numbers
CREATE SEQUENCE IF NOT EXISTS expense_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_expense_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.expense_number IS NULL OR NEW.expense_number = '' THEN
    NEW.expense_number := 'EXP-' || LPAD(nextval('expense_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_expense_number
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_expense_number();

-- Updated_at trigger
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company expenses"
  ON public.expenses FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Finance can manage expenses"
  ON public.expenses FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'))
  );

-- =============================================
-- 2. Link invoices_v2 to purchase_orders for three-way matching
-- =============================================
ALTER TABLE public.invoices_v2
  ADD COLUMN IF NOT EXISTS po_id UUID REFERENCES public.purchase_orders(id),
  ADD COLUMN IF NOT EXISTS grn_id UUID REFERENCES public.goods_receipts(id),
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);
