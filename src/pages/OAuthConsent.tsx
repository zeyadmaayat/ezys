import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import EzyLogo from "@/components/EzyLogo";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthDetails = {
  client?: { name?: string; client_uri?: string; redirect_uris?: string[] };
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
  scopes?: string[];
};
type OAuthResult = { redirect_url?: string; redirect_to?: string };
const oauthApi = () =>
  (supabase.auth as unknown as {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
      approveAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
      denyAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
    };
  }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthDetails | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      setEmail(sess.session.user.email ?? null);
      const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("The authorization server did not return a redirect URL.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an external application";
  const requestedScopes = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <EzyLogo size="md" />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
        </div>

        {error ? (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-center">Authorization failed</h1>
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        ) : !details ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading authorization request…</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold">
                Connect {clientName} to ezy Logistic HUB
              </h1>
              <p className="text-sm text-muted-foreground">
                This lets {clientName} use ezy Logistic HUB as you.
              </p>
              {email && (
                <p className="text-xs text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{email}</span>
                </p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
              <p className="font-medium">The application will be able to:</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Call ezy Logistic HUB tools while you are signed in</li>
                <li>Read your company's shipments, orders, invoices, and clients</li>
              </ul>
              {requestedScopes.length > 0 && (
                <p className="text-xs text-muted-foreground pt-2">
                  Requested scopes: {requestedScopes.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                This does not bypass ezy Logistic HUB's permissions or backend policies.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={busy}
                onClick={() => decide(false)}
              >
                Cancel connection
              </Button>
              <Button
                className="flex-1"
                disabled={busy}
                onClick={() => decide(true)}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
