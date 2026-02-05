-- =====================================================
-- PHASE 1: MULTI-TENANT SAAS ERP SCHEMA
-- =====================================================

-- 1. Create new enums
CREATE TYPE public.company_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE public.client_type AS ENUM ('CLIENT', 'VENDOR');
CREATE TYPE public.shipment_status_v2 AS ENUM ('CREATED', 'PICKED_UP', 'IN_WAREHOUSE', 'OUT_FOR_DELIVERY', 'DELIVERED');
CREATE TYPE public.payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'check');

-- 2. Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  plan company_plan NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add company_id to profiles (link users to companies)
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 4. Create clients table (replaces customers for multi-tenant)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type client_type NOT NULL DEFAULT 'CLIENT',
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  address_line1 TEXT,
  city TEXT,
  country TEXT DEFAULT 'SA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create shipments_v2 table with proper multi-tenant structure
CREATE TABLE public.shipments_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  warehouse_id UUID REFERENCES public.warehouses(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status shipment_status_v2 NOT NULL DEFAULT 'CREATED',
  expected_delivery DATE,
  actual_delivery TIMESTAMPTZ,
  tracking_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate tracking number for shipments_v2
CREATE SEQUENCE IF NOT EXISTS shipment_v2_tracking_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_shipment_tracking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := 'SHP-' || LPAD(nextval('shipment_v2_tracking_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_shipment_tracking
  BEFORE INSERT ON public.shipments_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_shipment_tracking();

-- 7. Create invoices_v2 table linked to shipments_v2
CREATE TABLE public.invoices_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments_v2(id),
  invoice_number TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'Draft',
  issued_at TIMESTAMPTZ,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate invoice number for invoices_v2
CREATE SEQUENCE IF NOT EXISTS invoice_v2_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_v2_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_v2_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_invoice_v2_number
  BEFORE INSERT ON public.invoices_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_v2_number();

-- 8. Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices_v2(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method payment_method NOT NULL DEFAULT 'bank_transfer',
  reference TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipments_v2_updated_at BEFORE UPDATE ON public.shipments_v2
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_v2_updated_at BEFORE UPDATE ON public.invoices_v2
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. HELPER FUNCTION: Get user's company_id
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id
$$;

-- =====================================================
-- 11. RLS POLICIES - COMPANY ISOLATION
-- =====================================================

-- Companies: Only admins can manage, users can view their own company
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage companies"
  ON public.companies FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Clients: Company-scoped access
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company clients"
  ON public.clients FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage clients"
  ON public.clients FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
  );

-- Warehouses: Company-scoped access
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company warehouses"
  ON public.warehouses FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse can manage warehouses"
  ON public.warehouses FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))
  );

-- Shipments_v2: Company-scoped with role restrictions
ALTER TABLE public.shipments_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company shipments"
  ON public.shipments_v2 FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can create shipments"
  ON public.shipments_v2 FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
  );

CREATE POLICY "Admin, Operations, Warehouse can update shipments"
  ON public.shipments_v2 FOR UPDATE
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations') OR has_role(auth.uid(), 'warehouse'))
  );

CREATE POLICY "Admin can delete shipments"
  ON public.shipments_v2 FOR DELETE
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    has_role(auth.uid(), 'admin')
  );

-- Invoices_v2: Company-scoped, Finance role
ALTER TABLE public.invoices_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company invoices"
  ON public.invoices_v2 FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Finance can manage invoices"
  ON public.invoices_v2 FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'))
  );

-- Payments: Company-scoped, Finance role
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company payments"
  ON public.payments FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Finance can manage payments"
  ON public.payments FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid()) AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'))
  );

-- =====================================================
-- 12. SHIPMENT STATUS VALIDATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_shipment_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  status_order TEXT[] := ARRAY['CREATED', 'PICKED_UP', 'IN_WAREHOUSE', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  old_idx INT;
  new_idx INT;
BEGIN
  -- Find indices
  old_idx := array_position(status_order, OLD.status::text);
  new_idx := array_position(status_order, NEW.status::text);
  
  -- Status can only move forward, not backward
  IF new_idx < old_idx THEN
    RAISE EXCEPTION 'Invalid status transition: cannot move from % to %', OLD.status, NEW.status;
  END IF;
  
  -- Status can only advance by one step at a time
  IF new_idx > old_idx + 1 THEN
    RAISE EXCEPTION 'Invalid status transition: cannot skip from % to %', OLD.status, NEW.status;
  END IF;
  
  -- Set actual_delivery when status becomes DELIVERED
  IF NEW.status = 'DELIVERED' AND OLD.status != 'DELIVERED' THEN
    NEW.actual_delivery := now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_shipment_status
  BEFORE UPDATE ON public.shipments_v2
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_shipment_status_transition();

-- =====================================================
-- 13. AUDIT LOGGING ENHANCEMENT
-- =====================================================
-- Add company_id to audit_log for multi-tenant filtering
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Update RLS on audit_log for company isolation
DROP POLICY IF EXISTS "Admin can view audit log" ON public.audit_log;

CREATE POLICY "Admin can view own company audit log"
  ON public.audit_log FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') AND
    (company_id IS NULL OR company_id = get_user_company_id(auth.uid()))
  );

-- =====================================================
-- 14. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_warehouses_company_id ON public.warehouses(company_id);
CREATE INDEX idx_shipments_v2_company_id ON public.shipments_v2(company_id);
CREATE INDEX idx_shipments_v2_status ON public.shipments_v2(status);
CREATE INDEX idx_invoices_v2_company_id ON public.invoices_v2(company_id);
CREATE INDEX idx_invoices_v2_shipment_id ON public.invoices_v2(shipment_id);
CREATE INDEX idx_payments_company_id ON public.payments(company_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_audit_log_company_id ON public.audit_log(company_id);