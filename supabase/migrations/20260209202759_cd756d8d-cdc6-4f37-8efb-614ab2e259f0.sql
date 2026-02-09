
-- Allow admins to update profiles in their company (for approval)
CREATE POLICY "Admins can update company profiles"
ON public.profiles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    company_id = get_user_company_id(auth.uid())
    OR company_id IS NULL
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    company_id = get_user_company_id(auth.uid())
    OR company_id IS NULL
  )
);
