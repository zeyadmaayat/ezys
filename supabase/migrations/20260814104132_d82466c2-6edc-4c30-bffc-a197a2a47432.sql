-- API keys
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  created_by uuid NOT NULL DEFAULT auth.uid(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX api_keys_company_idx ON public.api_keys(company_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_admin_read" ON public.api_keys FOR SELECT TO authenticated
USING (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "api_keys_admin_update" ON public.api_keys FOR UPDATE TO authenticated
USING (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "api_keys_admin_delete" ON public.api_keys FOR DELETE TO authenticated
USING (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Webhook endpoints
CREATE TABLE public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  url text NOT NULL,
  description text,
  events text[] NOT NULL DEFAULT ARRAY['*']::text[],
  secret text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  failure_count integer NOT NULL DEFAULT 0,
  last_delivery_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX webhook_endpoints_company_idx ON public.webhook_endpoints(company_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_endpoints_admin_all" ON public.webhook_endpoints FOR ALL TO authenticated
USING (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER webhook_endpoints_updated_at BEFORE UPDATE ON public.webhook_endpoints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Webhook deliveries (attempt log + retry queue)
CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempt integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  response_status integer,
  response_body text,
  error text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX webhook_deliveries_queue_idx ON public.webhook_deliveries(status, next_retry_at);
CREATE INDEX webhook_deliveries_company_idx ON public.webhook_deliveries(company_id, created_at DESC);

GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_deliveries_admin_read" ON public.webhook_deliveries FOR SELECT TO authenticated
USING (company_id IS NOT NULL AND company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create an API key (returns plaintext once)
CREATE OR REPLACE FUNCTION public.create_api_key(_name text, _scopes text[] DEFAULT ARRAY['read']::text[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company uuid;
  _raw text;
  _key text;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.has_role(_uid, 'admin'::public.app_role) THEN RAISE EXCEPTION 'Admin role required'; END IF;

  _company := public.get_user_company_id(_uid);
  IF _company IS NULL THEN RAISE EXCEPTION 'Company setup required'; END IF;

  _raw := encode(extensions.gen_random_bytes(24), 'hex');
  _key := 'ezys_live_' || _raw;

  INSERT INTO public.api_keys (company_id, name, key_prefix, key_hash, scopes, created_by)
  VALUES (
    _company,
    _name,
    left(_key, 14),
    encode(extensions.digest(_key, 'sha256'), 'hex'),
    COALESCE(_scopes, ARRAY['read']::text[]),
    _uid
  )
  RETURNING id INTO _id;

  RETURN jsonb_build_object('id', _id, 'api_key', _key, 'prefix', left(_key, 14));
END;
$$;

REVOKE ALL ON FUNCTION public.create_api_key(text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_api_key(text, text[]) TO authenticated;

-- Enqueue a webhook event to all matching endpoints
CREATE OR REPLACE FUNCTION public.enqueue_webhook_event(_company_id uuid, _event_type text, _payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer := 0;
BEGIN
  IF _company_id IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.webhook_deliveries (company_id, endpoint_id, event_type, payload)
  SELECT _company_id, e.id, _event_type, COALESCE(_payload, '{}'::jsonb)
  FROM public.webhook_endpoints e
  WHERE e.company_id = _company_id
    AND e.is_active = true
    AND (e.events @> ARRAY['*']::text[] OR e.events @> ARRAY[_event_type]::text[]);

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_webhook_event(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_webhook_event(uuid, text, jsonb) TO service_role;

-- Emit events on shipment lifecycle
CREATE OR REPLACE FUNCTION public.wh_emit_shipment_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _event := 'shipment.created';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    _event := 'shipment.status_changed';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.enqueue_webhook_event(
    NEW.company_id,
    _event,
    jsonb_build_object(
      'id', NEW.id,
      'tracking_number', NEW.tracking_number,
      'status', NEW.status,
      'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
      'occurred_at', now()
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER wh_shipments_v2_events
AFTER INSERT OR UPDATE ON public.shipments_v2
FOR EACH ROW EXECUTE FUNCTION public.wh_emit_shipment_event();

-- Emit events on invoice lifecycle
CREATE OR REPLACE FUNCTION public.wh_emit_invoice_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _event := 'invoice.created';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    _event := 'invoice.status_changed';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.enqueue_webhook_event(
    NEW.company_id,
    _event,
    jsonb_build_object(
      'id', NEW.id,
      'invoice_number', NEW.invoice_number,
      'status', NEW.status,
      'total_amount', NEW.total_amount,
      'occurred_at', now()
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER wh_invoices_v2_events
AFTER INSERT OR UPDATE ON public.invoices_v2
FOR EACH ROW EXECUTE FUNCTION public.wh_emit_invoice_event();