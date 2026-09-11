import { vi } from 'vitest';

export interface RecordedCall {
  table: string;
  method: string;
  args: unknown[];
}

export interface SupabaseMock {
  supabase: Record<string, unknown>;
  calls: RecordedCall[];
  rpcCalls: { fn: string; args: unknown }[];
  /** Filters applied via .eq(), keyed by table -> column -> value */
  filters: Record<string, Record<string, unknown>>;
  setTableData: (table: string, rows: unknown[]) => void;
  setTableError: (table: string, error: { message: string } | null) => void;
}

/**
 * Minimal chainable stand-in for the Supabase JS client.
 * Every builder method returns the same thenable object, so any chain
 * (`.select().eq().order()`) resolves to `{ data, error }`.
 */
export function createSupabaseMock(
  initialData: Record<string, unknown[]> = {},
): SupabaseMock {
  const data: Record<string, unknown[]> = { ...initialData };
  const errors: Record<string, { message: string } | null> = {};
  const calls: RecordedCall[] = [];
  const rpcCalls: { fn: string; args: unknown }[] = [];
  const filters: Record<string, Record<string, unknown>> = {};

  const makeBuilder = (table: string) => {
    let single = false;

    const resolve = () => {
      const error = errors[table] ?? null;
      if (error) return { data: null, error };
      const rows = data[table] ?? [];
      return single
        ? { data: rows[0] ?? null, error: null }
        : { data: rows, error: null };
    };

    const builder: Record<string, unknown> = {};

    const chain = (method: string) => (...args: unknown[]) => {
      calls.push({ table, method, args });
      if (method === 'eq') {
        filters[table] = { ...(filters[table] ?? {}), [String(args[0])]: args[1] };
      }
      if (method === 'single' || method === 'maybeSingle') single = true;
      return builder;
    };

    for (const method of [
      'select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in',
      'is', 'gte', 'lte', 'gt', 'lt', 'like', 'ilike', 'or', 'order',
      'limit', 'range', 'single', 'maybeSingle',
    ]) {
      builder[method] = chain(method);
    }

    builder.then = (onFulfilled: (v: unknown) => unknown) =>
      Promise.resolve(resolve()).then(onFulfilled);
    builder.catch = (onRejected: (e: unknown) => unknown) =>
      Promise.resolve(resolve()).catch(onRejected);

    return builder;
  };

  const supabase = {
    from: vi.fn((table: string) => makeBuilder(table)),
    rpc: vi.fn(async (fn: string, args: unknown) => {
      rpcCalls.push({ fn, args });
      return { data: null, error: null };
    }),
    functions: { invoke: vi.fn(async () => ({ data: {}, error: null })) },
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: () => {} } },
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  };

  return {
    supabase,
    calls,
    rpcCalls,
    filters,
    setTableData: (table, rows) => { data[table] = rows; },
    setTableError: (table, error) => { errors[table] = error; },
  };
}

export const TEST_COMPANY_ID = 'company-aaa-111';
export const OTHER_COMPANY_ID = 'company-bbb-222';
export const TEST_USER_ID = 'user-123';

export const testCompany = {
  id: TEST_COMPANY_ID,
  name: 'Ezy Test Co',
  logo: null,
  plan: 'pro',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};
