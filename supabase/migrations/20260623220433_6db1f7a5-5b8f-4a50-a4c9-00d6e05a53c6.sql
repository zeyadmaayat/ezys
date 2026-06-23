
-- 1. Function search_path mutable
ALTER FUNCTION public.dp_inventory_summary(uuid) SET search_path = public;
ALTER FUNCTION public.enforce_dp_status_transition() SET search_path = public;
ALTER FUNCTION public.dp_create_cod_settlement(uuid) SET search_path = public;
ALTER FUNCTION public.dp_scan_inventory(uuid, text) SET search_path = public;

-- 2. SECURITY DEFINER views -> security_invoker so they respect the querying user's RLS
ALTER VIEW public.dp_governance_kpis SET (security_invoker = on);
ALTER VIEW public.dp_driver_performance SET (security_invoker = on);
ALTER VIEW public.dp_live_control_feed SET (security_invoker = on);
ALTER VIEW public.dp_weekly_risk_report SET (security_invoker = on);
ALTER VIEW public.dp_governance_live_feed SET (security_invoker = on);
ALTER VIEW public.dp_company_risk_index SET (security_invoker = on);

-- 3. Lock down SECURITY DEFINER function execution.
-- Revoke from PUBLIC/anon/authenticated on every SECURITY DEFINER function, then grant
-- EXECUTE to authenticated only on the functions the app legitimately needs (RPCs + RLS helpers).
REVOKE EXECUTE ON FUNCTION public.create_company_and_assign_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dp_create_cod_settlement(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dp_scan_inventory(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_signup_request(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.execute_inventory_transfer(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_user_approved(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_company_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_dp_shipment_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Grant back only what authenticated users actually invoke (RPCs) or need for RLS evaluation.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_approved(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company_and_assign_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_signup_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dp_create_cod_settlement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dp_scan_inventory(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dp_inventory_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_inventory_transfer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, jsonb) TO authenticated;
-- Keep service_role able to run everything (edge functions / admin tasks).
GRANT EXECUTE ON FUNCTION public.create_company_and_assign_admin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_signup_request(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_inventory_transfer(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, jsonb) TO service_role;

-- 4. RLS policy always true: notifications INSERT (was WITH CHECK true for everyone).
-- Notifications are only created by SECURITY DEFINER functions / service_role, which bypass RLS,
-- so remove the permissive client INSERT policy entirely (default deny for clients).
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT TO service_role
WITH CHECK (true);

-- 5. user_roles: make role management explicitly admin-only, no broad/always-true write paths.
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. vision-scans bucket: add missing UPDATE policy scoped to owner folder.
CREATE POLICY "Users update own vision scans"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vision-scans' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'vision-scans' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 7. Realtime channel authorization for notifications.
-- Restrict realtime subscriptions so each authenticated user can only join their own
-- private notification topic ('notifications:<uid>').
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own notification realtime topic" ON realtime.messages;
CREATE POLICY "Users access own notification realtime topic"
ON realtime.messages FOR SELECT TO authenticated
USING (realtime.topic() = ('notifications:' || (auth.uid())::text));
