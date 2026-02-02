-- ============================================
-- LOGISTICS ERP DATABASE SCHEMA - PHASE 1B
-- ============================================

-- 1) CUSTOMERS TABLE
-- ============================================
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  billing_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  USING (true);

CREATE POLICY "Admin and Operations can manage customers"
  ON public.customers FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'));

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) CUSTOMER SHIPPING ADDRESSES
-- ============================================
CREATE TABLE public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Primary',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customer addresses"
  ON public.customer_addresses FOR SELECT
  USING (true);

CREATE POLICY "Admin and Operations can manage customer addresses"
  ON public.customer_addresses FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'));

-- 3) LOCATIONS/WAREHOUSES TABLE
-- ============================================
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'warehouse' CHECK (location_type IN ('warehouse', 'distribution_center', 'pickup_point', 'customer_site')),
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view locations"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Admin and Warehouse can manage locations"
  ON public.locations FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) ITEMS/SKUS TABLE
-- ============================================
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  barcode TEXT,
  weight_kg NUMERIC(10,3),
  dimensions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view items"
  ON public.items FOR SELECT
  USING (true);

CREATE POLICY "Admin and Warehouse can manage items"
  ON public.items FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) ORDER STATUS ENUM
-- ============================================
CREATE TYPE public.order_status AS ENUM ('Draft', 'Confirmed', 'Cancelled', 'ConvertedToShipment');

-- 6) ORDERS TABLE
-- ============================================
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  pickup_location_id UUID REFERENCES public.locations(id),
  delivery_location_id UUID REFERENCES public.locations(id),
  delivery_address JSONB DEFAULT '{}'::jsonb,
  status public.order_status NOT NULL DEFAULT 'Draft',
  notes TEXT,
  requested_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view orders"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Admin and Operations can manage orders"
  ON public.orders FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'));

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) ORDER ITEMS (LINE ITEMS)
-- ============================================
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view order items"
  ON public.order_items FOR SELECT
  USING (true);

CREATE POLICY "Admin and Operations can manage order items"
  ON public.order_items FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'));

-- 8) INVENTORY MOVEMENT TYPES
-- ============================================
CREATE TYPE public.inventory_movement_type AS ENUM ('Inbound', 'Outbound', 'Transfer', 'Adjustment', 'Return');

-- 9) INVENTORY TABLE (CURRENT STOCK)
-- ============================================
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, location_id)
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Admin and Warehouse can manage inventory"
  ON public.inventory FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10) INVENTORY LEDGER (MOVEMENT HISTORY)
-- ============================================
CREATE TABLE public.inventory_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  movement_type public.inventory_movement_type NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory ledger"
  ON public.inventory_ledger FOR SELECT
  USING (true);

CREATE POLICY "Admin and Warehouse can create ledger entries"
  ON public.inventory_ledger FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));

-- 11) INVOICE STATUS ENUM
-- ============================================
CREATE TYPE public.invoice_status AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled');

-- 12) INVOICES TABLE
-- ============================================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  shipment_id UUID REFERENCES public.shipments(id),
  order_id UUID REFERENCES public.orders(id),
  status public.invoice_status NOT NULL DEFAULT 'Draft',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices FOR SELECT
  USING (true);

CREATE POLICY "Admin and Finance can manage invoices"
  ON public.invoices FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13) INVOICE LINE ITEMS
-- ============================================
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (true);

CREATE POLICY "Admin and Finance can manage invoice items"
  ON public.invoice_items FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- 14) AUDIT LOG TABLE
-- ============================================
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit log"
  ON public.audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- 15) EXTEND SHIPMENTS TABLE
-- ============================================
ALTER TABLE public.shipments 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
  ADD COLUMN IF NOT EXISTS planned_pickup_date DATE,
  ADD COLUMN IF NOT EXISTS planned_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS actual_pickup_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pod_image_url TEXT,
  ADD COLUMN IF NOT EXISTS pod_receiver_name TEXT,
  ADD COLUMN IF NOT EXISTS pod_signature TEXT,
  ADD COLUMN IF NOT EXISTS pod_notes TEXT;

-- 16) AUTO-GENERATE ORDER NUMBERS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || LPAD(nextval('order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- 17) AUTO-GENERATE INVOICE NUMBERS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- 18) AUTO-GENERATE TRACKING NUMBERS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START WITH 10000;

CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TRK-' || LPAD(nextval('tracking_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_tracking_number
  BEFORE INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.generate_tracking_number();

-- 19) AUDIT LOG HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_log_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  INSERT INTO public.audit_log (user_id, user_email, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_user_id, v_user_email, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;