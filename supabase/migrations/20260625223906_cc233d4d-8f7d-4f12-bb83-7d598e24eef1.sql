
-- 1. audit_log INSERT company scoping
DROP POLICY IF EXISTS "Audit log insert via system only" ON public.audit_log;
CREATE POLICY "Audit log insert via system only"
  ON public.audit_log FOR INSERT
  WITH CHECK (
    action IS NOT NULL
    AND entity_type IS NOT NULL
    AND (user_id = auth.uid() OR user_id IS NULL)
    AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
  );

-- 2. sales_products SELECT company scoping
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.sales_products;
CREATE POLICY "Company members can view own products"
  ON public.sales_products FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- 3. customers SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their customers" ON public.customers;
CREATE POLICY "Company members can view their customers"
  ON public.customers FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

-- 4. customer_addresses SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their customer addresses" ON public.customer_addresses;
CREATE POLICY "Company members can view their customer addresses"
  ON public.customer_addresses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_addresses.customer_id
      AND c.company_id = public.get_user_company_id(auth.uid())
  ));

-- 5. invoice_items SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their invoice items" ON public.invoice_items;
CREATE POLICY "Company members can view their invoice items"
  ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND i.company_id = public.get_user_company_id(auth.uid())
  ));

-- 6. items SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their items" ON public.items;
CREATE POLICY "Company members can view their items"
  ON public.items FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

-- 7. locations SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their locations" ON public.locations;
CREATE POLICY "Company members can view their locations"
  ON public.locations FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

-- 8. orders SELECT remove NULL company branch
DROP POLICY IF EXISTS "Company members can view their orders" ON public.orders;
CREATE POLICY "Company members can view their orders"
  ON public.orders FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

-- 9. profiles admin SELECT remove NULL company branch
DROP POLICY IF EXISTS "Admins can view own company profiles" ON public.profiles;
CREATE POLICY "Admins can view own company profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND company_id = public.get_user_company_id(auth.uid())
  );

-- 10. user_roles INSERT/UPDATE/DELETE company scoping
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND (SELECT company_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_company_id(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND (SELECT company_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_company_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND (SELECT company_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_company_id(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND (SELECT company_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_company_id(auth.uid())
  );

-- 11. Restrict direct execution of internal trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_company_created() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_dp_shipment_created() FROM anon, authenticated, public;
