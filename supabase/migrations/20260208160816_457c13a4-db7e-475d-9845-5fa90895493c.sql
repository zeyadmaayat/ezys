
-- A) Fix companies UPDATE/DELETE RLS policies to scope to own company only

DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update own company" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete own company" ON public.companies;

CREATE POLICY "Admins can update own company"
ON public.companies
FOR UPDATE
USING (
  id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete own company"
ON public.companies
FOR DELETE
USING (
  id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
