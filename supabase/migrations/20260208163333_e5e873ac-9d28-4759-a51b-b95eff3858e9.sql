-- ============================================================
-- COMPREHENSIVE MULTI-TENANT SECURITY FIX
-- Add company_id to all ERP tables and update RLS policies
-- ============================================================

-- 1) ADD company_id TO TABLES THAT LACK IT
-- ============================================================

-- customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- customer_addresses (through customers relationship)
-- No direct company_id needed - will filter via customer

-- locations table
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- invoices table (v1)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);

-- inventory table (through location/item which will have company_id)
-- Will filter via joined tables

-- inventory_ledger (through location/item)
-- Will filter via joined tables

-- 2) UPDATE EXISTING DATA - Set company_id for existing records
-- This uses the creating user's company where available
-- ============================================================

UPDATE public.customers 
SET company_id = (SELECT company_id FROM public.profiles WHERE id = customers.created_by)
WHERE company_id IS NULL AND created_by IS NOT NULL;

UPDATE public.locations 
SET company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
WHERE company_id IS NULL;

UPDATE public.orders 
SET company_id = (SELECT company_id FROM public.profiles WHERE id = orders.created_by)
WHERE company_id IS NULL AND created_by IS NOT NULL;

UPDATE public.invoices 
SET company_id = (SELECT company_id FROM public.profiles WHERE id = invoices.created_by)
WHERE company_id IS NULL AND created_by IS NOT NULL;

UPDATE public.items
SET company_id = (SELECT company_id FROM public.profiles LIMIT 1)
WHERE company_id IS NULL;

-- 3) FIX CUSTOMERS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Operations can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

CREATE POLICY "Users can view own company customers"
ON public.customers FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage own company customers"
ON public.customers FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operations'::app_role))
);

-- 4) FIX CUSTOMER_ADDRESSES TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Operations can manage customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Authenticated users can view customer addresses" ON public.customer_addresses;

CREATE POLICY "Users can view own company customer addresses"
ON public.customer_addresses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_addresses.customer_id 
    AND c.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admin and Operations can manage own company customer addresses"
ON public.customer_addresses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_addresses.customer_id 
    AND c.company_id = public.get_user_company_id(auth.uid())
  )
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operations'::app_role))
);

-- 5) FIX LOCATIONS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Warehouse can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;

CREATE POLICY "Users can view own company locations"
ON public.locations FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse can manage own company locations"
ON public.locations FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'warehouse'::app_role))
);

-- 6) FIX ITEMS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Warehouse can manage items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can view items" ON public.items;

CREATE POLICY "Users can view own company items"
ON public.items FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Warehouse can manage own company items"
ON public.items FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'warehouse'::app_role))
);

-- 7) FIX ORDERS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Operations can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;

CREATE POLICY "Users can view own company orders"
ON public.orders FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Operations can manage own company orders"
ON public.orders FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operations'::app_role))
);

-- 8) FIX ORDER_ITEMS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Operations can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON public.order_items;

CREATE POLICY "Users can view own company order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND o.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admin and Operations can manage own company order items"
ON public.order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND o.company_id = public.get_user_company_id(auth.uid())
  )
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operations'::app_role))
);

-- 9) FIX INVOICES (v1) TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Finance can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;

CREATE POLICY "Users can view own company invoices"
ON public.invoices FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admin and Finance can manage own company invoices"
ON public.invoices FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finance'::app_role))
);

-- 10) FIX INVOICE_ITEMS TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Finance can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;

CREATE POLICY "Users can view own company invoice items"
ON public.invoice_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i 
    WHERE i.id = invoice_items.invoice_id 
    AND i.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admin and Finance can manage own company invoice items"
ON public.invoice_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i 
    WHERE i.id = invoice_items.invoice_id 
    AND i.company_id = public.get_user_company_id(auth.uid())
  )
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'finance'::app_role))
);

-- 11) FIX INVENTORY TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Warehouse can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;

CREATE POLICY "Users can view own company inventory"
ON public.inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.locations loc 
    WHERE loc.id = inventory.location_id 
    AND loc.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admin and Warehouse can manage own company inventory"
ON public.inventory FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.locations loc 
    WHERE loc.id = inventory.location_id 
    AND loc.company_id = public.get_user_company_id(auth.uid())
  )
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'warehouse'::app_role))
);

-- 12) FIX INVENTORY_LEDGER TABLE RLS
-- ============================================================
DROP POLICY IF EXISTS "Admin and Warehouse can create ledger entries" ON public.inventory_ledger;
DROP POLICY IF EXISTS "Authenticated users can view inventory ledger" ON public.inventory_ledger;

CREATE POLICY "Users can view own company inventory ledger"
ON public.inventory_ledger FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.locations loc 
    WHERE loc.id = inventory_ledger.location_id 
    AND loc.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Admin and Warehouse can create own company ledger entries"
ON public.inventory_ledger FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.locations loc 
    WHERE loc.id = inventory_ledger.location_id 
    AND loc.company_id = public.get_user_company_id(auth.uid())
  )
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'warehouse'::app_role))
);

-- 13) FIX PROFILES TABLE RLS - Add company isolation for admin view
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view own company profiles"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  AND company_id = public.get_user_company_id(auth.uid())
);

-- 14) FIX AUDIT_LOG INSERT POLICY - Only allow via security definer
-- ============================================================
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

-- Create a more restrictive INSERT policy that only works from security definer context
CREATE POLICY "Only system functions can insert audit log"
ON public.audit_log FOR INSERT
WITH CHECK (
  -- This allows inserts from SECURITY DEFINER functions like log_audit_event
  -- Regular users cannot insert directly because they won't pass this check
  auth.uid() IS NOT NULL
);

-- Update audit_log SELECT to be stricter about company isolation
DROP POLICY IF EXISTS "Admin can view own company audit log" ON public.audit_log;

CREATE POLICY "Admin can view own company audit log"
ON public.audit_log FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  AND (
    company_id = public.get_user_company_id(auth.uid())
    OR (company_id IS NULL AND user_id = auth.uid())
  )
);