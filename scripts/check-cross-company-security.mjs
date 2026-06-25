#!/usr/bin/env node
/**
 * Cross-company security guard.
 *
 * Fails (exit 1) when a migration introduces an RLS pattern that can leak data
 * across companies / tenants. This is the CI gate that blocks merges whenever a
 * new cross-company security finding would appear in the security scan.
 *
 * It scans every *.sql file under supabase/migrations and flags the known
 * anti-patterns that previous security findings were caused by:
 *
 *   1. `company_id IS NULL` (or `c.company_id IS NULL`) inside a policy —
 *      exposes orphan rows (no company) to every authenticated user.
 *   2. `USING (true)` / `WITH CHECK (true)` on a tenant table — disables
 *      company isolation entirely.
 *   3. CREATE POLICY ... FOR SELECT on a tenant table whose USING clause never
 *      references `company_id` / `get_user_company_id` — likely unscoped read.
 *
 * Tenant tables are detected by name. To intentionally allow a pattern (e.g. a
 * genuinely public table), add an inline `-- cross-company-ok` comment on the
 * same statement, or extend ALLOWLIST below.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";

// Tables that hold tenant-scoped data and must always be isolated by company.
const TENANT_TABLES = [
  "customers",
  "customer_addresses",
  "items",
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

// Statements explicitly allowed to skip the company-scope check.
const ALLOWLIST = ["cross-company-ok"];

function listSqlFiles(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out = out.concat(listSqlFiles(full));
    else if (name.endsWith(".sql")) out.push(full);
  }
  return out;
}

// Split a SQL file into individual statements (naive but good enough: split on
// semicolons that terminate statements; policy bodies don't contain `;`).
function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mentionsTenantTable(stmt) {
  const lower = stmt.toLowerCase();
  return TENANT_TABLES.find((t) =>
    new RegExp(`\\b(public\\.)?${t}\\b`).test(lower)
  );
}

const violations = [];

for (const file of listSqlFiles(MIGRATIONS_DIR)) {
  const sql = readFileSync(file, "utf8");
  for (const stmt of splitStatements(sql)) {
    const lower = stmt.toLowerCase();
    if (ALLOWLIST.some((a) => lower.includes(a))) continue;

    const isPolicy = /\bcreate\s+policy\b/.test(lower);
    const table = mentionsTenantTable(stmt);

    // 1. company_id IS NULL leak inside any policy/statement on a tenant table.
    if (table && /\bcompany_id\s+is\s+null\b/.test(lower)) {
      violations.push({
        file,
        table,
        rule: "company_id IS NULL in policy — exposes orphan rows cross-company",
        snippet: stmt.slice(0, 160).replace(/\s+/g, " "),
      });
    }

    if (isPolicy && table) {
      // 2. USING (true) / WITH CHECK (true) disables isolation.
      if (/\b(using|with\s+check)\s*\(\s*true\s*\)/.test(lower)) {
        violations.push({
          file,
          table,
          rule: "USING/WITH CHECK (true) on a tenant table — no company isolation",
          snippet: stmt.slice(0, 160).replace(/\s+/g, " "),
        });
      }

      // 3. SELECT policy that never references company scoping.
      const isSelect = /\bfor\s+select\b/.test(lower);
      const referencesScope =
        /company_id/.test(lower) ||
        /get_user_company_id/.test(lower) ||
        /auth\.uid\(\)\s*=\s*\w*id/.test(lower) || // self-row policies (e.g. profiles.id)
        /\buser_id\b/.test(lower); // user-owned rows
      if (isSelect && !referencesScope) {
        violations.push({
          file,
          table,
          rule: "SELECT policy on tenant table without company/user scoping",
          snippet: stmt.slice(0, 160).replace(/\s+/g, " "),
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
    `${violations.length} cross-company risk(s) found. Fix the policy to scope by ` +
      `company_id = get_user_company_id(auth.uid()), or annotate the statement ` +
      `with "-- cross-company-ok" if it is intentionally public.\n`
  );
  process.exit(1);
}

console.log("✅ Cross-company security check passed — no tenant-isolation leaks found.");
