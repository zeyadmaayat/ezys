
-- =============================================
-- PROCUREMENT MODULE - Full Schema
-- =============================================

-- Sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS requisition_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS po_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS rtv_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS blanket_number_seq START WITH 1;

-- =============================================
-- 1. Purchase Requisitions (PR)
-- =============================================
CREATE TYPE public.requisition_status AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'Converted');
CREATE TYPE public.pr_priority AS ENUM ('Low', 'Normal', 'High', 'Urgent');

CREATE TABLE public.purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  requisition_number TEXT NOT NULL DEFAULT '',
  requested_by UUID NOT NULL,
  status public.requisition_status NOT NULL DEFAULT 'Draft',
  priority public.pr_priority NOT NULL DEFAULT 'Normal',
  required_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.requisition_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  estimated_unit_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate REQ number
CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.requisition_number IS NULL OR NEW.requisition_number = '' THEN
    NEW.requisition_number := 'REQ-' || LPAD(nextval('requisition_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_requisition_number
  BEFORE INSERT ON public.purchase_requisitions
  FOR EACH ROW EXECUTE FUNCTION public.generate_requisition_number();

-- =============================================
-- 2. Purchase Orders (PO)
-- =============================================
CREATE TYPE public.po_status AS ENUM ('Draft', 'Sent', 'Acknowledged', 'Partially_Received', 'Received', 'Closed', 'Cancelled');

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  po_number TEXT NOT NULL DEFAULT '',
  vendor_id UUID REFERENCES public.clients(id),
  requisition_id UUID REFERENCES public.purchase_requisitions(id),
  status public.po_status NOT NULL DEFAULT 'Draft',
  payment_terms TEXT,
  delivery_date DATE,
  currency TEXT NOT NULL DEFAULT 'SAR',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.po_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  line_number INT NOT NULL,
  item_id UUID REFERENCES public.items(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  received_quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate PO number
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := 'PO-' || LPAD(nextval('po_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_po_number();

-- =============================================
-- 3. Return to Vendor (RTV)
-- =============================================
CREATE TYPE public.rtv_status AS ENUM ('Draft', 'Approved', 'Shipped', 'Received_by_Vendor', 'Credited', 'Closed');
CREATE TYPE public.return_reason AS ENUM ('Defective', 'Wrong_Item', 'Damaged', 'Quality_Issue', 'Expired', 'Other');
CREATE TYPE public.rtv_resolution AS ENUM ('Replace', 'Refund', 'Credit');

CREATE TABLE public.return_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  rtv_number TEXT NOT NULL DEFAULT '',
  po_id UUID REFERENCES public.purchase_orders(id) NOT NULL,
  po_line_id UUID REFERENCES public.po_lines(id),
  vendor_id UUID REFERENCES public.clients(id),
  status public.rtv_status NOT NULL DEFAULT 'Draft',
  return_reason public.return_reason NOT NULL DEFAULT 'Defective',
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  tracking_number TEXT,
  credit_amount NUMERIC DEFAULT 0,
  resolution public.rtv_resolution,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate RTV number linked to PO
CREATE OR REPLACE FUNCTION public.generate_rtv_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  v_po_number TEXT;
  v_line_number INT;
BEGIN
  IF NEW.rtv_number IS NULL OR NEW.rtv_number = '' THEN
    SELECT po_number INTO v_po_number FROM public.purchase_orders WHERE id = NEW.po_id;
    IF NEW.po_line_id IS NOT NULL THEN
      SELECT line_number INTO v_line_number FROM public.po_lines WHERE id = NEW.po_line_id;
      NEW.rtv_number := v_po_number || '-' || v_line_number || 'R';
    ELSE
      NEW.rtv_number := v_po_number || '-R' || LPAD(nextval('rtv_number_seq')::text, 3, '0');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rtv_number
  BEFORE INSERT ON public.return_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_rtv_number();

-- =============================================
-- 4. Blanket / Standing Orders
-- =============================================
CREATE TYPE public.blanket_status AS ENUM ('Active', 'Paused', 'Expired', 'Cancelled');

CREATE TABLE public.blanket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  blanket_number TEXT NOT NULL DEFAULT '',
  vendor_id UUID REFERENCES public.clients(id),
  status public.blanket_status NOT NULL DEFAULT 'Active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  release_frequency_months INT NOT NULL DEFAULT 6,
  next_release_date DATE,
  currency TEXT NOT NULL DEFAULT 'SAR',
  total_contract_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blanket_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blanket_order_id UUID REFERENCES public.blanket_orders(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id),
  item_name TEXT NOT NULL,
  quantity_per_release NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_released NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blanket_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blanket_order_id UUID REFERENCES public.blanket_orders(id) ON DELETE CASCADE NOT NULL,
  po_id UUID REFERENCES public.purchase_orders(id),
  release_number INT NOT NULL,
  release_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate BLK number
CREATE OR REPLACE FUNCTION public.generate_blanket_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.blanket_number IS NULL OR NEW.blanket_number = '' THEN
    NEW.blanket_number := 'BLK-' || LPAD(nextval('blanket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blanket_number
  BEFORE INSERT ON public.blanket_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_blanket_number();

-- =============================================
-- 5. Internal Messages
-- =============================================
CREATE TABLE public.internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_entity ON public.internal_messages(entity_type, entity_id);

-- =============================================
-- RLS Policies
-- =============================================

-- Purchase Requisitions
ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view requisitions" ON public.purchase_requisitions
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can create requisitions" ON public.purchase_requisitions
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update requisitions" ON public.purchase_requisitions
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Requisition Lines
ALTER TABLE public.requisition_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via parent requisition" ON public.requisition_lines
  FOR ALL TO authenticated
  USING (requisition_id IN (SELECT id FROM public.purchase_requisitions WHERE company_id = public.get_user_company_id(auth.uid())))
  WITH CHECK (requisition_id IN (SELECT id FROM public.purchase_requisitions WHERE company_id = public.get_user_company_id(auth.uid())));

-- Purchase Orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view POs" ON public.purchase_orders
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can create POs" ON public.purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update POs" ON public.purchase_orders
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- PO Lines
ALTER TABLE public.po_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via parent PO" ON public.po_lines
  FOR ALL TO authenticated
  USING (po_id IN (SELECT id FROM public.purchase_orders WHERE company_id = public.get_user_company_id(auth.uid())))
  WITH CHECK (po_id IN (SELECT id FROM public.purchase_orders WHERE company_id = public.get_user_company_id(auth.uid())));

-- Return Orders
ALTER TABLE public.return_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view RTVs" ON public.return_orders
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can create RTVs" ON public.return_orders
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update RTVs" ON public.return_orders
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Blanket Orders
ALTER TABLE public.blanket_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view blankets" ON public.blanket_orders
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can create blankets" ON public.blanket_orders
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update blankets" ON public.blanket_orders
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Blanket Order Lines
ALTER TABLE public.blanket_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via parent blanket" ON public.blanket_order_lines
  FOR ALL TO authenticated
  USING (blanket_order_id IN (SELECT id FROM public.blanket_orders WHERE company_id = public.get_user_company_id(auth.uid())))
  WITH CHECK (blanket_order_id IN (SELECT id FROM public.blanket_orders WHERE company_id = public.get_user_company_id(auth.uid())));

-- Blanket Releases
ALTER TABLE public.blanket_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via parent blanket" ON public.blanket_releases
  FOR ALL TO authenticated
  USING (blanket_order_id IN (SELECT id FROM public.blanket_orders WHERE company_id = public.get_user_company_id(auth.uid())))
  WITH CHECK (blanket_order_id IN (SELECT id FROM public.blanket_orders WHERE company_id = public.get_user_company_id(auth.uid())));

-- Internal Messages
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view messages" ON public.internal_messages
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can create messages" ON public.internal_messages
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update messages" ON public.internal_messages
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_requisitions_updated_at BEFORE UPDATE ON public.purchase_requisitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_po_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rtv_updated_at BEFORE UPDATE ON public.return_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blanket_updated_at BEFORE UPDATE ON public.blanket_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
