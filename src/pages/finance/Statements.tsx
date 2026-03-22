import { useState, useMemo } from 'react';
import { FinanceLayout } from '@/components/finance/FinanceLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClients } from '@/hooks/useClients';
import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { usePayments } from '@/hooks/usePayments';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/csv-export';

interface SOAEntry {
  date: string;
  type: 'invoice' | 'payment' | 'expense';
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function StatementsPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { clients, loading: cLoading } = useClients();
  const { invoices, loading: iLoading } = useInvoicesV2();
  const { payments, loading: pLoading } = usePayments();
  const { expenses, loading: eLoading } = useExpenses();

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [viewType, setViewType] = useState<'customer' | 'vendor'>('customer');
  const loading = cLoading || iLoading || pLoading || eLoading;

  const filteredClients = clients.filter(c => 
    viewType === 'customer' ? c.type === 'CLIENT' : c.type === 'VENDOR'
  );

  const soaEntries = useMemo((): SOAEntry[] => {
    if (!selectedClient) return [];
    const entries: SOAEntry[] = [];
    
    // For customers: invoices are debits, payments are credits
    // For vendors: expenses/POs are debits, payments are credits
    if (viewType === 'customer') {
      // Invoices linked to this client's shipments (simplified: show all invoices for now)
      invoices.forEach(inv => {
        entries.push({
          date: inv.created_at,
          type: 'invoice',
          reference: inv.invoice_number,
          debit: Number(inv.amount),
          credit: 0,
          balance: 0,
        });
      });
      payments.forEach(pay => {
        entries.push({
          date: pay.paid_at,
          type: 'payment',
          reference: pay.reference || `PAY-${pay.id.slice(0, 8)}`,
          debit: 0,
          credit: Number(pay.amount),
          balance: 0,
        });
      });
    } else {
      expenses.forEach(exp => {
        entries.push({
          date: exp.expense_date,
          type: 'expense',
          reference: exp.expense_number,
          debit: Number(exp.amount),
          credit: 0,
          balance: 0,
        });
      });
    }

    // Sort by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = 0;
    entries.forEach(e => {
      balance += e.debit - e.credit;
      e.balance = balance;
    });

    return entries;
  }, [selectedClient, viewType, invoices, payments, expenses]);

  const totalDebit = soaEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = soaEntries.reduce((s, e) => s + e.credit, 0);

  const handleExport = () => {
    exportToCSV(soaEntries, [
      { key: 'date', header: 'Date', format: (v) => format(new Date(String(v)), 'yyyy-MM-dd') },
      { key: 'type', header: 'Type' },
      { key: 'reference', header: 'Reference' },
      { key: 'debit', header: 'Debit', format: (v) => String(v) },
      { key: 'credit', header: 'Credit', format: (v) => String(v) },
      { key: 'balance', header: 'Balance', format: (v) => String(v) },
    ], `SOA_${selectedClient}`);
  };

  if (loading) {
    return <FinanceLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></FinanceLayout>;
  }

  return (
    <FinanceLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {isRTL ? 'كشف الحساب' : 'Statement of Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? 'كشف حساب تفصيلي للعملاء والموردين' : 'Detailed account statements for customers & vendors'}
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button variant={viewType === 'customer' ? 'default' : 'outline'} size="sm" onClick={() => { setViewType('customer'); setSelectedClient(''); }}>
                <Users className="h-4 w-4 me-1" />{isRTL ? 'عملاء' : 'Customers'}
              </Button>
              <Button variant={viewType === 'vendor' ? 'default' : 'outline'} size="sm" onClick={() => { setViewType('vendor'); setSelectedClient(''); }}>
                <Users className="h-4 w-4 me-1" />{isRTL ? 'موردين' : 'Vendors'}
              </Button>
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={isRTL ? 'اختر العميل/المورد' : 'Select client/vendor'} />
              </SelectTrigger>
              <SelectContent>
                {filteredClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedClient && soaEntries.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 me-1" />{isRTL ? 'تصدير' : 'Export'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedClient && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'إجمالي المدين' : 'Total Debit'}</p>
                <p className="text-xl font-bold mt-1 text-red-600">{totalDebit.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'إجمالي الدائن' : 'Total Credit'}</p>
                <p className="text-xl font-bold mt-1 text-green-600">{totalCredit.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${(totalDebit - totalCredit) > 0 ? 'border-l-orange-500' : 'border-l-primary'}`}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'الرصيد' : 'Balance'}</p>
                <p className="text-xl font-bold mt-1">{(totalDebit - totalCredit).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SOA Table */}
        {selectedClient && (
          <Card>
            <CardContent className="p-0">
              {soaEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {isRTL ? 'لا توجد حركات' : 'No transactions found'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{isRTL ? 'المرجع' : 'Reference'}</TableHead>
                      <TableHead className="text-end">{isRTL ? 'مدين' : 'Debit'}</TableHead>
                      <TableHead className="text-end">{isRTL ? 'دائن' : 'Credit'}</TableHead>
                      <TableHead className="text-end">{isRTL ? 'الرصيد' : 'Balance'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soaEntries.map((entry, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === 'payment' ? 'default' : 'secondary'}>
                            {entry.type === 'invoice' ? (isRTL ? 'فاتورة' : 'Invoice') :
                             entry.type === 'payment' ? (isRTL ? 'دفعة' : 'Payment') :
                             (isRTL ? 'مصروف' : 'Expense')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                        <TableCell className="text-end font-semibold text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-end font-semibold text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-end font-bold">{entry.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FinanceLayout>
  );
}
