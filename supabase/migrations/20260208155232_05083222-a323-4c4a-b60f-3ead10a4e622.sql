-- Fix: Scope company update/delete to the user's own company

DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;

CREATE POLICY "Admins can update own company"
ON public.companies
FOR UPDATE
USING (
  id = get_user_company_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  id = get_user_company_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete own company"
ON public.companies
FOR DELETE
USING (
  id = get_user_company_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);