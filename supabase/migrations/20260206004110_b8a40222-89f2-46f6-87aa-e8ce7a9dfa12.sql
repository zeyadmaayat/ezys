-- Fix: Restrict company creation to authenticated users only (and only if they don't already have one)

DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

CREATE POLICY "Authenticated users can create first company" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND get_user_company_id(auth.uid()) IS NULL
);