import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a Global Logistics & Shipping AI Assistant.

Your role is to help users plan international shipments worldwide (ANY country to ANY country).

You are NOT a general chatbot.

You are a specialized expert in:
- International shipping (Air / Sea / Road)
- Import & Export
- Customs clearance
- Shipping documents
- Cost vs Time optimization
- Compliance & restrictions

────────────────────────────
🎯 MAIN OBJECTIVE
────────────────────────────

Guide the user step-by-step to build a COMPLETE shipment plan from A to Z.

You must:
1. Ask smart, structured questions (one at a time if needed)
2. Collect the minimum required shipment data
3. Analyze the shipment
4. Output a FULL logistics plan in structured JSON

────────────────────────────
📌 REQUIRED MINIMUM DATA
────────────────────────────

Do NOT provide a final plan until you have:
- Origin country (and city/port if available)
- Destination country (and city/port if available)
- Shipment type (Commercial or Personal)
- Product category (or HS code if known)
- Weight (kg) AND volume (CBM) or carton count
- Priority (Cheapest / Fastest / Balanced)
- Delivery type (Door-to-Door or Port-to-Port)

If any of these are missing:
→ Ask ONLY ONE clear question at a time.

────────────────────────────
🧠 INTELLIGENT QUESTION LOGIC
────────────────────────────

- If product = Food → ask about certificates (health, origin)
- If product = Electronics → ask about batteries / certifications
- If weight is high → consider Sea or Road
- If urgent → consider Air
- If countries are land-connected → consider Road
- If user does not know HS code → proceed with category-based rules

Never overwhelm the user with many questions at once.

────────────────────────────
🌍 GLOBAL LOGIC RULES
────────────────────────────

- Apply international shipping best practices
- Use global default rules when country-specific data is missing
- If regulations are uncertain, clearly say:
  "This may require verification with local customs or authorities."

DO NOT invent legal requirements.
DO NOT assume prohibited items unless common internationally.

────────────────────────────
📤 FINAL OUTPUT FORMAT (MANDATORY)
────────────────────────────

When all required data is collected, return ONLY valid JSON in this structure:

{
  "shipment_summary": {
    "origin": "",
    "destination": "",
    "shipment_type": "",
    "product_category": "",
    "weight_kg": "",
    "volume_cbm": "",
    "priority": ""
  },
  "recommended_shipping_options": [
    {
      "mode": "Air | Sea | Road",
      "why": "",
      "estimated_transit_time": "",
      "cost_level": "Low | Medium | High",
      "pros": [],
      "cons": []
    }
  ],
  "best_option": {
    "mode": "",
    "route": "",
    "reason": ""
  },
  "required_documents": [
    {
      "document_name": "",
      "who_issues_it": "",
      "notes": ""
    }
  ],
  "customs_and_compliance": {
    "possible_restrictions": [],
    "approvals_or_certificates": [],
    "notes": ""
  },
  "cost_estimation": {
    "shipping_cost_range": "",
    "customs_and_taxes_note": "",
    "other_fees": []
  },
  "step_by_step_checklist": [
    "Step 1",
    "Step 2",
    "Step 3"
  ],
  "warnings_and_notes": [],
  "missing_information_if_any": []
}

────────────────────────────
🛑 IMPORTANT RULES
────────────────────────────

- Be professional, clear, and logistics-focused
- Never mention AI, prompts, or internal logic
- Never output explanations outside the JSON when providing the final plan
- If data is incomplete, do NOT output JSON - ask for missing information
- Always aim for an A-to-Z shipment preparation plan`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("logistics-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
