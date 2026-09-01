CREATE TABLE public.webhook_dispatch_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.webhook_dispatch_secrets TO service_role;
GRANT ALL ON public.webhook_dispatch_secrets TO service_role;
ALTER TABLE public.webhook_dispatch_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_dispatch_secrets_service_only"
ON public.webhook_dispatch_secrets
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO public.webhook_dispatch_secrets (secret)
VALUES (encode(extensions.gen_random_bytes(32), 'hex'));

-- Point the cron job at the table secret instead of a database setting
SELECT cron.unschedule('webhook-dispatch-every-minute');
SELECT cron.schedule(
  'webhook-dispatch-every-minute',
  '* * * * *',
  $$
    SELECT extensions.net.http_post(
      url := 'https://zzwhshjevftnlrcewzas.supabase.co/functions/v1/webhook-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-dispatch-secret', (SELECT secret FROM public.webhook_dispatch_secrets ORDER BY created_at DESC LIMIT 1)
      ),
      body := '{}'::jsonb
    );
  $$
);