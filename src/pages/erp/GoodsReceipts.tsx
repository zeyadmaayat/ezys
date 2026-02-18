import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, PackageCheck, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { GRNStatus, GoodsReceipt } from '@/types/grn';

const statusColors: Record<GRNStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Posted: 'bg-green-100 text-green-800',
};

const GoodsReceiptsPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { receipts, loading } = useGoodsReceipts();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GRNStatus | 'All'>('All');

  const filtered = receipts.filter(r => {
    const matchesSearch =
      r.grn_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purchase_order?.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purchase_order?.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    exportToCSV<GoodsReceipt>(filtered, [
      { key: 'grn_number', header: 'GRN #' },
      { key: 'purchase_order.po_number' as keyof GoodsReceipt, header: 'PO #', format: (_, r) => r.purchase_order?.po_number || '' },
      { key: 'purchase_order.vendor.name' as keyof GoodsReceipt, header: 'Vendor', format: (_, r) => r.purchase_order?.vendor?.name || '' },
      { key: 'warehouse.name' as keyof GoodsReceipt, header: 'Warehouse', format: (_, r) => r.warehouse?.name || '' },
      { key: 'received_date', header: 'Date' },
      { key: 'status', header: 'Status' },
    ], 'GRN_Export');
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <PackageCheck className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'استلام البضائع (GRN)' : 'Goods Receiving (GRN)'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة استلام البضائع من الموردين' : 'Manage goods received from vendors'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
            <Button onClick={() => navigate('/erp/receipts/new')}>
              <Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'استلام جديد' : 'New GRN'}
            </Button>
          </div>
        </div>

        {/* KPI Cards — clickable for filtering */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['All', 'Draft', 'Posted'] as const).map(s => (
            <Card
              key={s}
              className={`cursor-pointer transition-all border-2 ${statusFilter === s ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
              onClick={() => setStatusFilter(s)}
            >
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                  {s === 'All' ? (language === 'ar' ? 'الكل' : 'All') : s}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold text-foreground">
                  {s === 'All' ? receipts.length : receipts.filter(r => r.status === s).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث بـ GRN أو PO أو المورد...' : 'Search by GRN, PO, or vendor...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {language === 'ar' ? 'نتيجة' : 'results'}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'رقم GRN' : 'GRN #'}</TableHead>
                <TableHead>{language === 'ar' ? 'رقم PO' : 'PO #'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'المستودع' : 'Warehouse'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'البنود' : 'Lines'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">{language === 'ar' ? 'لا توجد إيصالات' : 'No goods receipts found'}</TableCell></TableRow>
              ) : filtered.map(grn => (
                <TableRow key={grn.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/erp/receipts/${grn.id}`)}>
                  <TableCell className="font-mono font-semibold text-primary">{grn.grn_number}</TableCell>
                  <TableCell className="font-mono text-sm">{grn.purchase_order?.po_number || '—'}</TableCell>
                  <TableCell className="font-medium">{grn.purchase_order?.vendor?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{grn.warehouse?.name || '—'}</TableCell>
                  <TableCell className="text-sm">{new Date(grn.received_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{grn.goods_receipt_lines?.length || 0}</TableCell>
                  <TableCell><Badge className={statusColors[grn.status]}>{grn.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/erp/receipts/${grn.id}`); }}>
                      {language === 'ar' ? 'عرض' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GoodsReceiptsPage;

