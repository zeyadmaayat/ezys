
DROP POLICY "Admins can view own company profiles" ON public.profiles;

CREATE POLICY "Admins can view own company profiles"
ON public.profiles FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL)
);
