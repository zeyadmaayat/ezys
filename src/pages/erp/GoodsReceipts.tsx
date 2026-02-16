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
import { Plus, Search, PackageCheck } from 'lucide-react';
import type { GRNStatus } from '@/types/grn';

const statusColors: Record<GRNStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Posted: 'bg-green-100 text-green-700',
};

const GoodsReceiptsPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { receipts, loading } = useGoodsReceipts();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = receipts.filter(r =>
    r.grn_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.purchase_order?.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.purchase_order?.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button onClick={() => navigate('/erp/receipts/new')}>
            <Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'استلام جديد' : 'New GRN'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {(['Draft', 'Posted'] as GRNStatus[]).map(s => (
            <Card key={s}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{receipts.filter(r => r.status === s).length}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث...' : 'Search GRNs...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'رقم GRN' : 'GRN #'}</TableHead>
                <TableHead>{language === 'ar' ? 'رقم PO' : 'PO #'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'المستودع' : 'Warehouse'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'البنود' : 'Lines'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد إيصالات' : 'No goods receipts'}</TableCell></TableRow>
              ) : filtered.map(grn => (
                <TableRow key={grn.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/erp/receipts/${grn.id}`)}>
                  <TableCell className="font-mono font-medium">{grn.grn_number}</TableCell>
                  <TableCell className="font-mono">{grn.purchase_order?.po_number || '—'}</TableCell>
                  <TableCell>{grn.purchase_order?.vendor?.name || '—'}</TableCell>
                  <TableCell>{grn.warehouse?.name || '—'}</TableCell>
                  <TableCell>{new Date(grn.received_date).toLocaleDateString()}</TableCell>
                  <TableCell>{grn.goods_receipt_lines?.length || 0}</TableCell>
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
