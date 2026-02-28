
-- ============================================
-- DOMESTIC PRO: FULL TRIGGER ACTIVATION
-- Drop all existing triggers first to prevent duplicates
-- ============================================

-- 1) BARCODE GENERATION
DROP TRIGGER IF EXISTS trg_generate_dp_barcode ON dp_shipments;
CREATE TRIGGER trg_generate_dp_barcode
  BEFORE INSERT ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION generate_dp_barcode();

-- 2) STATUS VALIDATION (transition enforcement)
DROP TRIGGER IF EXISTS trg_validate_dp_status ON dp_shipments;
CREATE TRIGGER trg_validate_dp_status
  BEFORE UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_dp_status_transition();

-- 3) AUTO WAREHOUSE MOVEMENT
DROP TRIGGER IF EXISTS trg_dp_auto_move_warehouse ON dp_shipments;
CREATE TRIGGER trg_dp_auto_move_warehouse
  BEFORE UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_auto_move_warehouse();

-- 4) LOCATION INTEGRITY (zone/shelf/warehouse validation)
DROP TRIGGER IF EXISTS trg_dp_location_integrity ON dp_shipments;
CREATE TRIGGER trg_dp_location_integrity
  BEFORE INSERT OR UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION validate_dp_location_integrity();

-- 5) LOCK AFTER DELIVERED
DROP TRIGGER IF EXISTS trg_dp_lock_after_delivered ON dp_shipments;
CREATE TRIGGER trg_dp_lock_after_delivered
  BEFORE UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_lock_after_delivered();

-- 6) PREVENT COD EDIT AFTER DELIVERY
DROP TRIGGER IF EXISTS trg_dp_prevent_cod_edit ON dp_shipments;
CREATE TRIGGER trg_dp_prevent_cod_edit
  BEFORE UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_prevent_cod_edit();

-- 7) STATUS AUDIT LOG (on INSERT - new shipment)
DROP TRIGGER IF EXISTS trg_dp_shipment_created_log ON dp_shipments;
CREATE TRIGGER trg_dp_shipment_created_log
  AFTER INSERT ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION log_dp_shipment_created();

-- 8) STATUS AUDIT LOG (on UPDATE - status change)
DROP TRIGGER IF EXISTS trg_dp_status_change_log ON dp_shipments;
CREATE TRIGGER trg_dp_status_change_log
  AFTER UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION log_dp_status_change();

-- 9) SECONDARY STATUS LOG (dp_shipment_logs table)
DROP TRIGGER IF EXISTS trg_dp_log_status_change ON dp_shipments;
CREATE TRIGGER trg_dp_log_status_change
  AFTER UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_log_status_change();

-- 10) COD AUTO-ASSIGN on DELIVERED
DROP TRIGGER IF EXISTS trg_dp_auto_assign_cod ON dp_shipments;
CREATE TRIGGER trg_dp_auto_assign_cod
  AFTER UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_auto_assign_cod();

-- 11) RISK: FLAG LATE DELIVERY
DROP TRIGGER IF EXISTS trg_dp_flag_late_delivery ON dp_shipments;
CREATE TRIGGER trg_dp_flag_late_delivery
  AFTER UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_flag_late_delivery();

-- 12) RISK: FLAG EXCESSIVE RETURNS
DROP TRIGGER IF EXISTS trg_dp_flag_excessive_returns ON dp_shipments;
CREATE TRIGGER trg_dp_flag_excessive_returns
  AFTER UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION dp_flag_excessive_returns();

-- 13) COD SETTLEMENT: AUTO-CALCULATE VARIANCE
DROP TRIGGER IF EXISTS trg_dp_auto_calculate_variance ON dp_cod_settlements;
CREATE TRIGGER trg_dp_auto_calculate_variance
  BEFORE INSERT OR UPDATE ON dp_cod_settlements
  FOR EACH ROW
  EXECUTE FUNCTION dp_auto_calculate_variance();

-- 14) COD SETTLEMENT: FLAG CASH MISMATCH ON CLOSE
DROP TRIGGER IF EXISTS trg_dp_flag_cash_mismatch ON dp_cod_settlements;
CREATE TRIGGER trg_dp_flag_cash_mismatch
  AFTER UPDATE ON dp_cod_settlements
  FOR EACH ROW
  EXECUTE FUNCTION dp_flag_cash_mismatch();

-- 15) RISK ALERTS: FINANCIAL ESCALATION
DROP TRIGGER IF EXISTS trg_dp_flag_financial_escalation ON dp_risk_alerts;
CREATE TRIGGER trg_dp_flag_financial_escalation
  AFTER INSERT ON dp_risk_alerts
  FOR EACH ROW
  EXECUTE FUNCTION dp_flag_financial_escalation();

-- 16) RISK ALERTS: UPDATE DRIVER RISK SCORE
DROP TRIGGER IF EXISTS trg_dp_update_driver_risk ON dp_risk_alerts;
CREATE TRIGGER trg_dp_update_driver_risk
  AFTER INSERT ON dp_risk_alerts
  FOR EACH ROW
  EXECUTE FUNCTION dp_update_driver_risk();

-- 17) DRIVER RISK: AUTO-SUSPEND
DROP TRIGGER IF EXISTS trg_dp_auto_suspend_driver ON dp_driver_risk_score;
CREATE TRIGGER trg_dp_auto_suspend_driver
  AFTER INSERT OR UPDATE ON dp_driver_risk_score
  FOR EACH ROW
  EXECUTE FUNCTION dp_auto_suspend_driver();

-- 18) INVENTORY: SESSION VALIDATION ON SCAN
DROP TRIGGER IF EXISTS trg_dp_validate_session_open ON dp_inventory_scans;
CREATE TRIGGER trg_dp_validate_session_open
  BEFORE INSERT ON dp_inventory_scans
  FOR EACH ROW
  EXECUTE FUNCTION dp_validate_session_open();

-- 19) INVENTORY: UPDATE SHIPMENT LAST SCANNED
DROP TRIGGER IF EXISTS trg_dp_update_shipment_last_scanned ON dp_inventory_scans;
CREATE TRIGGER trg_dp_update_shipment_last_scanned
  AFTER INSERT ON dp_inventory_scans
  FOR EACH ROW
  EXECUTE FUNCTION dp_update_shipment_last_scanned();

-- 20) INVENTORY: PREVENT CLOSE IF MISSING
DROP TRIGGER IF EXISTS trg_dp_prevent_close_if_missing ON dp_inventory_sessions;
CREATE TRIGGER trg_dp_prevent_close_if_missing
  BEFORE UPDATE ON dp_inventory_sessions
  FOR EACH ROW
  EXECUTE FUNCTION dp_prevent_close_if_missing();

-- 21) UNIQUE INDEX: PREVENT DUPLICATE SCANS
CREATE UNIQUE INDEX IF NOT EXISTS idx_dp_inventory_scans_unique
  ON dp_inventory_scans (session_id, shipment_id);

-- 22) UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS trg_dp_shipments_updated_at ON dp_shipments;
CREATE TRIGGER trg_dp_shipments_updated_at
  BEFORE UPDATE ON dp_shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dp_drivers_updated_at ON dp_drivers;
CREATE TRIGGER trg_dp_drivers_updated_at
  BEFORE UPDATE ON dp_drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dp_zones_updated_at ON dp_zones;
CREATE TRIGGER trg_dp_zones_updated_at
  BEFORE UPDATE ON dp_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dp_shelves_updated_at ON dp_shelves;
CREATE TRIGGER trg_dp_shelves_updated_at
  BEFORE UPDATE ON dp_shelves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
