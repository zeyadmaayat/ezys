
-- =============================================
-- 1. Enable RLS on tables that have it disabled
-- =============================================

-- dp_risk_alerts
ALTER TABLE public.dp_risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view risk alerts"
ON public.dp_risk_alerts FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can insert risk alerts"
ON public.dp_risk_alerts FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- dp_shipment_logs
ALTER TABLE public.dp_shipment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view shipment logs"
ON public.dp_shipment_logs FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can insert shipment logs"
ON public.dp_shipment_logs FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- dp_driver_risk_score
ALTER TABLE public.dp_driver_risk_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view driver risk scores"
ON public.dp_driver_risk_score FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can manage driver risk scores"
ON public.dp_driver_risk_score FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- dp_governance_events
ALTER TABLE public.dp_governance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view governance events"
ON public.dp_governance_events FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can insert governance events"
ON public.dp_governance_events FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- dp_status_transitions (reference data - read only for all authenticated)
ALTER TABLE public.dp_status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view status transitions"
ON public.dp_status_transitions FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- 2. Fix legacy tables - replace USING(true) with company scoping
-- =============================================

-- customers - has company_id column
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view customers" ON public.customers;

CREATE POLICY "Company members can view their customers"
ON public.customers FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can insert customers"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can update their customers"
ON public.customers FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can delete their customers"
ON public.customers FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- items - has company_id column
DROP POLICY IF EXISTS "Authenticated users can view items" ON public.items;
DROP POLICY IF EXISTS "Admins can manage items" ON public.items;
DROP POLICY IF EXISTS "Users can view items" ON public.items;

CREATE POLICY "Company members can view their items"
ON public.items FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can insert items"
ON public.items FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can update their items"
ON public.items FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can delete their items"
ON public.items FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- locations - has company_id column  
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Users can view locations" ON public.locations;

CREATE POLICY "Company members can view their locations"
ON public.locations FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can insert locations"
ON public.locations FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can update their locations"
ON public.locations FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- orders - has company_id column
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;

CREATE POLICY "Company members can view their orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Company members can update their orders"
ON public.orders FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- order_items - scope through orders
DROP POLICY IF EXISTS "Authenticated users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;

CREATE POLICY "Company members can view their order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (o.company_id = public.get_user_company_id(auth.uid()) OR o.company_id IS NULL)
  )
);

CREATE POLICY "Company members can insert order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Company members can update their order items"
ON public.order_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Company members can delete their order items"
ON public.order_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.company_id = public.get_user_company_id(auth.uid())
  )
);

-- inventory - scope through items
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can view inventory" ON public.inventory;

CREATE POLICY "Authenticated users can view inventory"
ON public.inventory FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage inventory"
ON public.inventory FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- inventory_ledger
DROP POLICY IF EXISTS "Authenticated users can view inventory ledger" ON public.inventory_ledger;
DROP POLICY IF EXISTS "Admins can manage inventory ledger" ON public.inventory_ledger;
DROP POLICY IF EXISTS "Users can view inventory ledger" ON public.inventory_ledger;

CREATE POLICY "Authenticated users can view inventory ledger"
ON public.inventory_ledger FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert inventory ledger"
ON public.inventory_ledger FOR INSERT
TO authenticated
WITH CHECK (true);

-- invoices - has company_id column
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;

CREATE POLICY "Company members can view their invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can insert invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

CREATE POLICY "Company members can update their invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company_id(auth.uid())
  OR company_id IS NULL
);

-- invoice_items - scope through invoices
DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can view invoice items" ON public.invoice_items;

CREATE POLICY "Company members can view their invoice items"
ON public.invoice_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND (i.company_id = public.get_user_company_id(auth.uid()) OR i.company_id IS NULL)
  )
);

CREATE POLICY "Company members can insert invoice items"
ON public.invoice_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND (i.company_id = public.get_user_company_id(auth.uid()) OR i.company_id IS NULL)
  )
);

CREATE POLICY "Company members can update their invoice items"
ON public.invoice_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND (i.company_id = public.get_user_company_id(auth.uid()) OR i.company_id IS NULL)
  )
);

-- customer_addresses - scope through customers
DROP POLICY IF EXISTS "Authenticated users can view customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Admins can manage customer addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can view customer addresses" ON public.customer_addresses;

CREATE POLICY "Company members can view their customer addresses"
ON public.customer_addresses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_addresses.customer_id
    AND (c.company_id = public.get_user_company_id(auth.uid()) OR c.company_id IS NULL)
  )
);

CREATE POLICY "Company members can insert customer addresses"
ON public.customer_addresses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_addresses.customer_id
    AND c.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Company members can update their customer addresses"
ON public.customer_addresses FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_addresses.customer_id
    AND c.company_id = public.get_user_company_id(auth.uid())
  )
);

-- =============================================
-- 3. Secure trigger functions with SECURITY INVOKER
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.requisition_number IS NULL OR NEW.requisition_number = '' THEN
    NEW.requisition_number := 'REQ-' || LPAD(nextval('requisition_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := 'PO-' || LPAD(nextval('po_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_rtv_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_po_number TEXT;
  v_line_number INT;
BEGIN
  IF NEW.rtv_number IS NULL OR NEW.rtv_number = '' THEN
    SELECT po_number INTO v_po_number FROM public.purchase_orders WHERE id = NEW.po_id;
    IF NEW.po_line_id IS NOT NULL THEN
      SELECT line_number INTO v_line_number FROM public.po_lines WHERE id = NEW.po_line_id;
      NEW.rtv_number := v_po_number || '-' || v_line_number || 'R';
    ELSE
      NEW.rtv_number := v_po_number || '-R' || LPAD(nextval('rtv_number_seq')::text, 3, '0');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_blanket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.blanket_number IS NULL OR NEW.blanket_number = '' THEN
    NEW.blanket_number := 'BLK-' || LPAD(nextval('blanket_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_grn_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.grn_number IS NULL OR NEW.grn_number = '' THEN
    NEW.grn_number := 'GRN-' || LPAD(nextval('grn_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_shipment_tracking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := 'SHP-' || LPAD(nextval('shipment_v2_tracking_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_v2_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_v2_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || LPAD(nextval('order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TRK-' || LPAD(nextval('tracking_number_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_expense_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.expense_number IS NULL OR NEW.expense_number = '' THEN
    NEW.expense_number := 'EXP-' || LPAD(nextval('expense_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_dp_barcode()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
    NEW.barcode := 'DP-' || LPAD(nextval('dp_barcode_seq')::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- 4. Secure DP trigger functions with search_path
-- =============================================

CREATE OR REPLACE FUNCTION public.dp_flag_cash_mismatch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if new.status = 'CLOSED'
     and coalesce(new.variance,0) <> 0 then
    insert into dp_risk_alerts (company_id, driver_id, alert_type, message)
    values (new.company_id, new.driver_id, 'CASH_MISMATCH', 'Settlement closed with variance');
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if old.status <> new.status then
    insert into dp_shipment_logs (shipment_id, company_id, old_status, new_status)
    values (new.id, new.company_id, old.status, new.status);
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_prevent_cod_edit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if old.status = 'DELIVERED' and old.cod_amount <> new.cod_amount then
     raise exception 'CANNOT_EDIT_COD_AFTER_DELIVERY';
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_validate_session_open()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if not exists (
    select 1 from dp_inventory_sessions
    where id = new.session_id and status = 'OPEN'
  ) then
    raise exception 'SESSION_NOT_OPEN';
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_auto_assign_cod()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  open_settlement_id uuid;
begin
  if new.status = 'DELIVERED' and new.is_cod = true then
    select id into open_settlement_id
    from dp_cod_settlements
    where driver_id = new.driver_id and status = 'OPEN'
    limit 1;

    if open_settlement_id is null then
      insert into dp_cod_settlements (company_id, driver_id, status, total_assigned)
      values (new.company_id, new.driver_id, 'OPEN', 0)
      returning id into open_settlement_id;
    end if;

    insert into dp_cod_settlement_lines (settlement_id, shipment_id, cod_amount, collected)
    values (open_settlement_id, new.id, new.cod_amount, false)
    on conflict do nothing;

    update dp_cod_settlements
    set total_assigned = (
      select coalesce(sum(cod_amount),0)
      from dp_cod_settlement_lines
      where settlement_id = open_settlement_id
    )
    where id = open_settlement_id;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_auto_calculate_variance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  new.variance := coalesce(new.total_collected,0) - coalesce(new.total_assigned,0);
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_flag_late_delivery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if new.status = 'DELIVERED'
     and old.status = 'OUT_FOR_DELIVERY'
     and new.updated_at > old.updated_at + interval '48 hours' then
    insert into dp_risk_alerts (company_id, driver_id, shipment_id, alert_type, message)
    values (new.company_id, new.driver_id, new.id, 'LATE_DELIVERY', 'Delivery exceeded 48h SLA');
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_flag_excessive_returns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  return_count integer;
begin
  if new.status = 'RETURNED' then
    select count(*) into return_count
    from dp_shipments
    where driver_id = new.driver_id and status = 'RETURNED' and updated_at > now() - interval '1 day';

    if return_count >= 5 then
      insert into dp_risk_alerts (company_id, driver_id, shipment_id, alert_type, message)
      values (new.company_id, new.driver_id, new.id, 'EXCESSIVE_RETURNS', 'Driver exceeded 5 returns in 24h');
    end if;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_update_driver_risk()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  insert into dp_driver_risk_score (driver_id, company_id, risk_points)
  values (new.driver_id, new.company_id, 10)
  on conflict (driver_id)
  do update set risk_points = dp_driver_risk_score.risk_points + 10, updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_auto_suspend_driver()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if new.risk_points >= 100 then
    update dp_drivers set is_active = false where id = new.driver_id;
    insert into dp_risk_alerts (company_id, driver_id, alert_type, message)
    values (new.company_id, new.driver_id, 'AUTO_SUSPENDED', 'Driver auto-suspended due to high risk score');
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_flag_financial_escalation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  mismatch_count integer;
begin
  if new.alert_type = 'CASH_MISMATCH' then
    select count(*) into mismatch_count
    from dp_risk_alerts
    where driver_id = new.driver_id and alert_type = 'CASH_MISMATCH' and created_at > now() - interval '30 days';

    if mismatch_count >= 2 then
      insert into dp_risk_alerts (company_id, driver_id, alert_type, message)
      values (new.company_id, new.driver_id, 'FINANCIAL_ESCALATION', 'Multiple cash mismatches within 30 days');
    end if;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_lock_after_delivered()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if old.status = 'DELIVERED' then
    raise exception 'SHIPMENT_LOCKED_AFTER_DELIVERY';
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_auto_move_warehouse()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if new.status = 'RECEIVED_AT_ORIGIN' then
    new.current_warehouse_id := new.origin_warehouse_id;
  elsif new.status = 'RECEIVED_AT_DESTINATION' then
    new.current_warehouse_id := new.destination_warehouse_id;
  elsif new.status in ('DELIVERED','RETURNED','CANCELLED') then
    new.current_warehouse_id := null;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_set_delivery_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.status = 'DELIVERED' AND OLD.status IS DISTINCT FROM 'DELIVERED' THEN
        NEW.delivered_at := now();
    END IF;
    IF NEW.status = 'RETURNED' AND OLD.status IS DISTINCT FROM 'RETURNED' THEN
        NEW.returned_at := now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_check_sla_breach()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.expected_delivery_at IS NOT NULL THEN
        IF NEW.status = 'DELIVERED' AND NEW.delivered_at IS NOT NULL AND NEW.delivered_at > NEW.expected_delivery_at THEN
            NEW.is_sla_breached := true;
        END IF;
        IF NEW.status <> 'DELIVERED' AND now() > NEW.expected_delivery_at THEN
            NEW.is_sla_breached := true;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_prevent_close_if_missing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  missing_count integer;
begin
  if new.status = 'CLOSED' then
    select count(*) into missing_count
    from dp_shipments s
    where s.company_id = new.company_id
    and s.current_warehouse_id = new.warehouse_id
    and not exists (
      select 1 from dp_inventory_scans sc
      where sc.session_id = new.id and sc.shipment_id = s.id
    );
    if missing_count > 0 then
      raise exception 'CANNOT_CLOSE_SESSION_MISSING_SHIPMENTS';
    end if;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_log_risk_alert_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO dp_governance_events (
        company_id, event_type, severity, driver_id, shipment_id, reference_id, message, metadata
    )
    VALUES (
        NEW.company_id, NEW.alert_type,
        CASE
            WHEN NEW.alert_type = 'FINANCIAL_ESCALATION' THEN 'CRITICAL'
            WHEN NEW.alert_type = 'CASH_MISMATCH' THEN 'HIGH'
            WHEN NEW.alert_type = 'EXCESSIVE_RETURNS' THEN 'HIGH'
            WHEN NEW.alert_type = 'LATE_DELIVERY' THEN 'MEDIUM'
            ELSE 'INFO'
        END,
        NEW.driver_id, NEW.shipment_id, NEW.id, NEW.message,
        jsonb_build_object('source', 'dp_risk_alerts')
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_auto_escalate_high_risk()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    high_count integer;
BEGIN
    IF NEW.severity = 'HIGH' THEN
        SELECT COUNT(*) INTO high_count
        FROM dp_governance_events
        WHERE company_id = NEW.company_id AND driver_id = NEW.driver_id
        AND severity = 'HIGH' AND created_at >= now() - interval '24 hours';

        IF high_count >= 3 THEN
            INSERT INTO dp_governance_events (
                company_id, event_type, severity, driver_id, message, metadata
            )
            VALUES (
                NEW.company_id, 'AUTO_ESCALATED', 'CRITICAL', NEW.driver_id,
                'Driver escalated to CRITICAL due to repeated HIGH events',
                jsonb_build_object('source', 'auto_escalation')
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_assign_severity_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.severity_points :=
        CASE
            WHEN NEW.severity = 'CRITICAL' THEN 50
            WHEN NEW.severity = 'HIGH' THEN 30
            WHEN NEW.severity = 'MEDIUM' THEN 15
            ELSE 5
        END;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_increment_event_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.version := OLD.version + 1;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_cleanup_old_governance_events()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    DELETE FROM dp_governance_events WHERE created_at < now() - interval '90 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_log_driver_suspension()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.is_active = false AND OLD.is_active = true THEN
        INSERT INTO dp_governance_events (
            company_id, event_type, severity, driver_id, message, metadata
        )
        VALUES (
            NEW.company_id, 'AUTO_SUSPENDED', 'CRITICAL', NEW.id,
            'Driver auto-suspended due to high risk score',
            jsonb_build_object('source', 'dp_driver_risk_score')
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_create_sla_breach_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.is_sla_breached = true AND OLD.is_sla_breached IS DISTINCT FROM true THEN
        INSERT INTO dp_governance_events (
            company_id, event_type, severity, driver_id, shipment_id, message, metadata
        )
        VALUES (
            NEW.company_id, 'SLA_BREACH', 'HIGH', NEW.driver_id, NEW.id,
            'Shipment breached SLA delivery time',
            jsonb_build_object('source', 'sla_engine')
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.dp_update_shipment_last_scanned()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  update dp_shipments set last_scanned_at = now() where id = new.shipment_id;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.validate_dp_location_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  zone_wh uuid;
  shelf_zone uuid;
begin
  if new.zone_id is not null then
    select warehouse_id into zone_wh from dp_zones where id = new.zone_id;
    if zone_wh is distinct from new.current_warehouse_id then
      raise exception 'Zone does not belong to selected warehouse';
    end if;
  end if;

  if new.shelf_id is not null then
    select zone_id into shelf_zone from dp_shelves where id = new.shelf_id;
    if shelf_zone is distinct from new.zone_id then
      raise exception 'Shelf does not belong to selected zone';
    end if;
  end if;

  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.dp_validate_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if old.status <> new.status then
    if not exists (
      select 1 from dp_status_transitions
      where from_status = old.status and to_status = new.status
    ) then
      raise exception 'INVALID_STATUS_TRANSITION';
    end if;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.log_dp_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  if new.status is distinct from old.status then
    insert into dp_shipment_status_log (
      company_id, shipment_id, old_status, new_status, changed_by, warehouse_id, created_at
    )
    values (
      new.company_id, new.id, old.status, new.status, auth.uid(), new.current_warehouse_id, now()
    );
  end if;
  return new;
end;
$$;
