REVOKE ALL ON FUNCTION public.wh_emit_shipment_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.wh_emit_invoice_event() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule(
  'webhook-dispatch-every-minute',
  '* * * * *',
  $$
    SELECT extensions.net.http_post(
      url := 'https://zzwhshjevftnlrcewzas.supabase.co/functions/v1/webhook-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-dispatch-secret', current_setting('WEBHOOK_DISPATCH_SECRET', true)
      ),
      body := '{}'::jsonb
    );
  $$
);