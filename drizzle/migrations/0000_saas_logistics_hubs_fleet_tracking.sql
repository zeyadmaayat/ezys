-- =========================================================
-- Phase 1: Warehouse/hub depth, Fleet, Real-time tracking
-- All additive. Tenant-scoped by company_id.
-- =========================================================

-- ---------- 1. Warehouse / hub depth ----------
ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS hub_type TEXT DEFAULT 'warehouse',
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS capacity_m3 NUMERIC,
  ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

CREATE TABLE IF NOT EXISTS public.warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT,
  zone_type TEXT DEFAULT 'storage',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouse_zones TO authenticated;
GRANT ALL ON public.warehouse_zones TO service_role;
ALTER TABLE public.warehouse_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wz_select" ON public.warehouse_zones FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wz_insert" ON public.warehouse_zones FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wz_update" ON public.warehouse_zones FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wz_delete" ON public.warehouse_zones FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.warehouse_bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.warehouse_zones(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  bin_type TEXT DEFAULT 'shelf',
  capacity_units NUMERIC,
  occupied_units NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouse_bins TO authenticated;
GRANT ALL ON public.warehouse_bins TO service_role;
ALTER TABLE public.warehouse_bins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wb_select" ON public.warehouse_bins FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wb_insert" ON public.warehouse_bins FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wb_update" ON public.warehouse_bins FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "wb_delete" ON public.warehouse_bins FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- ---------- 2. Fleet: drivers and vehicles ----------
CREATE TABLE IF NOT EXISTS public.fleet_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  license_expiry DATE,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_drivers TO authenticated;
GRANT ALL ON public.fleet_drivers TO service_role;
ALTER TABLE public.fleet_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fd_select" ON public.fleet_drivers FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fd_insert" ON public.fleet_drivers FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fd_update" ON public.fleet_drivers FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fd_delete" ON public.fleet_drivers FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'van',
  make_model TEXT,
  capacity_kg NUMERIC,
  capacity_m3 NUMERIC,
  odometer_km NUMERIC,
  insurance_expiry DATE,
  registration_expiry DATE,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, plate_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_vehicles TO authenticated;
GRANT ALL ON public.fleet_vehicles TO service_role;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fv_select" ON public.fleet_vehicles FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fv_insert" ON public.fleet_vehicles FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fv_update" ON public.fleet_vehicles FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fv_delete" ON public.fleet_vehicles FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- ---------- 3. Real-time shipment tracking ----------
ALTER TABLE public.shipments_v2
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.fleet_drivers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS current_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS last_position_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS origin_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS origin_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS destination_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS destination_lng NUMERIC;

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.shipments_v2(id) ON DELETE CASCADE,
  status TEXT,
  event_type TEXT NOT NULL DEFAULT 'status_change',
  description TEXT,
  location_text TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON public.shipment_events(shipment_id, created_at DESC);

GRANT SELECT, INSERT ON public.shipment_events TO authenticated;
GRANT ALL ON public.shipment_events TO service_role;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "se_select" ON public.shipment_events FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "se_insert" ON public.shipment_events FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.shipment_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.shipments_v2(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed_kmh NUMERIC,
  heading NUMERIC,
  source TEXT NOT NULL DEFAULT 'manual',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_positions_shipment ON public.shipment_positions(shipment_id, recorded_at DESC);

GRANT SELECT, INSERT ON public.shipment_positions TO authenticated;
GRANT ALL ON public.shipment_positions TO service_role;
ALTER TABLE public.shipment_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sp_select" ON public.shipment_positions FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "sp_insert" ON public.shipment_positions FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Keep shipments_v2 denormalised position in sync
CREATE OR REPLACE FUNCTION public.sync_shipment_last_position()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shipments_v2
     SET current_lat = NEW.latitude,
         current_lng = NEW.longitude,
         last_position_at = NEW.recorded_at
   WHERE id = NEW.shipment_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_shipment_last_position ON public.shipment_positions;
CREATE TRIGGER trg_sync_shipment_last_position
AFTER INSERT ON public.shipment_positions
FOR EACH ROW EXECUTE FUNCTION public.sync_shipment_last_position();

-- Auto-log a tracking event on every status change
CREATE OR REPLACE FUNCTION public.log_shipment_v2_status_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.shipment_events (company_id, shipment_id, status, event_type, description, created_by)
    VALUES (NEW.company_id, NEW.id, NEW.status::text, 'status_change',
            'Status changed to ' || NEW.status::text, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_shipment_v2_status_event ON public.shipments_v2;
CREATE TRIGGER trg_log_shipment_v2_status_event
AFTER UPDATE ON public.shipments_v2
FOR EACH ROW EXECUTE FUNCTION public.log_shipment_v2_status_event();

-- Realtime payloads
ALTER TABLE public.shipments_v2 REPLICA IDENTITY FULL;
ALTER TABLE public.shipment_events REPLICA IDENTITY FULL;
ALTER TABLE public.shipment_positions REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments_v2;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_positions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_wz_updated_at ON public.warehouse_zones;
CREATE TRIGGER trg_wz_updated_at BEFORE UPDATE ON public.warehouse_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wb_updated_at ON public.warehouse_bins;
CREATE TRIGGER trg_wb_updated_at BEFORE UPDATE ON public.warehouse_bins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_fd_updated_at ON public.fleet_drivers;
CREATE TRIGGER trg_fd_updated_at BEFORE UPDATE ON public.fleet_drivers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_fv_updated_at ON public.fleet_vehicles;
CREATE TRIGGER trg_fv_updated_at BEFORE UPDATE ON public.fleet_vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
