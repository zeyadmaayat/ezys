
-- Helper: is the row owner in the same (non-null) company as the current admin?
CREATE OR REPLACE FUNCTION public.is_company_admin_of(_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND public.get_user_company_id(auth.uid()) IS NOT NULL
     AND public.get_user_company_id(auth.uid()) = public.get_user_company_id(_owner_id)
$$;

REVOKE ALL ON FUNCTION public.is_company_admin_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_admin_of(uuid) TO authenticated;

-- shipments
DROP POLICY IF EXISTS "Admins can view all shipments" ON public.shipments;
CREATE POLICY "Company admins can view company shipments"
ON public.shipments FOR SELECT TO authenticated
USING (public.is_company_admin_of(user_id));

-- shipment_plans
DROP POLICY IF EXISTS "Admins can view all shipment plans" ON public.shipment_plans;
CREATE POLICY "Company admins can view company shipment plans"
ON public.shipment_plans FOR SELECT TO authenticated
USING (public.is_company_admin_of(user_id));

-- action_plans
DROP POLICY IF EXISTS "Admins can view all action plans" ON public.action_plans;
CREATE POLICY "Company admins can view company action plans"
ON public.action_plans FOR SELECT TO authenticated
USING (public.is_company_admin_of(user_id));

-- shipment_tasks
DROP POLICY IF EXISTS "Admins can view all shipment tasks" ON public.shipment_tasks;
CREATE POLICY "Company admins can view company shipment tasks"
ON public.shipment_tasks FOR SELECT TO authenticated
USING (public.is_company_admin_of(user_id));

-- shipment_costs
DROP POLICY IF EXISTS "Admins can view all shipment costs" ON public.shipment_costs;
CREATE POLICY "Company admins can view company shipment costs"
ON public.shipment_costs FOR SELECT TO authenticated
USING (public.is_company_admin_of(user_id));

-- shipment_documents (no owner column; scope through parent shipment)
DROP POLICY IF EXISTS "Admins can view all shipment documents" ON public.shipment_documents;
CREATE POLICY "Company admins can view company shipment documents"
ON public.shipment_documents FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.shipments s
  WHERE s.id = shipment_documents.shipment_id
    AND public.is_company_admin_of(s.user_id)
));
