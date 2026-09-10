# EzySuite — ezy Logistic HUB

> Multi-tenant logistics ERP SaaS. Solo-built, pre-revenue, preparing for asset sale.

---

## 1. Project overview

**EzySuite** (branded as *ezy Logistic HUB*) is a logistics ERP sold as a multi-tenant SaaS. The current product focus — and the only module wired into navigation/routing — is the **`/saas/*`** module. It gives a company and its users a shared workspace for shipments, clients, warehouses, invoices, role-based access, field-level permissions, audit logging, compliance tracking, and developer API/webhooks.

The codebase also contains several fully-coded secondary modules that have been disconnected from routing and navigation as step 1 of a product consolidation. They remain in the repository and can be re-enabled by a buyer if desired (see [Bonus / dormant modules](#5-bonus--dormant-modules)).

---

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, shadcn/ui primitives |
| State / data | TanStack Query (React Query), React Router 7 |
| Backend | Supabase — Postgres, Auth, Edge Functions, RLS, Realtime |
| AI / MCP | Lovable AI Gateway, OpenAI-compatible responses API, OAuth-protected MCP server |
| CI / security | GitHub Actions, custom cross-company RLS security guard |

---

## 3. Core product architecture (`/saas/*`)

Every tenant-scoped table is isolated by `company_id`. All live `/saas/*` queries include `.eq('company_id', company.id)` and the RLS policies enforce `company_id = get_user_company_id(auth.uid())`. New users default to `is_approved = false`; an admin must approve them before they can create or access company data.

### Live `/saas/*` pages

| Route | Purpose |
|-------|---------|
| `/saas/setup` | Company onboarding / creation flow for new users. |
| `/saas/dashboard` | Operational dashboard with shipment and invoice KPIs. |
| `/saas/shipments` | Shipment lifecycle management (`shipments_v2` table). |
| `/saas/clients` | Client / vendor master data (`clients` table). |
| `/saas/warehouses` | Warehouse master data and inventory location defaults. |
| `/saas/invoices` | Invoice creation and status tracking (`invoices_v2` table). |
| `/saas/roles` | Role-based access control (`user_roles`, `app_role` enum). |
| `/saas/field-permissions` | Field-level redaction/masking by role. |
| `/saas/audit-log` | Tamper-evident activity log driven by `log_audit_event` RPC. |
| `/saas/compliance` | SOC 2 / ISO 27001 readiness center with control matrix. |
| `/saas/developers` | Developer docs, API key management, webhook endpoints & delivery logs. |

### Key data model

- **`shipments_v2`** and **`invoices_v2`** are the canonical operational tables used by the live product.
- **`clients`** is the unified customer/vendor master file.
- **`user_roles`** stores roles separately from `profiles` to avoid privilege escalation through profile updates.
- Non-v2 tables such as `shipments`, `invoices`, `orders`, `purchase_orders`, etc. belong to the disconnected legacy / bonus modules.

### Automated cross-company security check

- Workflow: `.github/workflows/security-cross-company.yml`
- Script: `scripts/check-cross-company-security.mjs`
- Allowlist: `security/public-tables-allowlist.json`

On every PR that touches `supabase/migrations/**`, the workflow scans **only newly added or changed migrations** for RLS anti-patterns that could leak data across tenants (`company_id IS NULL`, `USING (true)`, unscoped `SELECT` policies). Intentionally public tables are documented in the allowlist. The check fails the merge if a new risk is introduced.

---

## 4. Setup instructions

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see below)
cp .env.example .env   # if an example file exists; otherwise create .env manually

# 3. Start the dev server
npm run dev
```

The Vite dev server runs on `http://localhost:8080` by default.

### Required environment variables

Create a `.env` file in the project root with at least:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

The app reads Supabase configuration through `import.meta.env` in `src/integrations/supabase/client.ts`. Do not commit real keys to version control.

### Running the security check locally

```bash
# Scan all migrations (or pass specific files)
node scripts/check-cross-company-security.mjs supabase/migrations/*.sql
```

In CI the script uses `CHANGED_FILES` from the GitHub Actions diff step.

---

## 5. Bonus / dormant modules

The repository contains additional, fully-coded modules that are **not currently wired into navigation or routing**. They were disconnected as part of a product consolidation to focus the sale on the `/saas/*` core. The underlying page files, hooks, and database tables were intentionally left in place.

| Module | Path | Contents |
|--------|------|----------|
| General ERP | `/erp/*` | Orders, inventory, procurement, purchase orders, requisitions, goods receipts, return orders, blanket orders, locations. |
| Domestic Pro | `/dp/*` | Local delivery operations: drivers, COD settlements, delivery zones/shelves, risk alerts, governance events. |
| CRM / Sales | `/sales/*` | Leads, pipeline, quotations, sales products, customers. |
| Legacy AI planner | `/shipments`, `/shipments/:id`, `/logistics-assistant`, `/dashboard` (OpsDashboard) | Shipment planner, logistics chat assistant, old operations dashboard. |

Re-enabling any of these is a matter of restoring the relevant `<Route>` entries in `src/App.tsx` and the corresponding navigation links in the sidebar/header components.

---

## 6. Database

- Migrations live in `supabase/migrations/` (currently **54 migrations**).
- The project uses Supabase-managed Postgres with Row Level Security enabled on tenant tables.
- Edge functions live in `supabase/functions/` and cover AI assistance, action execution, webhooks, MCP, signup notifications, user approval, and alerts.
- **Operational tables for the live product:** `shipments_v2`, `invoices_v2`, `clients`, `warehouses`, `user_roles`, `profiles`, `companies`, `audit_log`, `api_keys`, `webhook_endpoints`, `webhook_deliveries`.

---

## 7. Known limitations

- **Pre-revenue** — no paying customers or production revenue yet.
- **Solo-built** — built by a single founder; no dedicated team.
- **No automated test suite** — there are currently no unit, integration, or E2E tests. Due diligence should include manual QA and any tests a buyer wishes to add.
- **Hosted on the Lovable free plan** — the preview/published URLs are managed by Lovable; migration to a paid plan or self-hosted Vercel is straightforward but not yet done.
- **AI / MCP features** rely on Lovable AI Gateway credits; heavy usage may require a paid plan or a custom API key.
- **SAML SSO** is stubbed in the auth flow but requires external IdP metadata to be fully activated.

---

## 8. Contact / sale context

This repository is being prepared for an asset sale. The intended scope of the sale is the `/saas/*` multi-tenant logistics ERP module plus the surrounding landing/marketing pages, auth flow, AI assistant, and developer platform. The disconnected modules in `/erp/*`, `/dp/*`, `/sales/*`, and the legacy shipment planner are included in the codebase as re-enableable assets but are not part of the current go-to-market product surface.
