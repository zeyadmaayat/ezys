import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  testCompany,
  TEST_COMPANY_ID,
  OTHER_COMPANY_ID,
  TEST_USER_ID,
} from '@/test/supabaseMock';

const mock = await vi.hoisted(
  async () => (await import('@/test/supabaseMock')).createSupabaseMock(),
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mock.supabase,
}));

const authState = { user: { id: TEST_USER_ID } as { id: string } | null };
const companyState = { company: testCompany as typeof testCompany | null };

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/hooks/useCompany', () => ({
  useCompany: () => companyState,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useShipmentsV2 } from '@/hooks/useShipmentsV2';
import { toast } from 'sonner';

const shipment = (over: Record<string, unknown> = {}) => ({
  id: 'shp-1',
  company_id: TEST_COMPANY_ID,
  tracking_number: 'SHP-0001',
  status: 'CREATED',
  origin: 'Amman',
  destination: 'Irbid',
  created_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('useShipmentsV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.calls.length = 0;
    mock.rpcCalls.length = 0;
    Object.keys(mock.filters).forEach((k) => delete mock.filters[k]);
    mock.setTableError('shipments_v2', null);
    mock.setTableData('shipments_v2', [shipment()]);
    authState.user = { id: TEST_USER_ID };
    companyState.company = testCompany;
  });

  it('loads shipments scoped to the current company_id', async () => {
    const { result } = renderHook(() => useShipmentsV2());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mock.supabase.from).toHaveBeenCalledWith('shipments_v2');
    expect(mock.filters.shipments_v2.company_id).toBe(TEST_COMPANY_ID);
    expect(mock.filters.shipments_v2.company_id).not.toBe(OTHER_COMPANY_ID);
    expect(result.current.shipments).toHaveLength(1);
  });

  it('does not query at all when there is no company yet', async () => {
    companyState.company = null;
    const { result } = renderHook(() => useShipmentsV2());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.shipments).toEqual([]);
    expect(mock.supabase.from).not.toHaveBeenCalled();
  });

  it('does not query when the user is signed out', async () => {
    authState.user = null;
    const { result } = renderHook(() => useShipmentsV2());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mock.supabase.from).not.toHaveBeenCalled();
  });

  it('stamps company_id and created_by on newly created shipments', async () => {
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createShipment({
        origin: 'Amman',
        destination: 'Zarqa',
      } as never);
    });

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert).toBeDefined();
    const payload = insert!.args[0] as Record<string, unknown>;
    expect(payload.company_id).toBe(TEST_COMPANY_ID);
    expect(payload.created_by).toBe(TEST_USER_ID);
    expect(payload.status).toBe('CREATED');
  });

  it('refuses to create a shipment without a company', async () => {
    companyState.company = null;
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createShipment({
        origin: 'A',
        destination: 'B',
      } as never);
    });

    expect(created).toBeNull();
    expect(toast.error).toHaveBeenCalled();
  });

  it('rejects backward status transitions', async () => {
    mock.setTableData('shipments_v2', [shipment({ status: 'DELIVERED' })]);
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.shipments).toHaveLength(1));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateShipmentStatus('shp-1', 'CREATED');
    });

    expect(ok).toBe(false);
    expect(mock.calls.some((c) => c.method === 'update')).toBe(false);
  });

  it('rejects skipping status steps', async () => {
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.shipments).toHaveLength(1));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateShipmentStatus('shp-1', 'DELIVERED');
    });

    expect(ok).toBe(false);
    expect(mock.calls.some((c) => c.method === 'update')).toBe(false);
  });

  it('accepts the next status in the flow and writes an audit event', async () => {
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.shipments).toHaveLength(1));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateShipmentStatus('shp-1', 'PICKED_UP');
    });

    expect(ok).toBe(true);
    expect(mock.calls.some((c) => c.method === 'update')).toBe(true);
    expect(mock.rpcCalls.some((c) => c.fn === 'log_audit_event')).toBe(true);
  });

  it('exposes the next status helper', async () => {
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getNextStatus('CREATED')).toBe('PICKED_UP');
    expect(result.current.getNextStatus('DELIVERED')).toBeNull();
  });

  it('filters delivered shipments', async () => {
    mock.setTableData('shipments_v2', [
      shipment({ id: 'a', status: 'DELIVERED' }),
      shipment({ id: 'b', status: 'CREATED' }),
    ]);
    const { result } = renderHook(() => useShipmentsV2());
    await waitFor(() => expect(result.current.shipments).toHaveLength(2));

    expect(result.current.getDeliveredShipments()).toHaveLength(1);
  });

  it('surfaces a toast when loading fails', async () => {
    mock.setTableError('shipments_v2', { message: 'boom' });
    const { result } = renderHook(() => useShipmentsV2());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(toast.error).toHaveBeenCalledWith('Failed to load shipments');
  });
});
