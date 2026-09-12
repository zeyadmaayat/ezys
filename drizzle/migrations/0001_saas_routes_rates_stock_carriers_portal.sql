-- =========================================================
-- Phase 2: Routes, freight rates, live stock, carriers, portal
-- All additive, tenant-scoped.
-- =========================================================

-- ---------- Routes ----------
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  route_date DATE NOT NULL DEFAULT CURRENT_DATE,
  driver_id UUID REFERENCES public.fleet_drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE SET NULL,
  start_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_distance_km NUMERIC,
  total_duration_min NUMERIC,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT ALL ON public.routes TO service_role;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rt_select" ON public.routes FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rt_insert" ON public.routes FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rt_update" ON public.routes FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rt_delete" ON public.routes FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments_v2(id) ON DELETE SET NULL,
  sequence INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_from_prev_km NUMERIC,
  planned_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id, sequence);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_stops TO authenticated;
GRANT ALL ON public.route_stops TO service_role;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rs_select" ON public.route_stops FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rs_insert" ON public.route_stops FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rs_update" ON public.route_stops FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rs_delete" ON public.route_stops FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- ---------- Freight rating ----------
CREATE TABLE IF NOT EXISTS public.freight_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cities TEXT[] NOT NULL DEFAULT '{}',
  country TEXT NOT NULL DEFAULT 'JO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.freight_zones TO authenticated;
GRANT ALL ON public.freight_zones TO service_role;
ALTER TABLE public.freight_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fz_select" ON public.freight_zones FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fz_insert" ON public.freight_zones FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fz_update" ON public.freight_zones FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "fz_delete" ON public.freight_zones FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JOD',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  volumetric_divisor NUMERIC NOT NULL DEFAULT 5000,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_cards TO authenticated;
GRANT ALL ON public.rate_cards TO service_role;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rc_select" ON public.rate_cards FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rc_insert" ON public.rate_cards FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rc_update" ON public.rate_cards FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rc_delete" ON public.rate_cards FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.rate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  service_level TEXT NOT NULL DEFAULT 'standard',
  origin_zone_id UUID REFERENCES public.freight_zones(id) ON DELETE SET NULL,
  destination_zone_id UUID REFERENCES public.freight_zones(id) ON DELETE SET NULL,
  min_weight_kg NUMERIC NOT NULL DEFAULT 0,
  max_weight_kg NUMERIC,
  min_distance_km NUMERIC NOT NULL DEFAULT 0,
  max_distance_km NUMERIC,
  base_price NUMERIC NOT NULL DEFAULT 0,
  price_per_kg NUMERIC NOT NULL DEFAULT 0,
  price_per_km NUMERIC NOT NULL DEFAULT 0,
  min_charge NUMERIC NOT NULL DEFAULT 0,
  fuel_surcharge_pct NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_rules_card ON public.rate_rules(rate_card_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_rules TO authenticated;
GRANT ALL ON public.rate_rules TO service_role;
ALTER TABLE public.rate_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rr_select" ON public.rate_rules FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rr_insert" ON public.rate_rules FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rr_update" ON public.rate_rules FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "rr_delete" ON public.rate_rules FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.shipments_v2
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS volume_m3 NUMERIC,
  ADD COLUMN IF NOT EXISTS service_level TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC,
  ADD COLUMN IF NOT EXISTS quoted_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS quoted_currency TEXT;

-- ---------- Live stock ----------
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS bin_id UUID REFERENCES public.warehouse_bins(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;

UPDATE public.inventory i
   SET company_id = l.company_id
  FROM public.locations l
 WHERE i.location_id = l.id
   AND i.company_id IS NULL;

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  from_bin_id UUID REFERENCES public.warehouse_bins(id) ON DELETE SET NULL,
  to_bin_id UUID REFERENCES public.warehouse_bins(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES public.shipments_v2(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  reason TEXT NOT NULL DEFAULT 'adjustment',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_company ON public.stock_movements(company_id, created_at DESC);

GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sm_select" ON public.stock_movements FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "sm_insert" ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE TABLE IF NOT EXISTS public.stock_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  reorder_quantity NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_alert_rules TO authenticated;
GRANT ALL ON public.stock_alert_rules TO service_role;
ALTER TABLE public.stock_alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sar_select" ON public.stock_alert_rules FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "sar_insert" ON public.stock_alert_rules FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "sar_update" ON public.stock_alert_rules FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "sar_delete" ON public.stock_alert_rules FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.stock_movements REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ---------- Carrier integrations ----------
CREATE TABLE IF NOT EXISTS public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  credential_secret_name TEXT,
  account_number TEXT,
  tracking_url_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carriers TO authenticated;
GRANT ALL ON public.carriers TO service_role;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_select" ON public.carriers FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "ca_insert" ON public.carriers FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "ca_update" ON public.carriers FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "ca_delete" ON public.carriers FOR DELETE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

ALTER TABLE public.shipments_v2
  ADD COLUMN IF NOT EXISTS carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS carrier_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS carrier_last_status TEXT,
  ADD COLUMN IF NOT EXISTS carrier_last_synced_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.carrier_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES public.shipments_v2(id) ON DELETE SET NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  http_status INTEGER,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.carrier_sync_log TO authenticated;
GRANT ALL ON public.carrier_sync_log TO service_role;
ALTER TABLE public.carrier_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csl_select" ON public.carrier_sync_log FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- ---------- Customer portal tracking tokens ----------
CREATE TABLE IF NOT EXISTS public.tracking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.shipments_v2(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_tokens_shipment ON public.tracking_tokens(shipment_id);

-- No anon grant: the public portal reads through an edge function only.
GRANT SELECT, INSERT, UPDATE ON public.tracking_tokens TO authenticated;
GRANT ALL ON public.tracking_tokens TO service_role;
ALTER TABLE public.tracking_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tt_select" ON public.tracking_tokens FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "tt_insert" ON public.tracking_tokens FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "tt_update" ON public.tracking_tokens FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_routes_updated_at ON public.routes;
CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON public.routes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_route_stops_updated_at ON public.route_stops;
CREATE TRIGGER trg_route_stops_updated_at BEFORE UPDATE ON public.route_stops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_rate_cards_updated_at ON public.rate_cards;
CREATE TRIGGER trg_rate_cards_updated_at BEFORE UPDATE ON public.rate_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_rate_rules_updated_at ON public.rate_rules;
CREATE TRIGGER trg_rate_rules_updated_at BEFORE UPDATE ON public.rate_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_freight_zones_updated_at ON public.freight_zones;
CREATE TRIGGER trg_freight_zones_updated_at BEFORE UPDATE ON public.freight_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_carriers_updated_at ON public.carriers;
CREATE TRIGGER trg_carriers_updated_at BEFORE UPDATE ON public.carriers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sar_updated_at ON public.stock_alert_rules;
CREATE TRIGGER trg_sar_updated_at BEFORE UPDATE ON public.stock_alert_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
