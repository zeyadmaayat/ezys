// Critical error alert sender — called by other edge functions on failures.
// Requires x-alert-secret header matching ALERT_WEBHOOK_SECRET to prevent abuse.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ALERT_TO = Deno.env.get("ALERT_EMAIL_TO") ?? "zeyadmaayta@outlook.com";
const ALERT_FROM = Deno.env.get("ALERT_EMAIL_FROM") ?? "alerts@ezys.lovable.app";
const ALERT_SECRET = Deno.env.get("ALERT_WEBHOOK_SECRET");

// Simple in-memory rate limit: max 1 alert per key per 5 min per instance
const recent = new Map<string, number>();
const WINDOW_MS = 5 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!ALERT_SECRET || req.headers.get("x-alert-secret") !== ALERT_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const source = String(body.source ?? "unknown");
    const severity = String(body.severity ?? "error");
    const message = String(body.message ?? "");
    const context = body.context ?? {};
    const dedupeKey = String(body.dedupe_key ?? `${source}:${message}`).slice(0, 200);

    const now = Date.now();
    const last = recent.get(dedupeKey) ?? 0;
    if (now - last < WINDOW_MS) {
      return new Response(JSON.stringify({ ok: true, skipped: "rate_limited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    recent.set(dedupeKey, now);

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `[ezy Logistic HUB] ${severity.toUpperCase()} — ${source}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;background:#0b1220;color:#e5e7eb;padding:24px;border-radius:12px">
        <h2 style="color:#f87171;margin:0 0 12px">🚨 ${severity.toUpperCase()} in ${source}</h2>
        <p style="margin:0 0 12px"><strong>Message:</strong> ${escapeHtml(message)}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${new Date().toISOString()}</p>
        <pre style="background:#111827;padding:12px;border-radius:8px;overflow:auto;font-size:12px;color:#a3e635">${escapeHtml(JSON.stringify(context, null, 2))}</pre>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px">by ZEYAD · ezy Logistic HUB monitoring</p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `ezy Alerts <${ALERT_FROM}>`, to: [ALERT_TO], subject, html }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error", resp.status, errText);
      return new Response(JSON.stringify({ error: "send failed", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-alert error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}
