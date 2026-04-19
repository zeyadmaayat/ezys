
DO $$
DECLARE
  t text;
  tables_in_order text[] := ARRAY[
    'ai_messages','ai_conversations','audit_log','notifications','internal_messages',
    'blanket_releases','blanket_order_lines','blanket_orders',
    'payments','invoice_items','invoices_v2','invoices',
    'expenses',
    'goods_receipt_lines','goods_receipts',
    'shipment_costs','shipment_documents','shipment_tasks','shipment_alerts','shipment_plans',
    'return_orders','shipments_v2','shipments',
    'order_items','orders',
    'quotation_lines','quotations','leads',
    'requisition_lines','requisitions',
    'po_lines','purchase_orders',
    'inventory_ledger','inventory','items','products',
    'customer_addresses','customers','clients',
    'dp_inventory_scans','dp_inventory_sessions',
    'dp_cod_settlement_lines','dp_cod_settlements',
    'dp_governance_events','dp_risk_alerts',
    'dp_shipment_status_log','dp_shipment_logs','dp_shipments',
    'dp_shelves','dp_zones','dp_driver_risk_score','dp_drivers',
    'locations','warehouses',
    'action_plans'
  ];
BEGIN
  SET LOCAL session_replication_role = 'replica';
  FOREACH t IN ARRAY tables_in_order LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('DELETE FROM public.%I', t);
    END IF;
  END LOOP;

  -- Remove other users (cascade clears profiles + user_roles via FK)
  DELETE FROM auth.users WHERE id <> 'a7c5037f-ddf6-4629-ab5c-ff5d8c46aad0';

  -- Remove other companies
  DELETE FROM public.companies WHERE id <> '2d3c193a-e820-4757-8456-e14d60ccd580';

  -- Reset sequences if they exist
  FOR t IN SELECT relname FROM pg_class WHERE relkind='S' AND relname IN (
    'shipment_v2_tracking_seq','tracking_number_seq','requisition_number_seq',
    'po_number_seq','grn_number_seq','invoice_number_seq','invoice_v2_number_seq',
    'order_number_seq','expense_number_seq','blanket_number_seq','rtv_number_seq',
    'dp_barcode_seq'
  ) LOOP
    EXECUTE format('SELECT setval(%L, 1, false)', t);
  END LOOP;
END $$;

-- ============================================
-- PERFORMANCE INDEXES (only on tables that exist)
-- ============================================
DO $$
DECLARE
  idx record;
  index_defs text[][] := ARRAY[
    ['shipments_v2','idx_shipments_v2_company_status','(company_id, status)'],
    ['shipments_v2','idx_shipments_v2_company_created','(company_id, created_at DESC)'],
    ['shipments_v2','idx_shipments_v2_client','(client_id)'],
    ['invoices_v2','idx_invoices_v2_company_status','(company_id, status)'],
    ['invoices_v2','idx_invoices_v2_company_created','(company_id, created_at DESC)'],
    ['invoices_v2','idx_invoices_v2_client','(client_id)'],
    ['invoices_v2','idx_invoices_v2_shipment','(shipment_id)'],
    ['invoices','idx_invoices_company_status','(company_id, status)'],
    ['invoices','idx_invoices_company_created','(company_id, created_at DESC)'],
    ['clients','idx_clients_company','(company_id)'],
    ['clients','idx_clients_company_type','(company_id, type)'],
    ['customers','idx_customers_company','(company_id)'],
    ['warehouses','idx_warehouses_company','(company_id)'],
    ['locations','idx_locations_company','(company_id)'],
    ['orders','idx_orders_company_status','(company_id, status)'],
    ['orders','idx_orders_company_created','(company_id, created_at DESC)'],
    ['purchase_orders','idx_po_company_status','(company_id, status)'],
    ['purchase_orders','idx_po_company_created','(company_id, created_at DESC)'],
    ['po_lines','idx_po_lines_po','(po_id)'],
    ['goods_receipts','idx_grn_company_status','(company_id, status)'],
    ['goods_receipt_lines','idx_grn_lines_grn','(grn_id)'],
    ['requisitions','idx_req_company_status','(company_id, status)'],
    ['requisition_lines','idx_req_lines_req','(requisition_id)'],
    ['expenses','idx_expenses_company_date','(company_id, expense_date DESC)'],
    ['expenses','idx_expenses_company_category','(company_id, category)'],
    ['payments','idx_payments_company','(company_id)'],
    ['payments','idx_payments_invoice','(invoice_id)'],
    ['inventory','idx_inventory_item_loc','(item_id, location_id)'],
    ['inventory_ledger','idx_inventory_ledger_item_created','(item_id, created_at DESC)'],
    ['internal_messages','idx_im_company_entity','(company_id, entity_type, entity_id)'],
    ['notifications','idx_notif_user_created','(user_id, created_at DESC)'],
    ['audit_log','idx_audit_company_created','(company_id, created_at DESC)'],
    ['audit_log','idx_audit_entity','(entity_type, entity_id)'],
    ['ai_conversations','idx_ai_conv_user_updated','(user_id, updated_at DESC)'],
    ['ai_messages','idx_ai_msg_conv_created','(conversation_id, created_at)'],
    ['dp_shipments','idx_dp_ship_company_status','(company_id, status)'],
    ['dp_shipments','idx_dp_ship_company_created','(company_id, created_at DESC)'],
    ['dp_shipments','idx_dp_ship_driver','(driver_id)'],
    ['dp_shipments','idx_dp_ship_barcode','(barcode)'],
    ['dp_shipments','idx_dp_ship_current_wh','(current_warehouse_id)'],
    ['dp_drivers','idx_dp_drivers_company_active','(company_id, is_active)'],
    ['dp_zones','idx_dp_zones_company_wh','(company_id, warehouse_id)'],
    ['dp_shelves','idx_dp_shelves_zone','(zone_id)'],
    ['dp_shipment_status_log','idx_dp_status_log_ship_created','(shipment_id, created_at DESC)'],
    ['dp_governance_events','idx_dp_gov_company_created','(company_id, created_at DESC)'],
    ['dp_risk_alerts','idx_dp_risk_company_created','(company_id, created_at DESC)'],
    ['dp_inventory_scans','idx_dp_inv_scans_session','(session_id)'],
    ['dp_cod_settlements','idx_dp_cod_company_driver','(company_id, driver_id)'],
    ['profiles','idx_profiles_company','(company_id)'],
    ['user_roles','idx_user_roles_user','(user_id)']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(index_defs,1) LOOP
    IF to_regclass('public.'||index_defs[i][1]) IS NOT NULL THEN
      BEGIN
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I %s',
                       index_defs[i][2], index_defs[i][1], index_defs[i][3]);
      EXCEPTION WHEN undefined_column THEN
        -- Skip indexes whose columns don't exist
        NULL;
      END;
    END IF;
  END LOOP;
END $$;
