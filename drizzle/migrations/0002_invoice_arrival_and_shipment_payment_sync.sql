ALTER TABLE public.invoices_v2 ADD COLUMN IF NOT EXISTS arrival_date timestamptz;
ALTER TABLE public.shipments_v2 ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'Unbilled';

CREATE OR REPLACE FUNCTION public.invoice_v2_set_arrival_date()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.shipment_id IS NOT NULL AND NEW.arrival_date IS NULL THEN
    SELECT COALESCE(actual_delivery, updated_at) INTO NEW.arrival_date
    FROM public.shipments_v2 WHERE id = NEW.shipment_id AND status = 'DELIVERED';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_invoice_v2_arrival ON public.invoices_v2;
CREATE TRIGGER trg_invoice_v2_arrival BEFORE INSERT OR UPDATE OF shipment_id ON public.invoices_v2
FOR EACH ROW EXECUTE FUNCTION public.invoice_v2_set_arrival_date();

CREATE OR REPLACE FUNCTION public.shipment_v2_sync_payment_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sid uuid; _st text;
BEGIN
  _sid := COALESCE(NEW.shipment_id, OLD.shipment_id);
  IF _sid IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'DELETE' THEN _st := 'Unbilled';
  ELSE _st := CASE NEW.status::text
    WHEN 'Paid' THEN 'Paid' WHEN 'Overdue' THEN 'Overdue'
    WHEN 'Cancelled' THEN 'Unbilled' ELSE 'Invoiced' END;
  END IF;
  UPDATE public.shipments_v2 SET payment_status = _st WHERE id = _sid;
  RETURN COALESCE(NEW, OLD);
END $$;
REVOKE EXECUTE ON FUNCTION public.shipment_v2_sync_payment_status() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS trg_invoice_v2_payment_sync ON public.invoices_v2;
CREATE TRIGGER trg_invoice_v2_payment_sync AFTER INSERT OR UPDATE OF status OR DELETE ON public.invoices_v2
FOR EACH ROW EXECUTE FUNCTION public.shipment_v2_sync_payment_status();

UPDATE public.invoices_v2 i SET arrival_date = COALESCE(s.actual_delivery, s.updated_at)
FROM public.shipments_v2 s WHERE s.id = i.shipment_id AND i.arrival_date IS NULL AND s.status = 'DELIVERED';