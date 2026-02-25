
-- ============================================
-- DOMESTIC PRO MODULE - Phase 1 Foundation
-- ============================================

-- 1. Enum for domestic shipment statuses
CREATE TYPE dp_shipment_status AS ENUM (
  'CREATED',
  'PICKED_UP',
  'RECEIVED_AT_ORIGIN',
  'IN_TRANSIT',
  'RECEIVED_AT_DESTINATION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
  'CANCELLED'
);

-- 2. Enum for vehicle types
CREATE TYPE dp_vehicle_type AS ENUM (
  'motorcycle', 'sedan', 'van', 'pickup', 'truck'
);

-- 3. Zones table (within warehouses)
CREATE TABLE public.dp_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

ALTER TABLE public.dp_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company zones"
  ON public.dp_zones FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse can manage zones"
  ON public.dp_zones FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))
  )
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))
  );

-- 4. Shelves table (within zones)
CREATE TABLE public.dp_shelves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.dp_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  capacity INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(zone_id, code)
);

ALTER TABLE public.dp_shelves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company shelves"
  ON public.dp_shelves FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse can manage shelves"
  ON public.dp_shelves FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))
  )
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))
  );

-- 5. Drivers table
CREATE TABLE public.dp_drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_type dp_vehicle_type NOT NULL DEFAULT 'van',
  vehicle_plate TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dp_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company drivers"
  ON public.dp_drivers FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage drivers"
  ON public.dp_drivers FOR ALL
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
  )
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
  );

-- 6. Barcode sequence
CREATE SEQUENCE IF NOT EXISTS dp_barcode_seq START 100001;

-- 7. Domestic Pro Shipments
CREATE TABLE public.dp_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  
  -- Sender info
  sender_name TEXT NOT NULL,
  sender_phone TEXT,
  sender_address TEXT,
  sender_city TEXT,
  
  -- Receiver info
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT,
  receiver_address TEXT,
  receiver_city TEXT,
  
  -- Warehouse assignments
  origin_warehouse_id UUID REFERENCES public.warehouses(id),
  current_warehouse_id UUID REFERENCES public.warehouses(id),
  destination_warehouse_id UUID REFERENCES public.warehouses(id),
  zone_id UUID REFERENCES public.dp_zones(id),
  shelf_id UUID REFERENCES public.dp_shelves(id),
  
  -- Driver
  driver_id UUID REFERENCES public.dp_drivers(id),
  
  -- Status
  status dp_shipment_status NOT NULL DEFAULT 'CREATED',
  
  -- COD
  is_cod BOOLEAN NOT NULL DEFAULT false,
  cod_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- Package info
  weight_kg NUMERIC,
  pieces_count INT NOT NULL DEFAULT 1,
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, barcode)
);

ALTER TABLE public.dp_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company dp_shipments"
  ON public.dp_shipments FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can create dp_shipments"
  ON public.dp_shipments FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
  );

CREATE POLICY "Admin, Operations, Warehouse can update dp_shipments"
  ON public.dp_shipments FOR UPDATE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations') OR has_role(auth.uid(), 'warehouse'))
  );

CREATE POLICY "Admin can delete dp_shipments"
  ON public.dp_shipments FOR DELETE
  USING (
    company_id = get_user_company_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- 8. Barcode auto-generation trigger
CREATE OR REPLACE FUNCTION public.generate_dp_barcode()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
    NEW.barcode := 'DP-' || LPAD(nextval('dp_barcode_seq')::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_generate_dp_barcode
  BEFORE INSERT ON public.dp_shipments
  FOR EACH ROW EXECUTE FUNCTION public.generate_dp_barcode();

-- 9. Status transition validation trigger
CREATE OR REPLACE FUNCTION public.validate_dp_status_transition()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
DECLARE
  valid_transitions JSONB := '{
    "CREATED": ["PICKED_UP", "CANCELLED"],
    "PICKED_UP": ["RECEIVED_AT_ORIGIN", "CANCELLED"],
    "RECEIVED_AT_ORIGIN": ["IN_TRANSIT", "CANCELLED"],
    "IN_TRANSIT": ["RECEIVED_AT_DESTINATION", "CANCELLED"],
    "RECEIVED_AT_DESTINATION": ["OUT_FOR_DELIVERY", "RETURNED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "RETURNED"],
    "DELIVERED": [],
    "RETURNED": [],
    "CANCELLED": []
  }'::jsonb;
  allowed JSONB;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := valid_transitions -> OLD.status::text;

  IF allowed IS NULL OR NOT allowed ? NEW.status::text THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_validate_dp_status
  BEFORE UPDATE ON public.dp_shipments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_dp_status_transition();

-- 10. Status history / audit log
CREATE TABLE public.dp_shipment_status_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.dp_shipments(id) ON DELETE CASCADE,
  old_status dp_shipment_status,
  new_status dp_shipment_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  warehouse_id UUID REFERENCES public.warehouses(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dp_shipment_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company status log"
  ON public.dp_shipment_status_log FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "System can insert status log"
  ON public.dp_shipment_status_log FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- 11. Auto-log status changes trigger
CREATE OR REPLACE FUNCTION public.log_dp_status_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.dp_shipment_status_log (
    company_id, shipment_id, old_status, new_status, changed_by, warehouse_id
  ) VALUES (
    NEW.company_id, NEW.id, OLD.status, NEW.status, auth.uid(), NEW.current_warehouse_id
  );
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_log_dp_status_change
  AFTER UPDATE ON public.dp_shipments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_dp_status_change();

-- 12. Also log initial creation
CREATE OR REPLACE FUNCTION public.log_dp_shipment_created()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.dp_shipment_status_log (
    company_id, shipment_id, old_status, new_status, changed_by, warehouse_id
  ) VALUES (
    NEW.company_id, NEW.id, NULL, NEW.status, auth.uid(), NEW.origin_warehouse_id
  );
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_log_dp_shipment_created
  AFTER INSERT ON public.dp_shipments
  FOR EACH ROW EXECUTE FUNCTION public.log_dp_shipment_created();

-- 13. updated_at triggers
CREATE TRIGGER set_dp_zones_updated_at
  BEFORE UPDATE ON public.dp_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_dp_shelves_updated_at
  BEFORE UPDATE ON public.dp_shelves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_dp_drivers_updated_at
  BEFORE UPDATE ON public.dp_drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_dp_shipments_updated_at
  BEFORE UPDATE ON public.dp_shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Indexes for performance
CREATE INDEX idx_dp_zones_company ON public.dp_zones(company_id);
CREATE INDEX idx_dp_zones_warehouse ON public.dp_zones(warehouse_id);
CREATE INDEX idx_dp_shelves_company ON public.dp_shelves(company_id);
CREATE INDEX idx_dp_shelves_zone ON public.dp_shelves(zone_id);
CREATE INDEX idx_dp_drivers_company ON public.dp_drivers(company_id);
CREATE INDEX idx_dp_shipments_company ON public.dp_shipments(company_id);
CREATE INDEX idx_dp_shipments_status ON public.dp_shipments(company_id, status);
CREATE INDEX idx_dp_shipments_barcode ON public.dp_shipments(barcode);
CREATE INDEX idx_dp_shipments_driver ON public.dp_shipments(driver_id);
CREATE INDEX idx_dp_shipments_origin_wh ON public.dp_shipments(origin_warehouse_id);
CREATE INDEX idx_dp_shipments_dest_wh ON public.dp_shipments(destination_warehouse_id);
CREATE INDEX idx_dp_status_log_shipment ON public.dp_shipment_status_log(shipment_id);
CREATE INDEX idx_dp_status_log_company ON public.dp_shipment_status_log(company_id);
