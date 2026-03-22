import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReturnOrders } from '@/hooks/useReturnOrders';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import { ErpLayout } from '@/components/erp/ErpLayout';
import InternalMessagesPanel from '@/components/procurement/InternalMessagesPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, RotateCcw, ArrowRight, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { RTVStatus, ReturnReason, RTVResolution } from '@/types/procurement';

const statusColors: Record<RTVStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Approved: 'bg-primary/15 text-primary',
  Shipped: 'bg-secondary/20 text-secondary-foreground',
  Received_by_Vendor: 'bg-primary/10 text-primary',
  Credited: 'bg-primary/20 text-primary font-semibold',
  Closed: 'bg-muted text-muted-foreground',
};

const statusFlow: RTVStatus[] = ['Draft', 'Approved', 'Shipped', 'Received_by_Vendor', 'Credited', 'Closed'];
const reasons: ReturnReason[] = ['Defective', 'Wrong_Item', 'Damaged', 'Quality_Issue', 'Expired', 'Other'];
const resolutions: RTVResolution[] = ['Replace', 'Refund', 'Credit'];

const ReturnOrdersPage = () => {
  const { language } = useLanguage();
  const { returnOrders, loading, createRTV, updateStatus } = useReturnOrders();
  const { purchaseOrders } = usePurchaseOrders();
  const { receipts } = useGoodsReceipts();
  const availableGRNs = receipts;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RTVStatus | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'grn' | 'po'>('grn');
  const [selectedGRN, setSelectedGRN] = useState('');
  const [selectedPO, setSelectedPO] = useState('');
  const [formData, setFormData] = useState({
    po_line_id: '',
    grn_line_id: '',
    return_reason: 'Defective' as ReturnReason,
    quantity: 1,
    unit: 'pcs',
    resolution: '' as string,
    notes: '',
  });

  const selectedGRNData = receipts.find(g => g.id === selectedGRN);
  const selectedPOData = purchaseOrders.find(po => po.id === selectedPO);
  const availablePOs = purchaseOrders;

  const filtered = returnOrders.filter(rtv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rtv.rtv_number.toLowerCase().includes(q) ||
      (rtv.purchase_order?.po_number || '').toLowerCase().includes(q) ||
      (rtv.vendor?.name || '').toLowerCase().includes(q) ||
      (rtv.goods_receipt?.grn_number || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || rtv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getNextStatus = (current: RTVStatus): RTVStatus | null => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const handleExportCSV = () => {
    exportToCSV(filtered, [
      { key: 'rtv_number', header: 'RTV #' },
      { key: 'purchase_order', header: 'PO #', format: (_, r) => r.purchase_order?.po_number || '' },
      { key: 'goods_receipt', header: 'GRN #', format: (_, r) => r.goods_receipt?.grn_number || '' },
      { key: 'vendor', header: 'Vendor', format: (_, r) => r.vendor?.name || '' },
      { key: 'return_reason', header: 'Reason', format: (v) => String(v).replace('_', ' ') },
      { key: 'quantity', header: 'Qty', format: (v) => String(v) },
      { key: 'unit', header: 'Unit' },
      { key: 'status', header: 'Status', format: (v) => String(v).replace('_', ' ') },
      { key: 'created_at', header: 'Created', format: (v) => new Date(String(v)).toLocaleDateString() },
    ], 'RTV_Export');
  };

  const handleSubmit = async () => {
    let poId = selectedPO;
    let vendorId: string | undefined;

    if (sourceType === 'grn' && selectedGRNData) {
      poId = selectedGRNData.po_id;
      vendorId = selectedGRNData.purchase_order?.vendor_id || undefined;
    } else if (sourceType === 'po' && selectedPOData) {
      vendorId = selectedPOData.vendor_id || undefined;
    }

    if (!poId) return;

    await createRTV({
      po_id: poId,
      po_line_id: formData.po_line_id || undefined,
      vendor_id: vendorId,
      grn_id: sourceType === 'grn' ? selectedGRN || undefined : undefined,
      grn_line_id: sourceType === 'grn' ? formData.grn_line_id || undefined : undefined,
      return_reason: formData.return_reason,
      quantity: formData.quantity,
      unit: formData.unit,
      resolution: formData.resolution || undefined,
      notes: formData.notes || undefined,
    });
    setIsDialogOpen(false);
    setSelectedGRN('');
    setSelectedPO('');
    setFormData({ po_line_id: '', grn_line_id: '', return_reason: 'Defective', quantity: 1, unit: 'pcs', resolution: '', notes: '' });
  };

  if (loading) {
    return <ErpLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></ErpLayout>;
  }

  return (
    <ErpLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <RotateCcw className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'إرجاع للمورد (RTV)' : 'Return to Vendor (RTV)'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة إرجاع البضائع للموردين' : 'Manage material returns to vendors'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'إرجاع جديد' : 'New RTV'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إرجاع للمورد' : 'Return to Vendor'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Source type toggle */}
                  <div>
                    <Label>{language === 'ar' ? 'المصدر' : 'Source'}</Label>
                    <div className="flex gap-2 mt-1">
                      <Button variant={sourceType === 'grn' ? 'default' : 'outline'} size="sm" onClick={() => { setSourceType('grn'); setSelectedPO(''); }}>
                        {language === 'ar' ? 'من GRN' : 'From GRN'}
                      </Button>
                      <Button variant={sourceType === 'po' ? 'default' : 'outline'} size="sm" onClick={() => { setSourceType('po'); setSelectedGRN(''); }}>
                        {language === 'ar' ? 'من PO' : 'From PO'}
                      </Button>
                    </div>
                  </div>

                  {sourceType === 'grn' ? (
                    <>
                      <div>
                        <Label>{language === 'ar' ? 'إيصال الاستلام' : 'Goods Receipt'}</Label>
                        <Select value={selectedGRN} onValueChange={setSelectedGRN}>
                          <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر GRN' : 'Select GRN'} /></SelectTrigger>
                          <SelectContent>
                            {availableGRNs.map(g => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.grn_number} — {g.purchase_order?.vendor?.name || 'N/A'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedGRNData?.goods_receipt_lines && selectedGRNData.goods_receipt_lines.length > 0 && (
                        <div>
                          <Label>{language === 'ar' ? 'بند GRN' : 'GRN Line'}</Label>
                          <Select value={formData.grn_line_id} onValueChange={(v) => setFormData({ ...formData, grn_line_id: v })}>
                            <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر البند' : 'Select line'} /></SelectTrigger>
                            <SelectContent>
                              {selectedGRNData.goods_receipt_lines.map(l => (
                                <SelectItem key={l.id} value={l.id}>
                                  {l.item_name} (accepted: {l.quantity_accepted})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>{language === 'ar' ? 'أمر الشراء' : 'Purchase Order'}</Label>
                        <Select value={selectedPO} onValueChange={setSelectedPO}>
                          <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر PO' : 'Select PO'} /></SelectTrigger>
                          <SelectContent>
                            {availablePOs.map(po => <SelectItem key={po.id} value={po.id}>{po.po_number} — {po.vendor?.name || 'N/A'}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedPOData?.po_lines && selectedPOData.po_lines.length > 0 && (
                        <div>
                          <Label>{language === 'ar' ? 'بند الـ PO' : 'PO Line'}</Label>
                          <Select value={formData.po_line_id} onValueChange={(v) => setFormData({ ...formData, po_line_id: v })}>
                            <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر البند' : 'Select line'} /></SelectTrigger>
                            <SelectContent>
                              {selectedPOData.po_lines.map(l => <SelectItem key={l.id} value={l.id}>#{l.line_number} - {l.item_name} ({l.quantity} {l.unit})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'سبب الإرجاع' : 'Reason'}</Label>
                      <Select value={formData.return_reason} onValueChange={(v) => setFormData({ ...formData, return_reason: v as ReturnReason })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{reasons.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'الحل' : 'Resolution'}</Label>
                      <Select value={formData.resolution} onValueChange={(v) => setFormData({ ...formData, resolution: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>{resolutions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الكمية' : 'Quantity'}</Label>
                    <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} min={1} />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button onClick={handleSubmit} disabled={sourceType === 'grn' ? !selectedGRN : !selectedPO}>
                      {language === 'ar' ? 'إنشاء RTV' : 'Create RTV'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards — clickable filters */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(['All', 'Draft', 'Shipped', 'Credited'] as const).map(s => (
            <Card
              key={s}
              className={`cursor-pointer transition-all border-2 ${statusFilter === s ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
              onClick={() => setStatusFilter(s as RTVStatus | 'All')}
            >
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                  {s === 'All' ? (language === 'ar' ? 'الكل' : 'All') : s.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold text-foreground">
                  {s === 'All' ? returnOrders.length : returnOrders.filter(r => r.status === s).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث بـ RTV أو PO أو المورد أو GRN...' : 'Search by RTV, PO, vendor, or GRN...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                <TableHead>{language === 'ar' ? 'رقم RTV' : 'RTV #'}</TableHead>
                <TableHead>{language === 'ar' ? 'رقم PO' : 'PO #'}</TableHead>
                <TableHead>{language === 'ar' ? 'GRN' : 'GRN'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'السبب' : 'Reason'}</TableHead>
                <TableHead>{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">{language === 'ar' ? 'لا توجد إرجاعات' : 'No return orders found'}</TableCell></TableRow>
              ) : filtered.map(rtv => {
                const nextStatus = getNextStatus(rtv.status);
                return (
                  <TableRow key={rtv.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-semibold text-primary">{rtv.rtv_number}</TableCell>
                    <TableCell className="font-mono text-sm">{rtv.purchase_order?.po_number || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{rtv.goods_receipt?.grn_number || '—'}</TableCell>
                    <TableCell className="font-medium">{rtv.vendor?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{rtv.return_reason.replace('_', ' ')}</TableCell>
                    <TableCell>{rtv.quantity} {rtv.unit}</TableCell>
                    <TableCell><Badge className={statusColors[rtv.status]}>{rtv.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {nextStatus && (
                          <Button variant="outline" size="sm" onClick={() => updateStatus(rtv.id, nextStatus)}>
                            <ArrowRight className="w-4 h-4 mr-1" />{nextStatus.replace('_', ' ')}
                          </Button>
                        )}
                        <InternalMessagesPanel entityType="rtv" entityId={rtv.id} entityLabel={rtv.rtv_number} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </ErpLayout>
  );
};

export default ReturnOrdersPage;
