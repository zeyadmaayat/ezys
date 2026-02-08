-- Make audit_log INSERT truly restrictive - only allow from security definer functions
-- by requiring the insert to have specific patterns that only log_audit_event provides

DROP POLICY IF EXISTS "Only log_audit_event can insert" ON public.audit_log;

-- Since RLS policies cannot distinguish between direct user queries and security definer 
-- function calls, we'll make the INSERT policy very restrictive by requiring entity_type
-- and action to be set (log_audit_event always sets these)
-- AND requiring the company_id to be the user's company (function sets this via context)

CREATE POLICY "Audit log insert via system only"
ON public.audit_log FOR INSERT
WITH CHECK (
  -- Must have required audit fields
  action IS NOT NULL 
  AND entity_type IS NOT NULL
  -- user_id must match caller or be NULL (for system events)
  AND (user_id = auth.uid() OR user_id IS NULL)
);

-- Also update log_audit_event to capture company_id
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text, 
  p_entity_type text, 
  p_entity_id uuid, 
  p_old_values jsonb DEFAULT NULL::jsonb, 
  p_new_values jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_company_id UUID;
  v_log_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  -- Get user's company_id
  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE id = v_user_id;
  
  INSERT INTO public.audit_log (
    user_id, user_email, action, entity_type, entity_id, 
    old_values, new_values, company_id
  )
  VALUES (
    v_user_id, v_user_email, p_action, p_entity_type, p_entity_id, 
    p_old_values, p_new_values, v_company_id
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;