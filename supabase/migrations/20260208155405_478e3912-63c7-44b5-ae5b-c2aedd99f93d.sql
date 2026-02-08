-- RPC: Create company + assign admin + link profile in one transaction
CREATE OR REPLACE FUNCTION public.create_company_and_assign_admin(_name text)
RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _company public.companies;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only allow creating first company (matches your policy intention)
  IF public.get_user_company_id(_uid) IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a company';
  END IF;

  INSERT INTO public.companies(name)
  VALUES (_name)
  RETURNING * INTO _company;

  -- Assign admin role
  INSERT INTO public.user_roles(user_id, role)
  VALUES (_uid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Link profile to company
  UPDATE public.profiles
  SET company_id = _company.id
  WHERE id = _uid;

  RETURN _company;
END;
$$;

-- Allow authenticated users to call it
GRANT EXECUTE ON FUNCTION public.create_company_and_assign_admin(text) TO authenticated;