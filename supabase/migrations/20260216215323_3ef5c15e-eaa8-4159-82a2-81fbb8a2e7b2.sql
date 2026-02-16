
-- GRN Status Enum
CREATE TYPE public.grn_status AS ENUM ('Draft', 'Posted');

-- Sequence for GRN numbers
CREATE SEQUENCE public.grn_number_seq START 1;

-- goods_receipts (GRN Header)
CREATE TABLE public.goods_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  grn_number text NOT NULL DEFAULT '',
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id),
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  warehouse_id uuid REFERENCES public.warehouses(id),
  status public.grn_status NOT NULL DEFAULT 'Draft',
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Auto-generate GRN number
CREATE OR REPLACE FUNCTION public.generate_grn_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
  IF NEW.grn_number IS NULL OR NEW.grn_number = '' THEN
    NEW.grn_number := 'GRN-' || LPAD(nextval('grn_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_grn_number_trigger
  BEFORE INSERT ON public.goods_receipts
  FOR EACH ROW EXECUTE FUNCTION public.generate_grn_number();

-- Updated_at trigger
CREATE TRIGGER update_goods_receipts_updated_at
  BEFORE UPDATE ON public.goods_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- goods_receipt_lines
CREATE TABLE public.goods_receipt_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id uuid NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  po_line_id uuid NOT NULL REFERENCES public.po_lines(id),
  item_id uuid REFERENCES public.items(id),
  item_name text NOT NULL,
  quantity_received numeric NOT NULL DEFAULT 0,
  quantity_accepted numeric NOT NULL DEFAULT 0,
  quantity_rejected numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add grn_id and grn_line_id to return_orders
ALTER TABLE public.return_orders
  ADD COLUMN grn_id uuid REFERENCES public.goods_receipts(id),
  ADD COLUMN grn_line_id uuid REFERENCES public.goods_receipt_lines(id);

-- RLS for goods_receipts
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view GRNs"
  ON public.goods_receipts FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company members can create GRNs"
  ON public.goods_receipts FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Company members can update GRNs"
  ON public.goods_receipts FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

-- RLS for goods_receipt_lines (via parent GRN)
ALTER TABLE public.goods_receipt_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access via parent GRN"
  ON public.goods_receipt_lines FOR ALL
  USING (grn_id IN (SELECT id FROM goods_receipts WHERE company_id = get_user_company_id(auth.uid())))
  WITH CHECK (grn_id IN (SELECT id FROM goods_receipts WHERE company_id = get_user_company_id(auth.uid())));
