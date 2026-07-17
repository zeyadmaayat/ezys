import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listShipments from "./tools/list-shipments";
import listOrders from "./tools/list-orders";
import listInvoices from "./tools/list-invoices";
import listClients from "./tools/list-clients";
import whoami from "./tools/whoami";

// Build the OAuth issuer from the project ref (Vite inlines this at build
// time). The fallback keeps the entry evaluable during manifest extraction.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ezy-logistic-hub-mcp",
  title: "ezy Logistic HUB",
  version: "0.1.0",
  instructions:
    "Tools for ezy Logistic HUB (Logistics ERP). Query the signed-in user's company data: shipments, orders, invoices, clients. All tools respect company isolation and RBAC via row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listShipments, listOrders, listInvoices, listClients],
});
