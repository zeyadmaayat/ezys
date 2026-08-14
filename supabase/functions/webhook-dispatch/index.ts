// Webhook dispatcher — delivers queued events with HMAC-SHA256 signatures and exponential-backoff retries.
// Call with POST (no body needed) to drain the queue. Protected by WEBHOOK_DISPATCH_SECRET when set,
// otherwise requires a valid signed-in JWT of a company admin (dev/manual triggering).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const DISPATCH_SECRET = Deno.env.get("WEBHOOK_DISPATCH_SECRET");

const BATCH_SIZE = 25;
const BACKOFF_SECONDS = [30, 120, 600, 3600, 21600]; // 30s, 2m, 10m, 1h, 6h

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // --- Authorization ---
  const providedSecret = req.headers.get("x-dispatch-secret");
  let authorized = false;
  let scopedCompany: string | null = null;

  if (DISPATCH_SECRET && providedSecret === DISPATCH_SECRET) {
    authorized = true;
  } else {
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";
    if (jwt) {
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
        auth: { persistSession: false },
      });
      const { data: userData } = await userClient.auth.getUser();
      const uid = userData?.user?.id;
      if (uid) {
        const [{ data: roles }, { data: profile }] = await Promise.all([
          admin.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin"),
          admin.from("profiles").select("company_id").eq("id", uid).maybeSingle(),
        ]);
        if (roles && roles.length > 0 && profile?.company_id) {
          authorized = true;
          scopedCompany = profile.company_id;
        }
      }
    }
  }

  if (!authorized) return json({ error: "unauthorized" }, 401);

  try {
    let pending = admin
      .from("webhook_deliveries")
      .select("id,company_id,endpoint_id,event_type,payload,attempt,max_attempts")
      .in("status", ["pending", "retrying"])
      .lte("next_retry_at", new Date().toISOString())
      .order("next_retry_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (scopedCompany) pending = pending.eq("company_id", scopedCompany);

    const { data: deliveries, error } = await pending;
    if (error) return json({ error: "queue_read_failed", message: error.message }, 500);
    if (!deliveries || deliveries.length === 0) return json({ ok: true, processed: 0 });

    const endpointIds = [...new Set(deliveries.map((d) => d.endpoint_id))];
    const { data: endpoints } = await admin
      .from("webhook_endpoints")
      .select("id,url,secret,is_active,failure_count")
      .in("id", endpointIds);
    const endpointMap = new Map((endpoints ?? []).map((e) => [e.id, e]));

    let succeeded = 0;
    let failed = 0;

    for (const delivery of deliveries) {
      const endpoint = endpointMap.get(delivery.endpoint_id);
      const attempt = delivery.attempt + 1;

      if (!endpoint || !endpoint.is_active) {
        await admin
          .from("webhook_deliveries")
          .update({ status: "cancelled", attempt, error: "endpoint inactive or missing" })
          .eq("id", delivery.id);
        continue;
      }

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = JSON.stringify({
        id: delivery.id,
        event: delivery.event_type,
        created_at: new Date().toISOString(),
        data: delivery.payload,
      });
      const signature = await hmacSha256Hex(endpoint.secret, `${timestamp}.${body}`);

      let responseStatus: number | null = null;
      let responseBody = "";
      let errorText: string | null = null;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ezys-webhooks/1.0",
            "X-Ezys-Event": delivery.event_type,
            "X-Ezys-Delivery": delivery.id,
            "X-Ezys-Timestamp": timestamp,
            "X-Ezys-Signature": `sha256=${signature}`,
          },
          body,
          signal: controller.signal,
        });
        clearTimeout(timer);
        responseStatus = res.status;
        responseBody = (await res.text().catch(() => "")).slice(0, 1000);
      } catch (e) {
        errorText = e instanceof Error ? e.message : String(e);
      }

      const ok = responseStatus !== null && responseStatus >= 200 && responseStatus < 300;

      if (ok) {
        succeeded += 1;
        await admin
          .from("webhook_deliveries")
          .update({
            status: "delivered",
            attempt,
            response_status: responseStatus,
            response_body: responseBody,
            error: null,
            delivered_at: new Date().toISOString(),
          })
          .eq("id", delivery.id);
        await admin
          .from("webhook_endpoints")
          .update({ failure_count: 0, last_delivery_at: new Date().toISOString() })
          .eq("id", endpoint.id);
      } else {
        failed += 1;
        const exhausted = attempt >= delivery.max_attempts;
        const backoff = BACKOFF_SECONDS[Math.min(attempt - 1, BACKOFF_SECONDS.length - 1)];
        await admin
          .from("webhook_deliveries")
          .update({
            status: exhausted ? "failed" : "retrying",
            attempt,
            response_status: responseStatus,
            response_body: responseBody,
            error: errorText ?? `HTTP ${responseStatus}`,
            next_retry_at: new Date(Date.now() + backoff * 1000).toISOString(),
          })
          .eq("id", delivery.id);
        await admin
          .from("webhook_endpoints")
          .update({
            failure_count: (endpoint.failure_count ?? 0) + 1,
            last_delivery_at: new Date().toISOString(),
          })
          .eq("id", endpoint.id);
      }
    }

    return json({ ok: true, processed: deliveries.length, succeeded, failed });
  } catch (e) {
    return json({ error: "internal_error", message: e instanceof Error ? e.message : String(e) }, 500);
  }
});
