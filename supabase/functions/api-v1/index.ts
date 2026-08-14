// ezys Public REST API v1 — authenticated with API keys (Authorization: Bearer ezys_live_...)
// Read endpoints for shipments, invoices, items, clients + webhook test emitter.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Very light per-key rate limit (per instance): 120 req / minute
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(keyId: string) {
  const now = Date.now();
  const entry = hits.get(keyId);
  if (!entry || now > entry.reset) {
    hits.set(keyId, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 120;
}

const RESOURCES: Record<string, { table: string; columns: string; order: string }> = {
  shipments: {
    table: "shipments_v2",
    columns: "id,tracking_number,status,origin,destination,created_at,updated_at",
    order: "created_at",
  },
  invoices: {
    table: "invoices_v2",
    columns: "id,invoice_number,status,total_amount,currency,issue_date,due_date,created_at",
    order: "created_at",
  },
  items: {
    table: "items",
    columns: "id,sku,name,unit,unit_price,created_at",
    order: "created_at",
  },
  clients: {
    table: "clients",
    columns: "id,name,client_type,email,phone,city,country,created_at",
    order: "created_at",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
    if (!token.startsWith("ezys_")) {
      return json({ error: "missing_api_key", message: "Send Authorization: Bearer ezys_live_..." }, 401);
    }

    const keyHash = await sha256Hex(token);
    const { data: key } = await admin
      .from("api_keys")
      .select("id,company_id,scopes,revoked_at,expires_at")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (!key) return json({ error: "invalid_api_key" }, 401);
    if (key.revoked_at) return json({ error: "revoked_api_key" }, 401);
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return json({ error: "expired_api_key" }, 401);
    }
    if (rateLimited(key.id)) return json({ error: "rate_limited", message: "120 requests/minute" }, 429);

    // best-effort usage tracking
    admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id).then();

    const url = new URL(req.url);
    // path shape: /api-v1/<resource>[/<id>]
    const segments = url.pathname.split("/").filter(Boolean);
    const idx = segments.indexOf("api-v1");
    const parts = idx >= 0 ? segments.slice(idx + 1) : segments;
    const resource = parts[0] ?? "";
    const id = parts[1];

    if (!resource || resource === "ping") {
      return json({ ok: true, version: "1.0", company_id: key.company_id, scopes: key.scopes });
    }

    // Emit a test webhook event
    if (resource === "webhooks" && parts[1] === "test" && req.method === "POST") {
      if (!key.scopes.includes("write") && !key.scopes.includes("admin")) {
        return json({ error: "insufficient_scope", required: "write" }, 403);
      }
      const { data, error } = await admin.rpc("enqueue_webhook_event", {
        _company_id: key.company_id,
        _event_type: "webhook.test",
        _payload: { message: "Test event from ezys API", occurred_at: new Date().toISOString() },
      });
      if (error) return json({ error: "enqueue_failed", message: error.message }, 500);
      return json({ ok: true, queued: data });
    }

    const config = RESOURCES[resource];
    if (!config) return json({ error: "unknown_resource", available: Object.keys(RESOURCES) }, 404);
    if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    if (!key.scopes.includes("read") && !key.scopes.includes("admin")) {
      return json({ error: "insufficient_scope", required: "read" }, 403);
    }

    let query = admin.from(config.table).select(config.columns).eq("company_id", key.company_id);

    if (id) {
      const { data, error } = await query.eq("id", id).maybeSingle();
      if (error) return json({ error: "query_failed", message: error.message }, 400);
      if (!data) return json({ error: "not_found" }, 404);
      return json({ data });
    }

    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
    const status = url.searchParams.get("status");
    if (status) query = query.eq("status", status);

    const { data, error } = await query
      .order(config.order, { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return json({ error: "query_failed", message: error.message }, 400);

    return json({ data, pagination: { limit, offset, count: data?.length ?? 0 } });
  } catch (e) {
    return json({ error: "internal_error", message: e instanceof Error ? e.message : String(e) }, 500);
  }
});
