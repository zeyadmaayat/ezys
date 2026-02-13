import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReturnOrders } from '@/hooks/useReturnOrders';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import MainLayout from '@/components/MainLayout';
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
import { Plus, Search, RotateCcw, ArrowRight } from 'lucide-react';
import type { RTVStatus, ReturnReason, RTVResolution } from '@/types/procurement';

const statusColors: Record<RTVStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Approved: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-orange-100 text-orange-700',
  Received_by_Vendor: 'bg-cyan-100 text-cyan-700',
  Credited: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-700',
};

const statusFlow: RTVStatus[] = ['Draft', 'Approved', 'Shipped', 'Received_by_Vendor', 'Credited', 'Closed'];
const reasons: ReturnReason[] = ['Defective', 'Wrong_Item', 'Damaged', 'Quality_Issue', 'Expired', 'Other'];
const resolutions: RTVResolution[] = ['Replace', 'Refund', 'Credit'];

const ReturnOrdersPage = () => {
  const { language } = useLanguage();
  const { returnOrders, loading, createRTV, updateStatus } = useReturnOrders();
  const { purchaseOrders } = usePurchaseOrders();
  const receivedPOs = purchaseOrders.filter(po => ['Received', 'Partially_Received', 'Closed'].includes(po.status));

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState('');
  const [formData, setFormData] = useState({ po_line_id: '', return_reason: 'Defective' as ReturnReason, quantity: 1, unit: 'pcs', resolution: '' as string, notes: '' });

  const selectedPOData = purchaseOrders.find(po => po.id === selectedPO);

  const filtered = returnOrders.filter(rtv =>
    rtv.rtv_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNextStatus = (current: RTVStatus): RTVStatus | null => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const handleSubmit = async () => {
    if (!selectedPO) return;
    const po = purchaseOrders.find(p => p.id === selectedPO);
    await createRTV({
      po_id: selectedPO,
      po_line_id: formData.po_line_id || undefined,
      vendor_id: po?.vendor_id || undefined,
      return_reason: formData.return_reason,
      quantity: formData.quantity,
      unit: formData.unit,
      resolution: formData.resolution || undefined,
      notes: formData.notes || undefined,
    });
    setIsDialogOpen(false);
    setSelectedPO('');
    setFormData({ po_line_id: '', return_reason: 'Defective', quantity: 1, unit: 'pcs', resolution: '', notes: '' });
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
              <RotateCcw className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'إرجاع للمورد (RTV)' : 'Return to Vendor (RTV)'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة إرجاع البضائع للموردين' : 'Manage material returns to vendors'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'إرجاع جديد' : 'New RTV'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{language === 'ar' ? 'إرجاع للمورد' : 'Return to Vendor'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>{language === 'ar' ? 'أمر الشراء' : 'Purchase Order'}</Label>
                  <Select value={selectedPO} onValueChange={setSelectedPO}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر PO' : 'Select PO'} /></SelectTrigger>
                    <SelectContent>
                      {receivedPOs.map(po => <SelectItem key={po.id} value={po.id}>{po.po_number} — {po.vendor?.name || 'N/A'}</SelectItem>)}
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
                  <Button onClick={handleSubmit} disabled={!selectedPO}>{language === 'ar' ? 'إنشاء RTV' : 'Create RTV'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {(['Draft', 'Shipped', 'Credited'] as RTVStatus[]).map(s => (
            <Card key={s}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.replace('_', ' ')}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{returnOrders.filter(r => r.status === s).length}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث...' : 'Search RTVs...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'رقم RTV' : 'RTV #'}</TableHead>
                <TableHead>{language === 'ar' ? 'رقم PO' : 'PO #'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'السبب' : 'Reason'}</TableHead>
                <TableHead>{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد إرجاعات' : 'No return orders'}</TableCell></TableRow>
              ) : filtered.map(rtv => {
                const nextStatus = getNextStatus(rtv.status);
                return (
                  <TableRow key={rtv.id}>
                    <TableCell className="font-mono font-medium">{rtv.rtv_number}</TableCell>
                    <TableCell className="font-mono">{rtv.purchase_order?.po_number || '—'}</TableCell>
                    <TableCell>{rtv.vendor?.name || '—'}</TableCell>
                    <TableCell>{rtv.return_reason.replace('_', ' ')}</TableCell>
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
    </MainLayout>
  );
};

export default ReturnOrdersPage;
