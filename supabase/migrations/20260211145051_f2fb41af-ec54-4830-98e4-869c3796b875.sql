
-- Add currency column to invoices_v2 with SAR as default
ALTER TABLE public.invoices_v2 ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'SAR';
