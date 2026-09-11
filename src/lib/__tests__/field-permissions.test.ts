import { describe, it, expect } from 'vitest';
import {
  checkFieldAccess,
  getFieldPolicy,
  maskFieldValue,
  redactRecord,
} from '@/lib/field-permissions';

describe('checkFieldAccess', () => {
  it('grants admins access to every field', () => {
    expect(checkFieldAccess(['admin'], 'invoices', 'paid_amount', 'write')).toBe(true);
    expect(checkFieldAccess(['admin'], 'payments', 'reference_number')).toBe(true);
  });

  it('lets finance read and write invoice amounts', () => {
    expect(checkFieldAccess(['finance'], 'invoices', 'amount')).toBe(true);
    expect(checkFieldAccess(['finance'], 'invoices', 'amount', 'write')).toBe(true);
  });

  it('blocks operations from writing invoice amounts but allows reading', () => {
    expect(checkFieldAccess(['operations'], 'invoices', 'amount')).toBe(true);
    expect(checkFieldAccess(['operations'], 'invoices', 'amount', 'write')).toBe(false);
  });

  it('hides payment details from non-finance roles', () => {
    expect(checkFieldAccess(['operations'], 'payments', 'amount')).toBe(false);
    expect(checkFieldAccess(['viewer'], 'payments', 'reference_number')).toBe(false);
  });

  it('makes viewers read-only on shipment status', () => {
    expect(checkFieldAccess(['viewer'], 'shipments', 'status')).toBe(true);
    expect(checkFieldAccess(['viewer'], 'shipments', 'status', 'write')).toBe(false);
  });

  it('treats undeclared fields as open', () => {
    expect(checkFieldAccess(['viewer'], 'invoices', 'invoice_number')).toBe(true);
    expect(checkFieldAccess(['viewer'], 'unknown_entity', 'anything', 'write')).toBe(true);
  });

  it('denies access when the user has no roles at all', () => {
    expect(checkFieldAccess([], 'invoices', 'amount')).toBe(false);
  });
});

describe('maskFieldValue', () => {
  it('uses dots by default', () => {
    expect(maskFieldValue(1234)).toBe('••••••');
  });

  it('returns a dash for hidden fields', () => {
    expect(maskFieldValue('secret', getFieldPolicy('invoices', 'notes'))).toBe('—');
  });

  it('keeps the first and last two characters for partial masks', () => {
    const policy = getFieldPolicy('payments', 'reference_number');
    expect(maskFieldValue('JO1234567890', policy)).toBe('JO••••••••90');
  });

  it('fully masks short values on partial masks', () => {
    const policy = getFieldPolicy('payments', 'reference_number');
    expect(maskFieldValue('1234', policy)).toBe('••••');
  });
});

describe('redactRecord', () => {
  const invoice = {
    id: 'inv-1',
    invoice_number: 'INV-0001',
    amount: 500,
    paid_amount: 500,
    notes: 'internal',
  };

  it('nulls out unreadable fields for restricted roles', () => {
    const out = redactRecord(invoice, ['viewer'], 'invoices');
    expect(out.amount).toBe(500); // viewer may read amount
    expect(out.paid_amount).toBeNull();
    expect(out.notes).toBeNull();
    expect(out.invoice_number).toBe('INV-0001');
  });

  it('returns the record untouched for admins', () => {
    expect(redactRecord(invoice, ['admin'], 'invoices')).toEqual(invoice);
  });

  it('returns the record untouched for unknown entities', () => {
    expect(redactRecord(invoice, ['viewer'], 'not_an_entity')).toEqual(invoice);
  });

  it('does not mutate the original record', () => {
    redactRecord(invoice, ['viewer'], 'invoices');
    expect(invoice.paid_amount).toBe(500);
  });
});
