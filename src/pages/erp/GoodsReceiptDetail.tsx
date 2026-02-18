import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import MainLayout from '@/components/MainLayout';
import InternalMessagesPanel from '@/components/procurement/InternalMessagesPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PackageCheck, CheckCircle, Printer } from 'lucide-react';
import type { GoodsReceipt, GRNStatus } from '@/types/grn';


const statusColors: Record<GRNStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Posted: 'bg-green-100 text-green-700',
};

const GoodsReceiptDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { postGRN } = useGoodsReceipts();
  const [grn, setGrn] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchGRN = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('goods_receipts')
        .select(`
          *,
          purchase_order:purchase_orders!goods_receipts_po_id_fkey(
            id, po_number, vendor_id,
            vendor:clients!purchase_orders_vendor_id_fkey(id, name)
          ),
          warehouse:warehouses(id, name),
          goods_receipt_lines(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setGrn(data as unknown as GoodsReceipt);
    } catch (error) {
      console.error('Error fetching GRN:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGRN(); }, [fetchGRN]);

  const handlePost = async () => {
    if (!id) return;
    setPosting(true);
    const success = await postGRN(id);
    setPosting(false);
    if (success) await fetchGRN();
  };

  const handlePrint = () => window.print();


  if (loading) {
    return <MainLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></MainLayout>;
  }

  if (!grn) {
    return <MainLayout><div className="container mx-auto px-4 py-8"><p className="text-muted-foreground">GRN not found</p></div></MainLayout>;
  }

  const lines = grn.goods_receipt_lines || [];
  const totalAccepted = lines.reduce((s, l) => s + l.quantity_accepted, 0);
  const totalRejected = lines.reduce((s, l) => s + l.quantity_rejected, 0);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/erp/receipts')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />{language === 'ar' ? 'رجوع' : 'Back'}
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <PackageCheck className="w-8 h-8 text-primary" />
              {grn.grn_number}
            </h1>
            <p className="text-muted-foreground mt-1">
              PO: {grn.purchase_order?.po_number} — {grn.purchase_order?.vendor?.name || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[grn.status]}>{grn.status}</Badge>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />{language === 'ar' ? 'طباعة' : 'Print'}
            </Button>
            {grn.status === 'Draft' && (
              <Button onClick={handlePost} disabled={posting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {posting ? (language === 'ar' ? 'جاري الترحيل...' : 'Posting...') : (language === 'ar' ? 'ترحيل' : 'Post GRN')}
              </Button>
            )}
            <InternalMessagesPanel entityType="grn" entityId={grn.id} entityLabel={grn.grn_number} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{language === 'ar' ? 'التاريخ' : 'Date'}</CardTitle></CardHeader>
            <CardContent><p className="font-semibold">{new Date(grn.received_date).toLocaleDateString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{language === 'ar' ? 'المستودع' : 'Warehouse'}</CardTitle></CardHeader>
            <CardContent><p className="font-semibold">{grn.warehouse?.name || '—'}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{language === 'ar' ? 'مقبول' : 'Accepted'}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{totalAccepted}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{language === 'ar' ? 'مرفوض' : 'Rejected'}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">{totalRejected}</p></CardContent>
          </Card>
        </div>

        {grn.notes && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'ملاحظات' : 'Notes'}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{grn.notes}</p></CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>{language === 'ar' ? 'بنود الاستلام' : 'Receipt Lines'}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'مستلم' : 'Received'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'مقبول' : 'Accepted'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'مرفوض' : 'Rejected'}</TableHead>
                  <TableHead>{language === 'ar' ? 'سبب الرفض' : 'Reject Reason'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map(line => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.item_name}</TableCell>
                    <TableCell className="text-center">{line.quantity_received} {line.unit}</TableCell>
                    <TableCell className="text-center text-green-600 font-semibold">{line.quantity_accepted}</TableCell>
                    <TableCell className="text-center text-destructive font-semibold">{line.quantity_rejected}</TableCell>
                    <TableCell className="text-muted-foreground">{line.rejection_reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GoodsReceiptDetailPage;
