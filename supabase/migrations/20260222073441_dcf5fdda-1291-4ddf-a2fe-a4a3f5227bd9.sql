-- Update create_company_and_assign_admin to also approve the user
CREATE OR REPLACE FUNCTION public.create_company_and_assign_admin(_name text)
 RETURNS companies
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid;
  _company public.companies;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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

  -- Link profile to company AND approve the user
  UPDATE public.profiles
  SET company_id = _company.id, is_approved = true
  WHERE id = _uid;

  RETURN _company;
END;
$function$;