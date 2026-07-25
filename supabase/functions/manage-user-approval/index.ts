import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const approved = body?.approved === true;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    const requesterId = claimsData?.claims?.sub;

    if (claimsError || !requesterId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: requesterId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Company scoping: an admin may only manage users that belong to their
    // own company. Prevents cross-company approval / privilege escalation.
    const { data: requesterProfile, error: reqProfileErr } = await adminClient
      .from("profiles")
      .select("company_id")
      .eq("id", requesterId)
      .maybeSingle();

    const { data: targetProfile, error: targetProfileErr } = await adminClient
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (reqProfileErr || targetProfileErr || !targetProfile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requesterCompany = requesterProfile?.company_id ?? null;
    const targetCompany = targetProfile?.company_id ?? null;

    // Allow approving brand-new users that have no company yet (pending signups),
    // otherwise both companies must match.
    if (targetCompany !== null && targetCompany !== requesterCompany) {
      return new Response(JSON.stringify({ error: "Cross-company action not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ is_approved: approved })
      .eq("id", userId);

    if (profileError) throw profileError;

    if (approved) {
      const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (confirmError) throw confirmError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Approval update failed:", error);
    await sendAlert("manage-user-approval", "error", String(error));
    return new Response(JSON.stringify({ error: "Could not update approval" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendAlert(source: string, severity: string, message: string, context: unknown = {}) {
  try {
    const secret = Deno.env.get("ALERT_WEBHOOK_SECRET");
    const url = Deno.env.get("SUPABASE_URL");
    if (!secret || !url) return;
    await fetch(`${url}/functions/v1/send-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-alert-secret": secret },
      body: JSON.stringify({ source, severity, message, context }),
    });
  } catch (e) {
    console.error("alert dispatch failed", e);
  }
}