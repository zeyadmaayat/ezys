-- Drop overly permissive policies on inventory
DROP POLICY IF EXISTS "Authenticated users can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;

-- Drop overly permissive policies on inventory_ledger
DROP POLICY IF EXISTS "Authenticated users can insert inventory ledger" ON public.inventory_ledger;
DROP POLICY IF EXISTS "Authenticated users can view inventory ledger" ON public.inventory_ledger;