
-- Fix generate_invoice_number trigger to handle empty string
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix the existing invoice with empty invoice_number
UPDATE public.invoices 
SET invoice_number = 'INV-' || LPAD(nextval('invoice_number_seq')::text, 6, '0')
WHERE invoice_number = '';
