import { useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Link2 } from 'lucide-react';

interface MatchRow {
  po_id: string;
  po_number: string;
  vendor: string;
  po_amount: number;
  grn_count: number;
  invoice_count: number;
  status: 'matched' | 'partial' | 'unmatched';
}

export default function ThreeWayMatchPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders();
  const { receipts, loading: grnLoading } = useGoodsReceipts();
  const { invoices, loading: invLoading } = useInvoicesV2();

  const loading = poLoading || grnLoading || invLoading;

  const matchData = useMemo((): MatchRow[] => {
    return purchaseOrders.map(po => {
      const grns = receipts.filter(g => g.po_id === po.id);
      const invs = invoices.filter(i => (i as any).po_id === po.id);

      let status: MatchRow['status'] = 'unmatched';
      if (grns.length > 0 && invs.length > 0) status = 'matched';
      else if (grns.length > 0 || invs.length > 0) status = 'partial';

      return {
        po_id: po.id,
        po_number: po.po_number,
        vendor: po.vendor?.name || '—',
        po_amount: Number(po.total_amount),
        grn_count: grns.length,
        invoice_count: invs.length,
        status,
      };
    });
  }, [purchaseOrders, receipts, invoices]);

  const counts = {
    matched: matchData.filter(m => m.status === 'matched').length,
    partial: matchData.filter(m => m.status === 'partial').length,
    unmatched: matchData.filter(m => m.status === 'unmatched').length,
  };

  const statusBadge = (status: MatchRow['status']) => {
    switch (status) {
      case 'matched': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 me-1" />{isRTL ? 'مطابق' : 'Matched'}</Badge>;
      case 'partial': return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><AlertTriangle className="h-3 w-3 me-1" />{isRTL ? 'جزئي' : 'Partial'}</Badge>;
      case 'unmatched': return <Badge className="bg-muted text-muted-foreground"><XCircle className="h-3 w-3 me-1" />{isRTL ? 'غير مطابق' : 'Unmatched'}</Badge>;
    }
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            {isRTL ? 'المطابقة الثلاثية' : 'Three-Way Matching'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? 'مطابقة أوامر الشراء مع إيصالات الاستلام والفواتير' : 'Match Purchase Orders with GRNs and Invoices'}
          </p>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500 cursor-pointer">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'مطابق بالكامل' : 'Fully Matched'}</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{counts.matched}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 cursor-pointer">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'مطابقة جزئية' : 'Partial Match'}</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{counts.partial}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-muted">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'غير مطابق' : 'Unmatched'}</p>
              <p className="text-2xl font-bold mt-1">{counts.unmatched}</p>
            </CardContent>
          </Card>
        </div>

        {/* Match Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'أمر الشراء' : 'Purchase Order'}</TableHead>
                  <TableHead>{isRTL ? 'المورد' : 'Vendor'}</TableHead>
                  <TableHead className="text-end">{isRTL ? 'المبلغ' : 'PO Amount'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'إيصالات (GRN)' : 'GRNs'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'فواتير' : 'Invoices'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</TableCell></TableRow>
                ) : matchData.map(row => (
                  <TableRow key={row.po_id}>
                    <TableCell className="font-mono font-semibold text-primary">{row.po_number}</TableCell>
                    <TableCell>{row.vendor}</TableCell>
                    <TableCell className="text-end font-semibold">{row.po_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.grn_count > 0 ? 'default' : 'secondary'}>{row.grn_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.invoice_count > 0 ? 'default' : 'secondary'}>{row.invoice_count}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
