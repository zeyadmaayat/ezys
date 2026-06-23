import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Only emails matching this exact pattern are eligible for deletion.
// These are the throwaway accounts created by the realtime verification script.
const STAGING_EMAIL_RE = /^rt-staging-\d+@example\.com$/i;

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

    // Optional: pass { "dryRun": true } to preview without deleting.
    let dryRun = false;
    try {
      const body = await req.json();
      dryRun = body?.dryRun === true;
    } catch {
      // no body provided -> default dryRun = false
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Verify the caller is an authenticated admin (RLS-respecting client).
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

    // 2) Service-role client to enumerate and delete auth users.
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Page through all auth users and collect the ephemeral staging accounts.
    const matches: { id: string; email: string }[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data?.users ?? [];
      for (const u of users) {
        if (u.email && STAGING_EMAIL_RE.test(u.email)) {
          matches.push({ id: u.id, email: u.email });
        }
      }
      if (users.length < perPage) break;
      page += 1;
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({ success: true, dryRun: true, found: matches.length, users: matches }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Delete each matched user. Deleting the auth user cascades to
    // profiles / user_roles / notifications via their ON DELETE CASCADE FKs.
    const deleted: string[] = [];
    const failed: { id: string; email: string; error: string }[] = [];
    for (const m of matches) {
      const { error } = await adminClient.auth.admin.deleteUser(m.id);
      if (error) {
        failed.push({ ...m, error: error.message });
      } else {
        deleted.push(m.email);
      }
    }

    console.log(`Staging cleanup by ${requesterId}: deleted ${deleted.length}, failed ${failed.length}`);

    return new Response(
      JSON.stringify({ success: true, found: matches.length, deleted, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Staging cleanup failed:", error);
    return new Response(JSON.stringify({ error: "Could not clean up staging users" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
