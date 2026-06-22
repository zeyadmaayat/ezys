CREATE OR REPLACE FUNCTION public.ensure_signup_request(
  _display_name text DEFAULT NULL,
  _email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid;
  _safe_email text;
  _safe_name text;
  _admin record;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  _safe_email := NULLIF(trim(COALESCE(_email, '')), '');
  _safe_name := NULLIF(trim(COALESCE(_display_name, '')), '');

  INSERT INTO public.profiles (id, email, display_name, is_approved, company_id)
  VALUES (
    _uid,
    _safe_email,
    COALESCE(_safe_name, split_part(COALESCE(_safe_email, 'user'), '@', 1)),
    false,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    display_name = COALESCE(NULLIF(public.profiles.display_name, ''), EXCLUDED.display_name),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  FOR _admin IN
    SELECT DISTINCT p.id
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'admin'::public.app_role
      AND p.is_approved = true
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _admin.id,
      'New access request',
      COALESCE(_safe_name, _safe_email, 'A new user') || ' is waiting for platform approval.',
      'access_request'
    );
  END LOOP;

  RETURN jsonb_build_object('success', true, 'user_id', _uid);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_signup_request(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_signup_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_signup_request(text, text) TO service_role;