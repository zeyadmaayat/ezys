import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import { useWarehouses } from '@/hooks/useWarehouses';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, PackageCheck, Save } from 'lucide-react';
import type { GoodsReceiptLine } from '@/types/grn';

interface LineInput {
  po_line_id: string;
  item_id: string | null;
  item_name: string;
  quantity_ordered: number;
  quantity_already_received: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  unit: string;
  rejection_reason: string;
}

const GoodsReceiptNewPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPoId = searchParams.get('po_id') || '';

  const { purchaseOrders } = usePurchaseOrders();
  const { createGRN } = useGoodsReceipts();
  const { warehouses } = useWarehouses();

  const receivablePOs = purchaseOrders.filter(po => ['Sent', 'Acknowledged', 'Partially_Received'].includes(po.status));

  const [selectedPO, setSelectedPO] = useState(initialPoId);
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineInput[]>([]);
  const [saving, setSaving] = useState(false);

  const handlePOSelect = (poId: string) => {
    setSelectedPO(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (po?.po_lines) {
      setLines(po.po_lines.map(l => ({
        po_line_id: l.id,
        item_id: l.item_id,
        item_name: l.item_name,
        quantity_ordered: l.quantity,
        quantity_already_received: l.received_quantity,
        quantity_received: 0,
        quantity_accepted: 0,
        quantity_rejected: 0,
        unit: l.unit,
        rejection_reason: '',
      })));
    }
  };

  const updateLine = (idx: number, field: keyof LineInput, value: number | string) => {
    setLines(prev => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      // Auto-calc: if user sets received, default accepted = received - rejected
      if (field === 'quantity_received') {
        updated[idx].quantity_accepted = Math.max(0, (value as number) - updated[idx].quantity_rejected);
      }
      if (field === 'quantity_rejected') {
        updated[idx].quantity_accepted = Math.max(0, updated[idx].quantity_received - (value as number));
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedPO) return;
    setSaving(true);
    const grnLines: Omit<GoodsReceiptLine, 'id' | 'grn_id' | 'created_at'>[] = lines
      .filter(l => l.quantity_received > 0)
      .map(l => ({
        po_line_id: l.po_line_id,
        item_id: l.item_id,
        item_name: l.item_name,
        quantity_received: l.quantity_received,
        quantity_accepted: l.quantity_accepted,
        quantity_rejected: l.quantity_rejected,
        unit: l.unit,
        rejection_reason: l.rejection_reason || null,
      }));

    if (grnLines.length === 0) {
      setSaving(false);
      return;
    }

    const result = await createGRN(selectedPO, warehouseId || null, notes || null, grnLines);
    setSaving(false);
    if (result) {
      navigate(`/erp/receipts/${result.id}`);
    }
  };

  const selectedPOData = purchaseOrders.find(p => p.id === selectedPO);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/erp/receipts')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />{language === 'ar' ? 'رجوع' : 'Back'}
        </Button>

        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-8">
          <PackageCheck className="w-8 h-8 text-primary" />
          {language === 'ar' ? 'استلام بضائع جديد' : 'New Goods Receipt'}
        </h1>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'معلومات الاستلام' : 'Receipt Info'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'ar' ? 'أمر الشراء' : 'Purchase Order'}</Label>
                  <Select value={selectedPO} onValueChange={handlePOSelect}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر PO' : 'Select PO'} /></SelectTrigger>
                    <SelectContent>
                      {receivablePOs.map(po => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.po_number} — {po.vendor?.name || 'N/A'} ({po.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'ar' ? 'المستودع' : 'Warehouse'}</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختياري' : 'Optional'} /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {selectedPOData && lines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'بنود الاستلام' : 'Receipt Lines'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'مطلوب' : 'Ordered'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'مستلم سابقاً' : 'Prev Rcvd'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'مستلم' : 'Received'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'مقبول' : 'Accepted'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'مرفوض' : 'Rejected'}</TableHead>
                        <TableHead>{language === 'ar' ? 'سبب الرفض' : 'Reject Reason'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, idx) => {
                        const remaining = line.quantity_ordered - line.quantity_already_received;
                        return (
                          <TableRow key={line.po_line_id}>
                            <TableCell className="font-medium">{line.item_name}</TableCell>
                            <TableCell className="text-center">{line.quantity_ordered} {line.unit}</TableCell>
                            <TableCell className="text-center">{line.quantity_already_received}</TableCell>
                            <TableCell>
                              <Input
                                type="number" min={0} max={remaining}
                                value={line.quantity_received}
                                onChange={(e) => updateLine(idx, 'quantity_received', parseFloat(e.target.value) || 0)}
                                className="w-20 text-center mx-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number" min={0} max={line.quantity_received}
                                value={line.quantity_accepted}
                                onChange={(e) => updateLine(idx, 'quantity_accepted', parseFloat(e.target.value) || 0)}
                                className="w-20 text-center mx-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number" min={0} max={line.quantity_received}
                                value={line.quantity_rejected}
                                onChange={(e) => updateLine(idx, 'quantity_rejected', parseFloat(e.target.value) || 0)}
                                className="w-20 text-center mx-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={line.rejection_reason}
                                onChange={(e) => updateLine(idx, 'rejection_reason', e.target.value)}
                                placeholder={line.quantity_rejected > 0 ? (language === 'ar' ? 'السبب...' : 'Reason...') : ''}
                                disabled={line.quantity_rejected === 0}
                                className="w-40"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/erp/receipts')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={saving || !selectedPO || lines.every(l => l.quantity_received === 0)}>
              <Save className="w-4 h-4 mr-2" />{saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ كمسودة' : 'Save as Draft')}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GoodsReceiptNewPage;
