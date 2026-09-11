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

const RealBlob = globalThis.Blob;
let captured = '';

/** Replace Blob so we can read the CSV text the exporter builds. */
function stubBlob() {
  captured = '';
  class FakeBlob {
    constructor(parts: unknown[] = []) {
      captured = parts.map(String).join('');
    }
  }
  globalThis.Blob = FakeBlob as unknown as typeof Blob;
}

function captureCsv(rows: Row[], cols: ExportColumn<Row>[] = columns): string {
  exportToCSV(rows, cols, 'shipments');
  return captured.replace('\ufeff', '');
}

describe('exportToCSV', () => {
  beforeEach(() => {
    stubBlob();
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.Blob = RealBlob;
    vi.restoreAllMocks();
  });

  it('writes a quoted header row from the column definitions', () => {
    expect(captureCsv([])).toBe('"Tracking","Amount","Client"');
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
    const csv = captureCsv(
      [{ tracking_number: 'SHP-4', amount: 50, client: null }],
      [{ key: 'amount', header: 'Amount', format: (v) => `${v} JOD` }],
    );
    expect(csv).toContain('"50 JOD"');
  });

  it('names the file with the given prefix and current date', () => {
    const anchor = document.createElement('a');
    const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(((n: Node) => n) as never);
    vi.spyOn(document.body, 'removeChild').mockImplementation(((n: Node) => n) as never);

    exportToCSV([], columns, 'invoices');
    createSpy.mockRestore();

    expect(anchor.download).toMatch(/^invoices_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
