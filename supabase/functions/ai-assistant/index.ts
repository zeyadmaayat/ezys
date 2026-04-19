import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are EzySuite AI — an intelligent assistant embedded inside an ERP/Logistics platform (ezy Logistic HUB).

LANGUAGE: Always reply in the SAME language as the user (Arabic ↔ English). Use professional, natural tone.

CAPABILITIES:
- Answer general questions, draft documents, do calculations, write professional content.
- When the user provides system data (shipments, orders, invoices), analyze it and give actionable insights.
- Format responses in clean Markdown: **bold**, lists, tables, code blocks, headings.
- Be concise but thorough. Use emojis sparingly (📦 📊 ✅ ⚠️).

CONTEXT AWARENESS:
- The user works in logistics/supply-chain/procurement.
- If they ask about "my shipments / my orders / my invoices", a context block will be injected with their actual data — analyze it precisely.
- Never invent data. If context is missing, say so.

PDF-FRIENDLY OUTPUT:
- Structure long answers with clear headings so they export cleanly to PDF.
- Use tables for comparisons.

Be helpful, sharp, and professional — like Claude.`;

async function fetchUserContext(supabase: any, userId: string, query: string): Promise<string> {
  const q = query.toLowerCase();
  const wantsShipments = /shipment|شحن|طرود|طرد/.test(q);
  const wantsOrders = /order|طلب|طلبات/.test(q);
  const wantsInvoices = /invoice|فاتور/.test(q);

  if (!wantsShipments && !wantsOrders && !wantsInvoices) return "";

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", userId).maybeSingle();
  const companyId = profile?.company_id;
  if (!companyId) return "";

  let ctx = "\n\n=== USER SYSTEM DATA (live) ===\n";

  if (wantsShipments) {
    const { data } = await supabase
      .from("shipments_v2")
      .select("tracking_number,status,origin,destination,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(20);
    ctx += `\nRecent Shipments (${data?.length || 0}):\n${JSON.stringify(data || [], null, 2)}\n`;
  }
  if (wantsOrders) {
    const { data } = await supabase
      .from("orders")
      .select("order_number,status,total_amount,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(20);
    ctx += `\nRecent Orders (${data?.length || 0}):\n${JSON.stringify(data || [], null, 2)}\n`;
  }
  if (wantsInvoices) {
    const { data } = await supabase
      .from("invoices_v2")
      .select("invoice_number,status,amount,currency,due_date")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(20);
    ctx += `\nRecent Invoices (${data?.length || 0}):\n${JSON.stringify(data || [], null, 2)}\n`;
  }

  return ctx + "\n=== END SYSTEM DATA ===\n";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const contextBlock = await fetchUserContext(supabase, user.id, lastUserMsg);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextBlock },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits required" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
