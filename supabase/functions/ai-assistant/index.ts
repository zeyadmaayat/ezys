import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "openai/gpt-5.6-sol";

const SYSTEM_PROMPT = `You are EzySuite AI — the intelligent copilot embedded inside ezy Logistic HUB (a Logistics / ERP platform by ZEYAD).

LANGUAGE: Always reply in the SAME language the user writes in (Arabic ↔ English). Professional, natural, human tone. Keep it simple and clear.

DATA ACCESS:
- You have a tool "query_erp" that reads the signed-in user's real company data (row-level security applies, you only ever see their own company).
- Modules: kpis, shipments, orders, invoices, clients, items, inventory, expenses, purchase_orders, requisitions, leads.
- ALWAYS call query_erp before answering any question about "my / our" data, numbers, totals, status, or performance. Never guess or invent records.
- You may call it several times (e.g. invoices + shipments) to cross-check before concluding.

ACTIONS:
- You cannot write to the database directly. When the user asks you to create something, call "propose_action" with a clear summary and the payload.
- The user then reviews and confirms it in the UI. After proposing, tell the user briefly what is waiting for their confirmation.
- Never propose an action the user did not ask for.

DOCUMENTS & IMAGES:
- The user may attach invoices, packing lists, bills of lading, product photos or screenshots. Read them carefully, extract the key fields (numbers, dates, parties, amounts, quantities, HS codes) and present them in a clean table. If something is unreadable, say so instead of guessing.

OUTPUT:
- Clean Markdown: headings, **bold**, tables for comparisons and lists of records, code blocks for scripts.
- Lead with the answer, then the supporting detail. Use emojis sparingly (📦 📊 ✅ ⚠️).
- Amounts: keep the currency stored in the data. Regional defaults are Jordan (JO) / Amman.
- Structure long answers with headings so they export cleanly to PDF.`;

const TOOLS = [
  {
    type: "function",
    name: "query_erp",
    description:
      "Read the signed-in user's live company data from the ERP. Use for any question about their shipments, orders, invoices, clients, items, stock, expenses, purchase orders, requisitions, sales leads, or overall KPIs.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        module: {
          type: "string",
          enum: [
            "kpis",
            "shipments",
            "orders",
            "invoices",
            "clients",
            "items",
            "inventory",
            "expenses",
            "purchase_orders",
            "requisitions",
            "leads",
          ],
          description: "Which dataset to read. 'kpis' returns aggregate counts and totals across modules.",
        },
        status: { type: ["string", "null"], description: "Optional status filter, exactly as stored (e.g. 'Draft', 'IN_TRANSIT')." },
        search: { type: ["string", "null"], description: "Optional free-text search on the main name/number column." },
        limit: { type: ["number", "null"], description: "Max rows to return (default 25, max 100)." },
      },
      required: ["module", "status", "search", "limit"],
    },
  },
  {
    type: "function",
    name: "propose_action",
    description:
      "Propose a write action for the user to confirm in the UI. Nothing is saved until the user approves it.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        action: {
          type: "string",
          enum: ["create_client", "create_shipment", "create_expense", "create_lead", "create_item"],
        },
        summary_en: { type: "string", description: "One short sentence describing what will be created." },
        summary_ar: { type: "string", description: "Same summary in Arabic." },
        payload_json: {
          type: "string",
          description:
            "JSON object string with the fields. create_client: name, type(CLIENT|VENDOR), email, phone. create_shipment: origin, destination, client_name, expected_delivery, notes. create_expense: category, amount, currency, vendor_name, description, expense_date. create_lead: name, company_name, email, phone, expected_revenue. create_item: sku, name, unit, barcode.",
        },
      },
      required: ["action", "summary_en", "summary_ar", "payload_json"],
    },
  },
];

type Sb = ReturnType<typeof createClient>;

async function queryErp(sb: Sb, companyId: string, args: Record<string, unknown>) {
  const module = String(args.module || "");
  const status = args.status ? String(args.status) : null;
  const search = args.search ? String(args.search) : null;
  const limit = Math.min(Number(args.limit) || 25, 100);

  const run = async (
    table: string,
    cols: string,
    searchCol?: string,
    orderCol = "created_at",
  ) => {
    let q = sb.from(table).select(cols).eq("company_id", companyId).order(orderCol, { ascending: false }).limit(limit);
    if (status) q = q.eq("status", status);
    if (search && searchCol) q = q.ilike(searchCol, `%${search}%`);
    const { data, error } = await q;
    if (error) return { error: error.message };
    return { count: data?.length || 0, rows: data || [] };
  };

  switch (module) {
    case "shipments":
      return run("shipments_v2", "tracking_number,status,origin,destination,expected_delivery,actual_delivery,created_at", "tracking_number");
    case "orders":
      return run("orders", "order_number,status,delivery_address,requested_date,created_at", "order_number");
    case "invoices":
      return run("invoices_v2", "invoice_number,status,amount,currency,due_date,paid_at,created_at", "invoice_number");
    case "clients":
      return run("clients", "name,type,email,phone,is_active,created_at", "name");
    case "items":
      return run("items", "sku,name,unit,barcode,weight_kg,is_active", "name", "created_at");
    case "expenses":
      return run("expenses", "expense_number,category,amount,currency,expense_date,vendor_name,description", "vendor_name", "expense_date");
    case "purchase_orders":
      return run("purchase_orders", "po_number,status,total_amount,currency,expected_date,created_at", "po_number");
    case "requisitions":
      return run("purchase_requisitions", "requisition_number,status,priority,needed_by,created_at", "requisition_number");
    case "leads":
      return run("sales_leads", "name,company_name,status,source,expected_revenue,created_at", "name");
    case "inventory": {
      const { data, error } = await sb
        .from("inventory")
        .select("quantity,reserved_quantity,items!inner(sku,name,unit,company_id),locations(name)")
        .eq("items.company_id", companyId)
        .limit(limit);
      if (error) return { error: error.message };
      return { count: data?.length || 0, rows: data || [] };
    }
    case "kpis": {
      const c = (t: string) => sb.from(t).select("*", { count: "exact", head: true }).eq("company_id", companyId);
      const [ship, ord, cli, itm] = await Promise.all([c("shipments_v2"), c("orders"), c("clients"), c("items")]);
      const { data: inv } = await sb.from("invoices_v2").select("status,amount,currency").eq("company_id", companyId).limit(500);
      const { data: exp } = await sb.from("expenses").select("category,amount,currency").eq("company_id", companyId).limit(500);
      const sum = (rows: any[] | null, pred: (r: any) => boolean) =>
        (rows || []).filter(pred).reduce((s, r) => s + Number(r.amount || 0), 0);
      return {
        shipments_total: ship.count || 0,
        orders_total: ord.count || 0,
        clients_total: cli.count || 0,
        items_total: itm.count || 0,
        invoices_total: inv?.length || 0,
        invoiced_amount: sum(inv, () => true),
        unpaid_amount: sum(inv, (r) => r.status !== "Paid" && r.status !== "Cancelled"),
        paid_amount: sum(inv, (r) => r.status === "Paid"),
        expenses_amount: sum(exp, () => true),
        expenses_by_category: (exp || []).reduce((acc: Record<string, number>, r: any) => {
          acc[r.category] = (acc[r.category] || 0) + Number(r.amount || 0);
          return acc;
        }, {}),
      };
    }
    default:
      return { error: `Unknown module: ${module}` };
  }
}

function buildInput(messages: any[], attachments: any[]) {
  const input: any[] = messages.map((m: any) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: [
      m.role === "assistant"
        ? { type: "output_text", text: String(m.content || "") }
        : { type: "input_text", text: String(m.content || "") },
    ],
  }));

  if (attachments?.length) {
    const last = input[input.length - 1];
    if (last && last.role === "user") {
      for (const a of attachments) {
        if (String(a.mime || "").startsWith("image/")) {
          last.content.push({ type: "input_image", image_url: a.data_url });
        } else {
          last.content.push({ type: "input_file", filename: a.name || "file", file_data: a.data_url });
        }
      }
    }
  }
  return input;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { messages = [], attachments = [] } = await req.json();
    const { data: profile } = await sb.from("profiles").select("company_id").eq("id", user.id).maybeSingle();
    const companyId = profile?.company_id as string | undefined;

    const runIdHeader = req.headers.get("X-Lovable-AIG-Run-ID")?.trim();
    const input = buildInput(messages, attachments);

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

        try {
          for (let round = 0; round < 5; round++) {
            const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Lovable-API-Key": LOVABLE_API_KEY,
                "X-Lovable-AIG-SDK": "fetch",
                ...(runIdHeader ? { "X-Lovable-AIG-Run-ID": runIdHeader } : {}),
              },
              body: JSON.stringify({
                model: MODEL,
                instructions: SYSTEM_PROMPT + (companyId ? "" : "\n\nNOTE: This user has no company yet — data tools will return nothing."),
                input,
                tools: TOOLS,
                stream: true,
                store: false,
                reasoning: { effort: "medium", summary: "auto" },
                include: ["reasoning.encrypted_content"],
              }),
            });

            if (!res.ok || !res.body) {
              const body = await res.text();
              console.error("gateway error", res.status, body);
              send({ type: "error", status: res.status, message: res.status === 429 ? "rate_limited" : res.status === 402 ? "credits_required" : "gateway_error" });
              break;
            }

            const reader = res.body.getReader();
            const dec = new TextDecoder();
            let buf = "";
            const calls: { call_id: string; name: string; args: string; item: any }[] = [];
            const outputItems: any[] = [];

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              let nl: number;
              while ((nl = buf.indexOf("\n")) !== -1) {
                const line = buf.slice(0, nl).replace(/\r$/, "");
                buf = buf.slice(nl + 1);
                if (!line.startsWith("data: ")) continue;
                const payload = line.slice(6).trim();
                if (!payload || payload === "[DONE]") continue;
                let ev: any;
                try { ev = JSON.parse(payload); } catch { continue; }

                if (ev.type === "response.reasoning_summary_text.delta" && ev.delta) {
                  send({ type: "reasoning", delta: ev.delta });
                } else if (ev.type === "response.output_text.delta" && ev.delta) {
                  send({ type: "text", delta: ev.delta });
                } else if (ev.type === "response.output_item.done" && ev.item) {
                  outputItems.push(ev.item);
                  if (ev.item.type === "function_call") {
                    calls.push({ call_id: ev.item.call_id, name: ev.item.name, args: ev.item.arguments || "{}", item: ev.item });
                    send({ type: "tool", name: ev.item.name, status: "running" });
                  }
                } else if (ev.type === "response.failed" || ev.type === "error") {
                  console.error("responses error", JSON.stringify(ev).slice(0, 800));
                  send({ type: "error", status: 500, message: "gateway_error" });
                }
              }
            }

            if (!calls.length) break;

            // Round-trip: resend returned items, then append tool outputs.
            for (const item of outputItems) input.push(item);

            for (const call of calls) {
              let args: Record<string, unknown> = {};
              try { args = JSON.parse(call.args); } catch { /* ignore */ }
              let output: unknown;

              if (call.name === "query_erp") {
                output = companyId ? await queryErp(sb, companyId, args) : { error: "No company linked to this user." };
                send({ type: "tool", name: call.name, status: "done", module: args.module });
              } else if (call.name === "propose_action") {
                let payload: unknown = {};
                try { payload = JSON.parse(String(args.payload_json || "{}")); } catch { /* ignore */ }
                send({
                  type: "proposal",
                  proposal: {
                    action: args.action,
                    summary_en: args.summary_en,
                    summary_ar: args.summary_ar,
                    payload,
                  },
                });
                output = { status: "awaiting_user_confirmation" };
              } else {
                output = { error: `Unknown tool ${call.name}` };
              }

              input.push({
                type: "function_call_output",
                call_id: call.call_id,
                output: JSON.stringify(output).slice(0, 60000),
              });
            }
          }
        } catch (e) {
          console.error("stream error", e);
          send({ type: "error", status: 500, message: "stream_failed" });
        } finally {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
