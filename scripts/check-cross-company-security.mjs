#!/usr/bin/env node
/**
 * Cross-company security guard (CI merge gate).
 *
 * Fails (exit 1) when a *newly added/changed* migration introduces an RLS
 * pattern that can leak data across companies / tenants. This is the gate that
 * blocks merges whenever a new cross-company security finding would appear in
 * the security scan.
 *
 * IMPORTANT: migrations are append-only history. We must NOT scan the whole
 * history (it contains old policies that were later fixed). We only scan the
 * SQL files that this change actually adds/modifies.
 *
 * File selection (in order):
 *   1. Explicit file paths passed as CLI args.
 *   2. $CHANGED_FILES (newline/space separated) — set by CI from the PR diff.
 *   3. git diff against $BASE_REF (default: origin/main) ... HEAD.
 *
 * Detected anti-patterns (only inside CREATE POLICY statements on tenant tables):
 *   1. `company_id IS NULL` in the policy expression — exposes orphan rows.
 *   2. `USING (true)` / `WITH CHECK (true)` — disables company isolation.
 *   3. FOR SELECT policy whose body never references company/user scoping.
 *
 * Escape hatches (two options):
 *   A. Formal allowlist (preferred): add the table to
 *      `security/public-tables-allowlist.json` with a documented reason. This
 *      keeps intentional public tables tracked in one reviewable place.
 *   B. Inline: add `-- cross-company-ok` on the statement for a one-off.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load the formal allowlist of intentionally-public tables from
 * security/public-tables-allowlist.json. Returns a lowercased Set of table names.
 */
function loadPublicTableAllowlist() {
  const path = resolve(__dirname, "..", "security", "public-tables-allowlist.json");
  if (!existsSync(path)) return new Set();
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    const entries = Array.isArray(parsed.publicTables) ? parsed.publicTables : [];
    return new Set(
      entries
        .map((e) => (typeof e === "string" ? e : e && e.table))
        .filter(Boolean)
        .map((t) => t.toLowerCase())
    );
  } catch (err) {
    console.error(
      `⚠️  Could not parse security/public-tables-allowlist.json: ${err.message}`
    );
    process.exit(1);
  }
}

const PUBLIC_TABLE_ALLOWLIST = loadPublicTableAllowlist();

const TENANT_TABLES = [
  "customers",
  "customer_addresses",
  "items",
  "order_items",
  "locations",
  "orders",
  "invoices",
  "invoice_items",
  "shipments_v2",
  "invoices_v2",
  "clients",
  "warehouses",
  "sales_products",
  "audit_log",
  "profiles",
  "user_roles",
];

const ALLOWLIST = ["cross-company-ok"];

function getChangedFiles() {
  // 1. CLI args
  const args = process.argv.slice(2).filter(Boolean);
  if (args.length) return args;

  // 2. CI-provided list
  if (process.env.CHANGED_FILES) {
    return process.env.CHANGED_FILES.split(/\s+/).filter(Boolean);
  }

  // 3. git diff against base ref
  const base = process.env.BASE_REF || "origin/main";
  try {
    const out = execSync(`git diff --name-only --diff-filter=AM ${base}...HEAD`, {
      encoding: "utf8",
    });
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mentionsTenantTable(stmt) {
  const lower = stmt.toLowerCase();
  return TENANT_TABLES.find((t) => new RegExp(`\\b(public\\.)?${t}\\b`).test(lower));
}

const files = getChangedFiles().filter(
  (f) => f.startsWith("supabase/migrations/") && f.endsWith(".sql") && existsSync(f)
);

if (files.length === 0) {
  console.log("✅ Cross-company security check: no new/changed migrations to scan.");
  process.exit(0);
}

const violations = [];

for (const file of files) {
  const sql = readFileSync(file, "utf8");
  for (const stmt of splitStatements(sql)) {
    const lower = stmt.toLowerCase();
    if (ALLOWLIST.some((a) => lower.includes(a))) continue;

    // Only CREATE POLICY statements define access — backfill UPDATEs etc. are ignored.
    if (!/\bcreate\s+policy\b/.test(lower)) continue;

    const table = mentionsTenantTable(stmt);
    if (!table) continue;

    const snippet = stmt.slice(0, 160).replace(/\s+/g, " ");

    // A read-exposing policy is anything that isn't a pure INSERT policy
    // (SELECT / UPDATE / DELETE / ALL, or no FOR clause = ALL). Allowing
    // company_id IS NULL in an INSERT WITH CHECK is not a cross-company read leak.
    const isInsertOnly = /\bfor\s+insert\b/.test(lower);

    // 1. company_id IS NULL leak (read paths only).
    if (!isInsertOnly && /\bcompany_id\s+is\s+null\b/.test(lower)) {
      violations.push({
        file,
        table,
        rule: "company_id IS NULL in read policy — exposes orphan rows cross-company",
        snippet,
      });
    }


    // 2. USING (true) / WITH CHECK (true) disables isolation.
    if (/\b(using|with\s+check)\s*\(\s*true\s*\)/.test(lower)) {
      violations.push({
        file,
        table,
        rule: "USING/WITH CHECK (true) on a tenant table — no company isolation",
        snippet,
      });
    }

    // 3. SELECT policy that never references company/user scoping.
    if (/\bfor\s+select\b/.test(lower)) {
      const referencesScope =
        /company_id/.test(lower) ||
        /get_user_company_id/.test(lower) ||
        /auth\.uid\(\)\s*=\s*[\w.]*id/.test(lower) ||
        /\buser_id\b/.test(lower) ||
        /\bcreated_by\b/.test(lower);
      if (!referencesScope) {
        violations.push({
          file,
          table,
          rule: "SELECT policy on tenant table without company/user scoping",
          snippet,
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error("\n❌ Cross-company security check FAILED\n");
  for (const v of violations) {
    console.error(`  • [${v.table}] ${v.rule}`);
    console.error(`    ${v.file}`);
    console.error(`    > ${v.snippet}\n`);
  }
  console.error(
    `${violations.length} cross-company risk(s) found in new migrations. Scope the ` +
      `policy by company_id = get_user_company_id(auth.uid()) (drop any ` +
      `"company_id IS NULL" / "USING (true)"), or annotate the statement with ` +
      `"-- cross-company-ok" if it is intentionally public.\n`
  );
  process.exit(1);
}

console.log(
  `✅ Cross-company security check passed — scanned ${files.length} new migration(s), no tenant-isolation leaks.`
);
