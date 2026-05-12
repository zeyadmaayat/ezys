#!/usr/bin/env node
// Guard: ensure all country/city defaults across hooks, forms, and seed are JO / Amman.
// Usage: node scripts/check-defaults.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src/hooks", "src/pages", "src/components", "supabase/functions"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

const ALLOWED_COUNTRY = "JO";
const ALLOWED_CITY = "Amman";

// Allow seed data using a list of Jordanian cities
const ALLOWED_CITIES = new Set([
  "Amman", "Irbid", "Zarqa", "Aqaba", "Salt", "Madaba", "Jerash", "Mafraq", "Karak", "Tafilah", "Maan", "Ajloun"
]);

const COUNTRY_RE = /\b(country|country_code|origin_country|destination_country)\s*[:=]\s*['"]([A-Z]{2})['"]/g;
const CITY_RE = /\b(city|origin_city|destination_city)\s*[:=]\s*['"]([^'"]+)['"]/g;

const violations = [];

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXTS.has(extname(p))) scan(p);
  }
}

function scan(file) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // skip comments
    if (/^\s*\/\//.test(line)) continue;

    for (const m of line.matchAll(COUNTRY_RE)) {
      if (m[2] !== ALLOWED_COUNTRY) {
        violations.push({ file, line: i + 1, text: line.trim(), reason: `country must be "${ALLOWED_COUNTRY}", found "${m[2]}"` });
      }
    }
    for (const m of line.matchAll(CITY_RE)) {
      const v = m[2];
      // Skip dynamic values, placeholders, empty strings, template parts
      if (!v || v.includes("${") || v.includes("{{") || v === "" ) continue;
      // Allow translated/rendered Arabic Amman
      if (v === "عمان") continue;
      if (!ALLOWED_CITIES.has(v)) {
        violations.push({ file, line: i + 1, text: line.trim(), reason: `city must be "${ALLOWED_CITY}" (or a Jordanian city in seed), found "${v}"` });
      }
    }
  }
}

for (const r of ROOTS) walk(r);

if (violations.length) {
  console.error("\n❌ Defaults check FAILED. Found non-JO/Amman defaults:\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  — ${v.reason}`);
    console.error(`    > ${v.text}`);
  }
  console.error(`\nTotal violations: ${violations.length}\n`);
  process.exit(1);
}

console.log("✅ Defaults check passed — all country/city defaults are JO / Amman.");
