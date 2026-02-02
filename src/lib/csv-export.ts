// CSV Export Utility

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // Build header row
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  
  // Build data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value: unknown;
      
      if (typeof col.key === 'string' && col.key.includes('.')) {
        value = getNestedValue(row, col.key);
      } else {
        value = (row as Record<string, unknown>)[col.key as string];
      }
      
      if (col.format) {
        value = col.format(value, row);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });
  
  // Combine
  const csv = [headers, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
