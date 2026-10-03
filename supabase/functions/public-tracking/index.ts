import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    if (!token && req.method === "POST") token = (await req.json().catch(() => ({})))?.token;
    if (!token || !/^[a-zA-Z0-9]{20,80}$/.test(token)) return json({ error: "invalid_token" }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: t } = await db.from("tracking_tokens").select("shipment_id, expires_at, revoked").eq("token", token).maybeSingle();
    if (!t || t.revoked || (t.expires_at && new Date(t.expires_at) < new Date())) return json({ error: "not_found" }, 404);

    // Only public-safe fields: no cost, driver, client or internal notes.
    const { data: s } = await db.from("shipments_v2")
      .select("tracking_number, status, origin, destination, expected_delivery, created_at")
      .eq("id", t.shipment_id).maybeSingle();
    if (!s) return json({ error: "not_found" }, 404);
    const { data: events } = await db.from("shipment_events")
      .select("description, status, location_text, created_at")
      .eq("shipment_id", t.shipment_id).eq("is_public", true).order("created_at", { ascending: false }).limit(50);
    const { data: stops } = await db.from("route_stops")
      .select("sequence, label, status, planned_arrival, actual_arrival")
      .eq("shipment_id", t.shipment_id).order("sequence", { ascending: true }).limit(50);
    const { data: pos } = await db.from("shipment_positions")
      .select("latitude, longitude, recorded_at")
      .eq("shipment_id", t.shipment_id).order("recorded_at", { ascending: false }).limit(1);
    return json({ shipment: s, events: events ?? [], stops: stops ?? [], position: pos?.[0] ?? null });
  } catch (e) {
    console.error(e);
    return json({ error: "server_error" }, 500);
  }
});
