# Logistics Expansion for the SaaS Module

Eight new capabilities added on top of the existing multi-tenant SaaS module (Dashboard, Shipments, Clients, Warehouses, Invoices, Roles, Audit, Compliance, Developers). Everything stays inside `/saas/*`; the dormant erp/dp/sales modules are untouched.

Confirmed starting point: `shipments_v2` today stores only free-text `origin`/`destination`, a 5-step status, one `tracking_number`, `client_id`, `warehouse_id`. `warehouses` has name/location/city/country. `inventory` is quantity per item+location, with no company column of its own. So most of the new work is additive tables plus new nullable columns.

---

## 1. Real-time shipment tracking
What the user gets: a live map/timeline per shipment, position updates and status history that refresh without reloading the page.

- Schema: new `shipment_events` (shipment, status, note, actor, timestamp) and `shipment_positions` (shipment, lat, lng, speed, recorded_at, source). New nullable columns on `shipments_v2`: `current_lat`, `current_lng`, `last_position_at`, `eta`.
- Realtime enabled on both new tables, scoped by `company_id` so one tenant never sees another's movement.
- Effort: medium (about 2-3 days of build).
- External: map rendering needs a tile provider (Mapbox or MapLibre + OpenStreetMap tiles; MapLibre/OSM has a free tier).

## 2. Route planning / optimization
What the user gets: pick several shipments, get a suggested stop order with distance and time per leg, save it as a route.

- Schema: `routes` (company, name, date, driver, vehicle, total distance/duration, status) and `route_stops` (route, shipment, sequence, planned arrival, actual arrival, lat/lng).
- Phase 1: nearest-neighbour ordering computed in an edge function - no external cost. Phase 2: real road distances/turn-by-turn from a routing API.
- Effort: high (4-6 days) - the optimizer plus the map/drag-reorder UI.
- External: optional - Mapbox Optimization or Google Routes (both paid past a small free tier); ORS/OSRM is a free alternative with rate limits.

## 3. Fleet management (drivers + vehicles)
What the user gets: driver and vehicle records, assignment to routes/shipments, availability, document expiry reminders.

- Schema: `fleet_drivers` (company, name, phone, licence no/expiry, status, optional linked user) and `fleet_vehicles` (company, plate, type, capacity kg/m3, odometer, insurance + registration expiry, status). New nullable `driver_id`, `vehicle_id` on `shipments_v2`.
- Kept separate from the dormant `dp_drivers` table so nothing dormant is reactivated.
- Effort: medium (2-3 days) - mostly standard CRUD plus guards.
- External: none.

## 4. Real-time inventory tracking
What the user gets: stock levels per hub that update live as goods move, with a movement history and low-stock alerts.

- Schema: add `company_id` (nullable, backfilled) to `inventory` so it is tenant-scoped directly; new `stock_movements` (company, item, from/to location, qty, reason, shipment ref, actor, timestamp); new `stock_alerts` rules (item, location, min qty).
- Realtime on `inventory` and `stock_movements`, filtered by company.
- Effort: medium-high (3-4 days), mostly because the existing `inventory`/`items` tables were built for the dormant ERP flow and need tenant-scoping done additively.
- External: none.

## 5. Carrier integrations (Aramex, DHL, ...)
What the user gets: paste or generate a carrier tracking number and see the carrier's own status updates inside the app, with optional label creation later.

- Schema: `carriers` (company, code, display name, enabled), `carrier_credentials` (company, carrier, reference to stored secret - never the raw key in a readable column), `carrier_shipments` (shipment, carrier, carrier tracking no, last status, last synced), `carrier_sync_log`. New nullable `carrier_id` + `carrier_tracking_number` on `shipments_v2`.
- One edge function per carrier adapter behind a shared interface, plus a scheduled poller that refreshes open shipments and writes into `shipment_events`.
- Effort: high (3-5 days for the framework plus 1-2 days per carrier).
- External and cost: yes, this is the one feature that genuinely depends on third parties. Aramex offers a SOAP/REST API with a free account for registered business customers. DHL requires a developer account; tracking is free at low volume, shipment creation needs a commercial contract. Both need real business credentials the user must obtain and paste into project secrets - I cannot get these. Sandbox testing is possible for both.

## 6. Freight cost calculator
What the user gets: enter weight, dimensions, distance and service level, get a price - used both for quoting and to prefill invoices.

- Schema: `rate_cards` (company, name, currency, effective dates), `rate_rules` (rate card, service level, origin/destination zone, weight and distance brackets, base price, per-kg, per-km, min charge), `zones` (company, name, cities/postcodes). New nullable `weight_kg`, `volume_m3`, `service_level`, `quoted_cost` on `shipments_v2`.
- Chargeable weight uses the standard greater-of actual vs volumetric rule.
- Effort: medium (3 days) - the rules editor is most of it.
- External: none for own rates; live carrier rates only if #5 is in place.

## 7. Warehouse & hub management (deeper)
What the user gets: hubs with type, capacity, coordinates, operating hours, contact, plus zones/aisles/bins inside each and an occupancy view.

- Schema: additive nullable columns on `warehouses` (type: hub/depot/branch, lat, lng, capacity, operating hours JSON, contact, manager). New `warehouse_zones` and `warehouse_bins` (code, type, capacity, occupied). `inventory` gains a nullable `bin_id`.
- Effort: medium (2-3 days).
- External: geocoding for coordinates (optional, free tier available).

## 8. Customer self-service portal
What the user gets: a public page where a customer enters a tracking number (no login) and sees status and progress; optionally a logged-in client area listing their own shipments and invoices.

- Schema: `tracking_tokens` (shipment, opaque public token, expiry) so a tracking number alone cannot be enumerated; a public read path via an edge function rather than direct table access, returning only status, milestones and ETA - never internal cost, driver or margin fields. Optional `client_users` to link a login to a `clients` row.
- Effort: medium-high (3-4 days) - the security review matters more than the UI here.
- External: none; email/SMS notifications would need a provider (Resend is already wired for email).

---

## Suggested build order

1. Warehouse/hub depth (#7) - cheap, and everything else references hubs and coordinates.
2. Fleet (#3) - needed before routes can be assigned.
3. Real-time shipment tracking (#1) - the visible centrepiece; establishes events + realtime.
4. Real-time inventory (#4) - reuses the same realtime and movement-log pattern.
5. Freight calculator (#6) - self-contained, immediately sellable, feeds invoicing.
6. Route planning (#2) - needs hubs, fleet and coordinates in place.
7. Carrier integrations (#5) - deferred because it is blocked on the user's carrier credentials.
8. Customer portal (#8) - last, so it can expose tracking, ETA and carrier status all at once.

Realistic total: roughly 4-6 weeks of focused work. Each numbered item is shippable on its own, so we can stop at any point.

## Technical notes

- Every new table follows the existing pattern: `company_id` not null, GRANTs for `authenticated` and `service_role`, RLS enabled, policies scoped through `get_user_company_id(auth.uid())`, and no `company_id IS NULL` escape hatch - the CI check in `security-cross-company.yml` enforces this. The only intentionally public surface is the portal read path, which goes through an edge function and gets documented in `security/public-tables-allowlist.json` if a table is involved.
- All schema changes are additive: new tables, new nullable columns, backfills. No drops, renames or type changes, so the deployed app keeps working during each migration.
- New hooks mirror `useShipmentsV2`/`useWarehouses` (company-scoped fetch, `log_audit_event` on writes, sonner toasts) and get the same style of Vitest coverage as the existing hook tests.
- Writes stay guarded by `useActionGuard` so missing prerequisites (no hub, no driver, no rate card) explain themselves instead of failing silently.
- New pages register under `/saas/*` in `App.tsx` and in the SaaS sidebar; carrier keys are stored in project secrets and read only inside edge functions.
- Realtime channels are per-company and filtered server-side; position writes come from edge functions, not the browser.
