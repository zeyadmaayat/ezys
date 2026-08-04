import { useCallback, useMemo } from 'react';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import {
  checkFieldAccess,
  getFieldPolicy,
  maskFieldValue,
  redactRecord,
  type FieldAccess,
} from '@/lib/field-permissions';

/**
 * Field-level permission hook.
 *
 * const f = useFieldPermissions('invoices');
 * f.canRead('total_amount')  -> boolean
 * f.canWrite('total_amount') -> boolean
 * f.display('total_amount', row.total_amount) -> value or mask
 */
export function useFieldPermissions(entity: string) {
  const { roles, loading } = useCurrentUserRoles();

  const canRead = useCallback(
    (field: string) => checkFieldAccess(roles, entity, field, 'read'),
    [roles, entity],
  );

  const canWrite = useCallback(
    (field: string) => checkFieldAccess(roles, entity, field, 'write'),
    [roles, entity],
  );

  const can = useCallback(
    (field: string, access: FieldAccess) => checkFieldAccess(roles, entity, field, access),
    [roles, entity],
  );

  const display = useCallback(
    (field: string, value: unknown, formatter?: (v: unknown) => string) => {
      if (!canRead(field)) return maskFieldValue(value, getFieldPolicy(entity, field));
      if (value === null || value === undefined) return '—';
      return formatter ? formatter(value) : String(value);
    },
    [canRead, entity],
  );

  const redact = useCallback(
    <T extends Record<string, unknown>>(record: T) => redactRecord(record, roles, entity),
    [roles, entity],
  );

  const redactAll = useCallback(
    <T extends Record<string, unknown>>(records: T[]) => records.map((r) => redactRecord(r, roles, entity)),
    [roles, entity],
  );

  return useMemo(
    () => ({ roles, loading, canRead, canWrite, can, display, redact, redactAll }),
    [roles, loading, canRead, canWrite, can, display, redact, redactAll],
  );
}
