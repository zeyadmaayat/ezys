-- Fix: Separate admin policy to not block INSERT for new users

DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;

-- Admins can update their company
CREATE POLICY "Admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete companies
CREATE POLICY "Admins can delete companies" 
ON public.companies 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));