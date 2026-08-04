import type { AppRole } from '@/types/erp';

/**
 * Field-level RBAC policy.
 *
 * Every sensitive field in the app is declared here once, with the roles allowed
 * to READ it and the roles allowed to WRITE it. UI helpers (useFieldPermissions,
 * <FieldGate />, <SecureValue />) read from this single source of truth so
 * behaviour stays consistent across every module.
 *
 * NOTE: this is a presentation/UX layer. Row-level isolation (company_id) and
 * table access remain enforced by database RLS policies.
 */

export type FieldAccess = 'read' | 'write';

export interface FieldPolicy {
  /** Roles allowed to see the value. Empty array = nobody but admin. */
  read: AppRole[];
  /** Roles allowed to edit the value. */
  write: AppRole[];
  /** How to render the value when the user may not read it. */
  mask?: 'hidden' | 'dots' | 'partial';
  labelEn: string;
  labelAr: string;
}

export type EntityFieldPolicies = Record<string, FieldPolicy>;

const ALL: AppRole[] = ['admin', 'operations', 'warehouse', 'finance', 'viewer', 'user'];
const OPS: AppRole[] = ['admin', 'operations'];
const FIN: AppRole[] = ['admin', 'finance'];
const OPS_FIN: AppRole[] = ['admin', 'operations', 'finance'];
const READ_WIDE: AppRole[] = ['admin', 'operations', 'finance', 'viewer'];

export const FIELD_POLICIES: Record<string, EntityFieldPolicies> = {
  invoices: {
    amount: { read: READ_WIDE, write: FIN, mask: 'dots', labelEn: 'Invoice amount', labelAr: 'مبلغ الفاتورة' },
    total_amount: { read: READ_WIDE, write: FIN, mask: 'dots', labelEn: 'Total amount', labelAr: 'المبلغ الإجمالي' },
    tax_amount: { read: READ_WIDE, write: FIN, mask: 'dots', labelEn: 'Tax amount', labelAr: 'قيمة الضريبة' },
    discount_amount: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Discount', labelAr: 'الخصم' },
    paid_amount: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Paid amount', labelAr: 'المبلغ المدفوع' },
    status: { read: ALL, write: FIN, labelEn: 'Invoice status', labelAr: 'حالة الفاتورة' },
    notes: { read: OPS_FIN, write: FIN, mask: 'hidden', labelEn: 'Internal notes', labelAr: 'ملاحظات داخلية' },
  },
  payments: {
    amount: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Payment amount', labelAr: 'قيمة الدفعة' },
    payment_method: { read: FIN, write: FIN, labelEn: 'Payment method', labelAr: 'طريقة الدفع' },
    reference_number: { read: FIN, write: FIN, mask: 'partial', labelEn: 'Bank reference', labelAr: 'المرجع البنكي' },
  },
  expenses: {
    amount: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Expense amount', labelAr: 'قيمة المصروف' },
    vendor_id: { read: OPS_FIN, write: FIN, labelEn: 'Vendor', labelAr: 'المورد' },
    approved_by: { read: FIN, write: ['admin'], labelEn: 'Approved by', labelAr: 'تمت الموافقة بواسطة' },
  },
  shipment_costs: {
    amount: { read: OPS_FIN, write: FIN, mask: 'dots', labelEn: 'Cost amount', labelAr: 'قيمة الكلفة' },
    margin: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Margin', labelAr: 'هامش الربح' },
  },
  shipments: {
    selling_price: { read: OPS_FIN, write: FIN, mask: 'dots', labelEn: 'Selling price', labelAr: 'سعر البيع' },
    cost_price: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Cost price', labelAr: 'سعر الكلفة' },
    status: { read: ALL, write: ['admin', 'operations', 'warehouse'], labelEn: 'Status', labelAr: 'الحالة' },
    client_id: { read: ALL, write: OPS, labelEn: 'Client', labelAr: 'العميل' },
  },
  customers: {
    email: { read: OPS_FIN, write: OPS, mask: 'partial', labelEn: 'Email', labelAr: 'البريد الإلكتروني' },
    phone: { read: OPS_FIN, write: OPS, mask: 'partial', labelEn: 'Phone', labelAr: 'رقم الهاتف' },
    tax_number: { read: FIN, write: FIN, mask: 'partial', labelEn: 'Tax number', labelAr: 'الرقم الضريبي' },
    credit_limit: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Credit limit', labelAr: 'حد الائتمان' },
  },
  items: {
    cost_price: { read: FIN, write: FIN, mask: 'dots', labelEn: 'Cost price', labelAr: 'سعر الكلفة' },
    unit_price: { read: READ_WIDE, write: OPS_FIN, labelEn: 'Unit price', labelAr: 'سعر الوحدة' },
    reorder_point: { read: ALL, write: ['admin', 'warehouse', 'operations'], labelEn: 'Reorder point', labelAr: 'حد إعادة الطلب' },
  },
  dp_drivers: {
    national_id: { read: ['admin'], write: ['admin'], mask: 'partial', labelEn: 'National ID', labelAr: 'الرقم الوطني' },
    phone: { read: ['admin', 'operations', 'warehouse'], write: OPS, mask: 'partial', labelEn: 'Phone', labelAr: 'رقم الهاتف' },
    risk_points: { read: ['admin', 'operations'], write: [], mask: 'hidden', labelEn: 'Risk score', labelAr: 'درجة الخطورة' },
  },
  profiles: {
    email: { read: ['admin'], write: ['admin'], mask: 'partial', labelEn: 'User email', labelAr: 'بريد المستخدم' },
    is_approved: { read: ['admin'], write: ['admin'], labelEn: 'Approval state', labelAr: 'حالة الموافقة' },
  },
};

export type FieldEntity = keyof typeof FIELD_POLICIES;

export function getFieldPolicy(entity: string, field: string): FieldPolicy | undefined {
  return FIELD_POLICIES[entity]?.[field];
}

/**
 * Resolve access for a field. Unknown fields are open by default (they are not
 * sensitive), so modules only need to declare what must be protected.
 */
export function checkFieldAccess(
  roles: AppRole[],
  entity: string,
  field: string,
  access: FieldAccess = 'read',
): boolean {
  if (roles.includes('admin')) return true;
  const policy = getFieldPolicy(entity, field);
  if (!policy) return true;
  const allowed = access === 'read' ? policy.read : policy.write;
  return allowed.some((r) => roles.includes(r));
}

/** Mask a value according to its policy so blocked users still see structure. */
export function maskFieldValue(value: unknown, policy?: FieldPolicy): string {
  const mode = policy?.mask ?? 'dots';
  if (mode === 'hidden') return '—';
  if (mode === 'partial') {
    const raw = String(value ?? '');
    if (raw.length <= 4) return '••••';
    return `${raw.slice(0, 2)}${'•'.repeat(Math.max(3, raw.length - 4))}${raw.slice(-2)}`;
  }
  return '••••••';
}

/** Strip fields the user cannot read from an object (useful before export/CSV). */
export function redactRecord<T extends Record<string, unknown>>(
  record: T,
  roles: AppRole[],
  entity: string,
): T {
  const policies = FIELD_POLICIES[entity];
  if (!policies || roles.includes('admin')) return record;
  const out: Record<string, unknown> = { ...record };
  for (const field of Object.keys(policies)) {
    if (field in out && !checkFieldAccess(roles, entity, field, 'read')) {
      out[field] = null;
    }
  }
  return out as T;
}
