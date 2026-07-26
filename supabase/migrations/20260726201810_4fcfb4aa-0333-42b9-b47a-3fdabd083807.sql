
-- Invoices: remove NULL company_id bypass
DROP POLICY IF EXISTS "Company members can insert invoices" ON public.invoices;
CREATE POLICY "Company members can insert invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Company members can update their invoices" ON public.invoices;
CREATE POLICY "Company members can update their invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Company members can view their invoices" ON public.invoices;
CREATE POLICY "Company members can view their invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Invoice items: remove NULL bypass on insert/update
DROP POLICY IF EXISTS "Company members can insert invoice items" ON public.invoice_items;
CREATE POLICY "Company members can insert invoice items" ON public.invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND i.company_id = get_user_company_id(auth.uid())
  ));

DROP POLICY IF EXISTS "Company members can update their invoice items" ON public.invoice_items;
CREATE POLICY "Company members can update their invoice items" ON public.invoice_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND i.company_id = get_user_company_id(auth.uid())
  ));

-- Order items: remove NULL bypass on select
DROP POLICY IF EXISTS "Company members can view their order items" ON public.order_items;
CREATE POLICY "Company members can view their order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.company_id = get_user_company_id(auth.uid())
  ));

-- sales_products: fix self-referential policy
DROP POLICY IF EXISTS "Users can manage own company products" ON public.sales_products;
CREATE POLICY "Admins and operations manage own company products" ON public.sales_products
  FOR ALL TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operations'::app_role))
  )
  WITH CHECK (
    company_id = get_user_company_id(auth.uid())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operations'::app_role))
  );
