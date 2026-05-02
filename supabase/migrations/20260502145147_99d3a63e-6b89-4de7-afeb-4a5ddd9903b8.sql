
-- =========================================================
-- ITEM BATCHES (Lot/Serial/Expiry tracking)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.item_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  item_id UUID NOT NULL,
  location_id UUID NOT NULL,
  lot_number TEXT,
  serial_number TEXT,
  expiry_date DATE,
  manufacture_date DATE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, consumed, blocked
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_batches_company ON public.item_batches(company_id);
CREATE INDEX IF NOT EXISTS idx_item_batches_item ON public.item_batches(item_id);
CREATE INDEX IF NOT EXISTS idx_item_batches_location ON public.item_batches(location_id);
CREATE INDEX IF NOT EXISTS idx_item_batches_expiry ON public.item_batches(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_item_batches_status ON public.item_batches(status);

ALTER TABLE public.item_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view batches" ON public.item_batches
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse manage batches" ON public.item_batches
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)));

-- =========================================================
-- REORDER RULES (Min/Max stock + Auto PO)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.inventory_reorder_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  item_id UUID NOT NULL,
  location_id UUID,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  max_quantity NUMERIC NOT NULL DEFAULT 0,
  reorder_quantity NUMERIC NOT NULL DEFAULT 0,
  preferred_vendor_id UUID,
  lead_time_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_create_po BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, item_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_reorder_company ON public.inventory_reorder_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_reorder_item ON public.inventory_reorder_rules(item_id);

ALTER TABLE public.inventory_reorder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view reorder rules" ON public.inventory_reorder_rules
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse manage reorder rules" ON public.inventory_reorder_rules
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)));

-- =========================================================
-- INVENTORY TRANSFERS (between locations)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  transfer_number TEXT NOT NULL DEFAULT '',
  from_location_id UUID NOT NULL,
  to_location_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft', -- Draft, In_Transit, Done, Cancelled
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_company ON public.inventory_transfers(company_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON public.inventory_transfers(transfer_date);

ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view transfers" ON public.inventory_transfers
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse manage transfers" ON public.inventory_transfers
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)));

CREATE TABLE IF NOT EXISTS public.inventory_transfer_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.inventory_transfers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  batch_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_lines_transfer ON public.inventory_transfer_lines(transfer_id);

ALTER TABLE public.inventory_transfer_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access via parent transfer" ON public.inventory_transfer_lines
  FOR ALL TO authenticated
  USING (transfer_id IN (SELECT id FROM public.inventory_transfers WHERE company_id = get_user_company_id(auth.uid())))
  WITH CHECK (transfer_id IN (SELECT id FROM public.inventory_transfers WHERE company_id = get_user_company_id(auth.uid())));

-- =========================================================
-- CYCLE COUNT (دورة الجرد)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.cycle_count_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  session_number TEXT NOT NULL DEFAULT '',
  location_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open', -- Open, Counting, Closed, Adjusted
  started_by UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cycle_company ON public.cycle_count_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_cycle_status ON public.cycle_count_sessions(status);

ALTER TABLE public.cycle_count_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view cycle counts" ON public.cycle_count_sessions
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse manage cycle counts" ON public.cycle_count_sessions
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)))
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'warehouse'::app_role)));

CREATE TABLE IF NOT EXISTS public.cycle_count_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.cycle_count_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  expected_quantity NUMERIC NOT NULL DEFAULT 0,
  counted_quantity NUMERIC,
  variance NUMERIC GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - expected_quantity) STORED,
  notes TEXT,
  counted_by UUID,
  counted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cycle_lines_session ON public.cycle_count_lines(session_id);

ALTER TABLE public.cycle_count_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access via parent cycle session" ON public.cycle_count_lines
  FOR ALL TO authenticated
  USING (session_id IN (SELECT id FROM public.cycle_count_sessions WHERE company_id = get_user_company_id(auth.uid())))
  WITH CHECK (session_id IN (SELECT id FROM public.cycle_count_sessions WHERE company_id = get_user_company_id(auth.uid())));

-- =========================================================
-- VISION SCANS (AI camera scans)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.vision_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL, -- product, invoice, document, shipment_label
  image_url TEXT,
  ai_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  matched_item_id UUID,
  matched_location_id UUID,
  detected_quantity NUMERIC,
  action_taken TEXT, -- added, avoided, placed_on_shelf, ignored
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vision_company ON public.vision_scans(company_id);
CREATE INDEX IF NOT EXISTS idx_vision_user ON public.vision_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_type ON public.vision_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_vision_created ON public.vision_scans(created_at DESC);

ALTER TABLE public.vision_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own company vision scans" ON public.vision_scans
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users create vision scans" ON public.vision_scans
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users update own vision scans" ON public.vision_scans
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND user_id = auth.uid());

-- =========================================================
-- Storage bucket for scanned images
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vision-scans', 'vision-scans', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own vision scans"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vision-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own vision scans"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vision-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own vision scans"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vision-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================
-- Auto numbering trigger for transfers and cycle counts
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_transfer_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transfer_number IS NULL OR NEW.transfer_number = '' THEN
    NEW.transfer_number := 'TR-' || LPAD(NEXTVAL('public.transfer_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS public.transfer_number_seq START 1;

CREATE TRIGGER trg_set_transfer_number
  BEFORE INSERT ON public.inventory_transfers
  FOR EACH ROW EXECUTE FUNCTION public.set_transfer_number();

CREATE OR REPLACE FUNCTION public.set_cycle_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_number IS NULL OR NEW.session_number = '' THEN
    NEW.session_number := 'CC-' || LPAD(NEXTVAL('public.cycle_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS public.cycle_number_seq START 1;

CREATE TRIGGER trg_set_cycle_number
  BEFORE INSERT ON public.cycle_count_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_cycle_number();

-- =========================================================
-- RPC: Execute inventory transfer (atomic)
-- =========================================================
CREATE OR REPLACE FUNCTION public.execute_inventory_transfer(_transfer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _transfer RECORD;
  _line RECORD;
  _from_qty NUMERIC;
BEGIN
  SELECT * INTO _transfer FROM public.inventory_transfers WHERE id = _transfer_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Transfer not found'); END IF;
  IF _transfer.status = 'Done' THEN RETURN jsonb_build_object('success', false, 'error', 'Already executed'); END IF;

  FOR _line IN SELECT * FROM public.inventory_transfer_lines WHERE transfer_id = _transfer_id LOOP
    SELECT COALESCE(quantity, 0) INTO _from_qty FROM public.inventory
      WHERE item_id = _line.item_id AND location_id = _transfer.from_location_id;
    IF _from_qty < _line.quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock for item ' || _line.item_id);
    END IF;

    -- Decrease source
    UPDATE public.inventory SET quantity = quantity - _line.quantity, updated_at = now()
      WHERE item_id = _line.item_id AND location_id = _transfer.from_location_id;
    INSERT INTO public.inventory_ledger (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
      VALUES (_line.item_id, _transfer.from_location_id, 'Outbound', -_line.quantity, 'transfer', _transfer_id, 'Transfer out: ' || _transfer.transfer_number, auth.uid());

    -- Increase destination
    INSERT INTO public.inventory (item_id, location_id, quantity)
      VALUES (_line.item_id, _transfer.to_location_id, _line.quantity)
      ON CONFLICT (item_id, location_id) DO UPDATE SET quantity = public.inventory.quantity + EXCLUDED.quantity, updated_at = now();
    INSERT INTO public.inventory_ledger (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
      VALUES (_line.item_id, _transfer.to_location_id, 'Inbound', _line.quantity, 'transfer', _transfer_id, 'Transfer in: ' || _transfer.transfer_number, auth.uid());
  END LOOP;

  UPDATE public.inventory_transfers SET status = 'Done', completed_at = now(), updated_at = now() WHERE id = _transfer_id;
  RETURN jsonb_build_object('success', true);
END;
$$;
