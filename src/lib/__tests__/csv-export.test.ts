import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, type ExportColumn } from '@/lib/csv-export';

interface Row {
  tracking_number: string;
  amount: number | null;
  client: { name: string } | null;
}

const columns: ExportColumn<Row>[] = [
  { key: 'tracking_number', header: 'Tracking' },
  { key: 'amount', header: 'Amount' },
  { key: 'client.name', header: 'Client' },
];

function captureCsv(rows: Row[]): string {
  let captured = '';
  const blobSpy = vi
    .spyOn(globalThis, 'Blob')
    .mockImplementation(((parts: string[]) => {
      captured = parts.join('');
      return { size: 0, type: 'text/csv' } as unknown as Blob;
    }) as unknown as typeof Blob);

  exportToCSV(rows, columns, 'shipments');
  blobSpy.mockRestore();
  return captured.replace('\ufeff', '');
}

describe('exportToCSV', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('writes a quoted header row from the column definitions', () => {
    const csv = captureCsv([]);
    expect(csv).toBe('"Tracking","Amount","Client"');
  });

  it('resolves nested keys with dot notation', () => {
    const csv = captureCsv([
      { tracking_number: 'SHP-1', amount: 120, client: { name: 'Aramex' } },
    ]);
    expect(csv.split('\n')[1]).toBe('"SHP-1","120","Aramex"');
  });

  it('renders null and missing values as empty cells', () => {
    const csv = captureCsv([
      { tracking_number: 'SHP-2', amount: null, client: null },
    ]);
    expect(csv.split('\n')[1]).toBe('"SHP-2","",""');
  });

  it('escapes embedded double quotes', () => {
    const csv = captureCsv([
      { tracking_number: 'SHP-"3"', amount: 1, client: { name: 'A"B' } },
    ]);
    expect(csv.split('\n')[1]).toBe('"SHP-""3""","1","A""B"');
  });

  it('applies a custom column formatter', () => {
    let captured = '';
    vi.spyOn(globalThis, 'Blob').mockImplementation(((parts: string[]) => {
      captured = parts.join('');
      return {} as Blob;
    }) as unknown as typeof Blob);

    exportToCSV(
      [{ tracking_number: 'SHP-4', amount: 50, client: null }],
      [{ key: 'amount', header: 'Amount', format: (v) => `${v} JOD` }],
      'invoices',
    );
    expect(captured).toContain('"50 JOD"');
  });

  it('names the file with the given prefix and current date', () => {
    const anchor = document.createElement('a');
    const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(globalThis, 'Blob').mockImplementation((() => ({}) as Blob) as unknown as typeof Blob);

    exportToCSV([], columns, 'invoices');
    createSpy.mockRestore();

    expect(anchor.download).toMatch(/^invoices_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
