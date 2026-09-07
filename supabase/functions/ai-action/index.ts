import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  action: z.enum(["create_client", "create_shipment", "create_expense", "create_lead", "create_item"]),
  payload: z.record(z.unknown()).default({}),
});

const str = (v: unknown, max = 255) => {
  const s = typeof v === "string" ? v.trim() : v == null ? "" : String(v);
  return s ? s.slice(0, max) : null;
};
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const date = (v: unknown) => {
  const s = str(v, 40);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { action, payload } = parsed.data;

    const { data: profile } = await sb
      .from("profiles")
      .select("company_id, is_approved")
      .eq("id", user.id)
      .maybeSingle();

    const companyId = profile?.company_id as string | undefined;
    if (!companyId) return json({ error: "no_company", message: "No company linked to this account." }, 400);
    if (profile?.is_approved === false) return json({ error: "not_approved", message: "Account awaiting approval." }, 403);

    const base = { company_id: companyId, created_by: user.id };

    switch (action) {
      case "create_client": {
        const name = str(payload.name);
        if (!name) return json({ error: "validation", message: "Client name is required." }, 400);
        const type = str(payload.type, 20)?.toUpperCase() === "VENDOR" ? "VENDOR" : "CLIENT";
        const { data, error } = await sb
          .from("clients")
          .insert({ ...base, name, type, email: str(payload.email), phone: str(payload.phone, 40) })
          .select("id,name")
          .single();
        if (error) return json({ error: "db", message: error.message }, 400);
        return json({ ok: true, record: data, route: "/saas/clients", label_en: "Client created", label_ar: "تم إنشاء العميل" });
      }

      case "create_shipment": {
        const origin = str(payload.origin) || "Amman, JO";
        const destination = str(payload.destination);
        if (!destination) return json({ error: "validation", message: "Destination is required." }, 400);

        let clientId: string | null = null;
        const clientName = str(payload.client_name);
        if (clientName) {
          const { data: c } = await sb
            .from("clients")
            .select("id")
            .eq("company_id", companyId)
            .ilike("name", clientName)
            .maybeSingle();
          if (!c) {
            return json({
              error: "missing_prerequisite",
              message: `Client "${clientName}" was not found. Add the client first.`,
              message_ar: `العميل "${clientName}" غير موجود. أضف العميل أولاً.`,
              route: "/saas/clients",
            }, 409);
          }
          clientId = c.id as string;
        }

        const { data, error } = await sb
          .from("shipments_v2")
          .insert({
            ...base,
            origin,
            destination,
            client_id: clientId,
            expected_delivery: date(payload.expected_delivery),
            notes: str(payload.notes, 2000),
          })
          .select("id,tracking_number,origin,destination")
          .single();
        if (error) return json({ error: "db", message: error.message }, 400);
        return json({ ok: true, record: data, route: "/saas/shipments", label_en: "Shipment created", label_ar: "تم إنشاء الشحنة" });
      }

      case "create_expense": {
        const amount = num(payload.amount);
        if (amount === null || amount <= 0) return json({ error: "validation", message: "A positive amount is required." }, 400);
        const insert: Record<string, unknown> = {
          ...base,
          amount,
          currency: str(payload.currency, 8) || "JOD",
          vendor_name: str(payload.vendor_name),
          description: str(payload.description, 2000),
        };
        const category = str(payload.category, 40);
        if (category) insert.category = category;
        const expenseDate = date(payload.expense_date);
        if (expenseDate) insert.expense_date = expenseDate;

        const { data, error } = await sb.from("expenses").insert(insert).select("id,expense_number,amount,currency").single();
        if (error) return json({ error: "db", message: error.message }, 400);
        return json({ ok: true, record: data, route: "/finance/expenses", label_en: "Expense recorded", label_ar: "تم تسجيل المصروف" });
      }

      case "create_lead": {
        const name = str(payload.name);
        if (!name) return json({ error: "validation", message: "Lead name is required." }, 400);
        const { data, error } = await sb
          .from("sales_leads")
          .insert({
            ...base,
            name,
            company_name: str(payload.company_name),
            email: str(payload.email),
            phone: str(payload.phone, 40),
            expected_revenue: num(payload.expected_revenue),
          })
          .select("id,name")
          .single();
        if (error) return json({ error: "db", message: error.message }, 400);
        return json({ ok: true, record: data, route: "/sales/leads", label_en: "Lead created", label_ar: "تم إنشاء العميل المحتمل" });
      }

      case "create_item": {
        const name = str(payload.name);
        const sku = str(payload.sku, 60);
        if (!name || !sku) return json({ error: "validation", message: "Item name and SKU are required." }, 400);
        const { data, error } = await sb
          .from("items")
          .insert({
            company_id: companyId,
            name,
            sku,
            unit: str(payload.unit, 20) || "pcs",
            barcode: str(payload.barcode, 60),
          })
          .select("id,sku,name")
          .single();
        if (error) return json({ error: "db", message: error.message }, 400);
        return json({ ok: true, record: data, route: "/erp/items", label_en: "Item created", label_ar: "تم إنشاء الصنف" });
      }
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    console.error("ai-action error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
