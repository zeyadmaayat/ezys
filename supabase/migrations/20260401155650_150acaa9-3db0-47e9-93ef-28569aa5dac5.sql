
CREATE TABLE public.sales_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  segment TEXT,
  name TEXT NOT NULL,
  speed TEXT,
  capacity TEXT,
  price_jd NUMERIC(10,2) NOT NULL DEFAULT 0,
  sim_price_jd NUMERIC(10,2) DEFAULT 0,
  includes_sim BOOLEAN DEFAULT false,
  includes_mifi BOOLEAN DEFAULT false,
  includes_router BOOLEAN DEFAULT false,
  includes_extender BOOLEAN DEFAULT false,
  includes_voip BOOLEAN DEFAULT false,
  includes_wifi_modem BOOLEAN DEFAULT false,
  device_info TEXT,
  customer_type TEXT NOT NULL DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products" ON public.sales_products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own company products" ON public.sales_products
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid()));
