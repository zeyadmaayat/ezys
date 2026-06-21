import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = (Deno.env.get("RESEND_API_KEY") || "").trim();

// Where admin alerts are sent
const ADMIN_EMAIL = "zeyadmaayta@outlook.com";
// Verified sender for this project
const FROM = "ezy Logistic HUB <noreply@logimaayta.lovable.app>";
const APP_URL = "https://ezys.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SignupNotification {
  email: string;
  displayName: string;
}

async function sendEmail(payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return text;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SignupNotification = await req.json();
    const rawEmail = (body?.email || "").trim();
    const displayName = (body?.displayName || "").trim();

    const emailOk =
      typeof rawEmail === "string" &&
      rawEmail.length > 3 &&
      rawEmail.length <= 255 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);

    if (!emailOk) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeName = (displayName || rawEmail.split("@")[0]).slice(0, 100);
    const safeEmail = rawEmail.slice(0, 255);
    const now = new Date().toLocaleString("en-GB", { timeZone: "Asia/Amman" });

    // 1) Alert email to the admin
    const adminEmail = sendEmail({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: "🔔 New User Registration — Approval Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">
            New User Registration
          </h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin:6px 0;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin:6px 0;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${now}</p>
          </div>
          <p style="color: #666;">
            This user is waiting for your approval. Log in to the admin panel to approve or reject this registration.
          </p>
          <a href="${APP_URL}/saas/roles"
             style="display: inline-block; background: #e94560; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Go to User Management
          </a>
        </div>
      `,
    });

    // 2) "We received your request" email to the new user
    const welcomeEmail = sendEmail({
      from: FROM,
      to: [safeEmail],
      subject: "✅ We received your request — ezy Logistic HUB",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">
            Welcome, ${safeName} 👋
          </h1>
          <p style="color:#333; font-size:15px; line-height:1.6;">
            Thank you for signing up to <strong>ezy Logistic HUB</strong>.
            We have received your access request and our team will review it shortly.
          </p>
          <div style="background:#f5f5f5; padding:16px 20px; border-radius:8px; margin:20px 0; color:#333;">
            <p style="margin:0;">You will receive a confirmation email as soon as your account is approved and ready to use.</p>
          </div>
          <p style="color:#666; font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />

          <div dir="rtl" style="text-align:right; color:#333; font-size:15px; line-height:1.8;">
            <p>مرحباً ${safeName}،</p>
            <p>شكراً لتسجيلك في <strong>ezy Logistic HUB</strong>. لقد استلمنا طلب الدخول الخاص بك وسيقوم فريقنا بمراجعته في أقرب وقت.</p>
            <p style="color:#666;">سيصلك إيميل تأكيد فور الموافقة على حسابك وتفعيله.</p>
          </div>
        </div>
      `,
    });

    const [adminRes, welcomeRes] = await Promise.allSettled([adminEmail, welcomeEmail]);
    if (adminRes.status === "rejected") console.error("Admin email failed:", adminRes.reason);
    if (welcomeRes.status === "rejected") console.error("Welcome email failed:", welcomeRes.reason);

    return new Response(
      JSON.stringify({
        success: true,
        adminSent: adminRes.status === "fulfilled",
        welcomeSent: welcomeRes.status === "fulfilled",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending signup notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
