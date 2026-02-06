-- Fix: Allow users to create companies and auto-assign admin role

-- 1. Update companies table RLS to allow authenticated users to insert
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage companies" 
ON public.companies 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own company" 
ON public.companies 
FOR SELECT 
USING (id = get_user_company_id(auth.uid()));

-- 2. Create trigger to auto-assign admin role and link company to user profile after company creation
CREATE OR REPLACE FUNCTION public.handle_company_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign admin role to the creating user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Link company to user's profile
  UPDATE public.profiles
  SET company_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
AFTER INSERT ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.handle_company_created();