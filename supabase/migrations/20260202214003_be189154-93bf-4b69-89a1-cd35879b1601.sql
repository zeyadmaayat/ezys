-- ============================================
-- PHASE 1A: EXPAND ROLE ENUM (Separate transaction)
-- ============================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operations';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';