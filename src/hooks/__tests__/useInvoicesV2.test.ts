import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  createSupabaseMock,
  testCompany,
  TEST_COMPANY_ID,
  OTHER_COMPANY_ID,
  TEST_USER_ID,
} from '@/test/supabaseMock';

const mock = createSupabaseMock();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mock.supabase,
}));

const authState = { user: { id: TEST_USER_ID } as { id: string } | null };
const companyState = { company: testCompany as typeof testCompany | null };

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('@/hooks/useCompany', () => ({ useCompany: () => companyState }));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { toast } from 'sonner';

const invoice = (over: Record<string, unknown> = {}) => ({
  id: 'inv-1',
  company_id: TEST_COMPANY_ID,
  shipment_id: 'shp-1',
  invoice_number: 'INV-0001',
  status: 'Draft',
  amount: 100,
  currency: 'JOD',
  created_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('useInvoicesV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.calls.length = 0;
    mock.rpcCalls.length = 0;
    Object.keys(mock.filters).forEach((k) => delete mock.filters[k]);
    mock.setTableError('invoices_v2', null);
    mock.setTableData('invoices_v2', [invoice()]);
    mock.setTableData('shipments_v2', [{ id: 'shp-1', status: 'DELIVERED' }]);
    authState.user = { id: TEST_USER_ID };
    companyState.company = testCompany;
  });

  it('loads invoices scoped to the current company_id', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mock.filters.invoices_v2.company_id).toBe(TEST_COMPANY_ID);
    expect(mock.filters.invoices_v2.company_id).not.toBe(OTHER_COMPANY_ID);
    expect(result.current.invoices).toHaveLength(1);
  });

  it('does not query without a company', async () => {
    companyState.company = null;
    const { result } = renderHook(() => useInvoicesV2());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([]);
    expect(mock.supabase.from).not.toHaveBeenCalled();
  });

  it('creates an invoice for a delivered shipment with company scoping', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createInvoice({
        shipment_id: 'shp-1',
        amount: 250,
      } as never);
    });

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert).toBeDefined();
    const payload = insert!.args[0] as Record<string, unknown>;
    expect(payload.company_id).toBe(TEST_COMPANY_ID);
    expect(payload.created_by).toBe(TEST_USER_ID);
    expect(payload.status).toBe('Draft');
  });

  it('blocks invoices for shipments that are not delivered', async () => {
    mock.setTableData('shipments_v2', [{ id: 'shp-1', status: 'IN_WAREHOUSE' }]);
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createInvoice({
        shipment_id: 'shp-1',
        amount: 100,
      } as never);
    });

    expect(created).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Invoice can only be created for delivered shipments',
    );
    expect(mock.calls.some((c) => c.method === 'insert')).toBe(false);
  });

  it('stamps issued_at when marking an invoice as Sent', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateInvoiceStatus('inv-1', 'Sent');
    });

    const update = mock.calls.find((c) => c.method === 'update');
    const payload = update!.args[0] as Record<string, unknown>;
    expect(payload.status).toBe('Sent');
    expect(payload.issued_at).toBeTruthy();
  });

  it('stamps paid_at when marking an invoice as Paid', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateInvoiceStatus('inv-1', 'Paid');
    });

    const payload = mock.calls.find((c) => c.method === 'update')!
      .args[0] as Record<string, unknown>;
    expect(payload.paid_at).toBeTruthy();
  });

  it('logs an audit event when deleting an invoice', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteInvoice('inv-1');
    });

    expect(mock.calls.some((c) => c.method === 'delete')).toBe(true);
    const audit = mock.rpcCalls.find((c) => c.fn === 'log_audit_event');
    expect((audit!.args as Record<string, unknown>).p_action).toBe('DELETE');
  });

  it('finds an invoice by its shipment', async () => {
    const { result } = renderHook(() => useInvoicesV2());
    await waitFor(() => expect(result.current.invoices).toHaveLength(1));

    expect(result.current.getInvoiceByShipment('shp-1')?.id).toBe('inv-1');
    expect(result.current.getInvoiceByShipment('shp-nope')).toBeUndefined();
  });

  it('toasts when loading fails', async () => {
    mock.setTableError('invoices_v2', { message: 'boom' });
    const { result } = renderHook(() => useInvoicesV2());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(toast.error).toHaveBeenCalledWith('Failed to load invoices');
  });
});
