import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useClients } from '@/hooks/useClients';
import { useItems } from '@/hooks/useItems';
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
import { Plus, Search, ShoppingCart, X, Send, CheckCircle, Package, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { POStatus, POLine } from '@/types/procurement';

const statusColors: Record<POStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Sent: 'bg-secondary/20 text-secondary-foreground',
  Acknowledged: 'bg-primary/10 text-primary',
  Partially_Received: 'bg-accent text-accent-foreground border border-border',
  Received: 'bg-primary/15 text-primary',
  Closed: 'bg-muted text-muted-foreground',
  Cancelled: 'bg-destructive/10 text-destructive',
};

const PurchaseOrdersPage = () => {
  const { language } = useLanguage();
  const { purchaseOrders, loading, createPO, updateStatus } = usePurchaseOrders();
  const { clients } = useClients();
  const { items } = useItems();
  const vendors = clients.filter(c => c.type === 'VENDOR');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ vendor_id: '', payment_terms: '', delivery_date: '', currency: 'SAR', notes: '' });
  const [poLines, setPOLines] = useState<Omit<POLine, 'id' | 'po_id' | 'created_at'>[]>([]);
  const [newLine, setNewLine] = useState({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', unit_price: 0, line_number: 1, received_quantity: 0, notes: null as string | null });

  const filtered = purchaseOrders.filter(po => {
    const matchesSearch =
      po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    exportToCSV(filtered, [
      { key: 'po_number', header: 'PO #' },
      { key: 'vendor', header: 'Vendor', format: (_, r) => r.vendor?.name || '' },
      { key: 'status', header: 'Status' },
      { key: 'total_amount', header: 'Amount', format: (v) => String(v) },
      { key: 'currency', header: 'Currency' },
      { key: 'delivery_date', header: 'Delivery Date', format: (v) => v ? String(v) : '' },
      { key: 'created_at', header: 'Created', format: (v) => new Date(String(v)).toLocaleDateString() },
    ], 'PO_Export');
  };

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) setNewLine({ ...newLine, item_id: itemId, item_name: item.name, unit: item.unit });
  };

  const addLine = () => {
    if (!newLine.item_name) return;
    setPOLines([...poLines, { ...newLine, line_number: poLines.length + 1 }]);
    setNewLine({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', unit_price: 0, line_number: 1, received_quantity: 0, notes: null });
  };

  const handleSubmit = async () => {
    await createPO(formData, poLines);
    setIsDialogOpen(false);
    setFormData({ vendor_id: '', payment_terms: '', delivery_date: '', currency: 'SAR', notes: '' });
    setPOLines([]);
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></MainLayout>;
  }

  const kpiStatuses: (POStatus | 'All')[] = ['All', 'Draft', 'Sent', 'Partially_Received', 'Received'];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'أوامر الشراء (PO)' : 'Purchase Orders'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة أوامر الشراء للموردين' : 'Manage vendor purchase orders'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'أمر شراء جديد' : 'New PO'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'أمر شراء جديد' : 'New Purchase Order'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{language === 'ar' ? 'المورد' : 'Vendor'}</Label>
                    <Select value={formData.vendor_id} onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}>
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المورد' : 'Select vendor'} /></SelectTrigger>
                      <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'تاريخ التسليم' : 'Delivery Date'}</Label>
                      <Input type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</Label>
                      <Input value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} placeholder="Net 30" />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">{language === 'ar' ? 'البنود' : 'Lines'}</Label>
                    {poLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded mb-2">
                        <span className="text-xs text-muted-foreground">#{line.line_number}</span>
                        <span className="flex-1">{line.item_name}</span>
                        <span className="text-sm">{line.quantity} × {line.unit_price} {formData.currency}</span>
                        <Button variant="ghost" size="icon" onClick={() => setPOLines(poLines.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Select value={newLine.item_id} onValueChange={handleItemSelect}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder={language === 'ar' ? 'اختر منتج' : 'Select item'} /></SelectTrigger>
                        <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={newLine.quantity} onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })} className="w-16" min={1} />
                      <Input type="number" value={newLine.unit_price} onChange={(e) => setNewLine({ ...newLine, unit_price: parseFloat(e.target.value) || 0 })} className="w-24" placeholder="Price" />
                      <Button variant="outline" onClick={addLine} disabled={!newLine.item_name}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  {poLines.length > 0 && (
                    <div className="text-right font-bold text-lg border-t border-border pt-2">
                      {language === 'ar' ? 'الإجمالي:' : 'Total:'} {poLines.reduce((s, l) => s + l.quantity * l.unit_price, 0).toFixed(2)} {formData.currency}
                    </div>
                  )}
                  <div>
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button onClick={handleSubmit}>{language === 'ar' ? 'إنشاء' : 'Create PO'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards — clickable filters */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {kpiStatuses.map(s => (
            <Card
              key={s}
              className={`cursor-pointer transition-all border-2 ${statusFilter === s ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
              onClick={() => setStatusFilter(s)}
            >
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                  {s === 'All' ? (language === 'ar' ? 'الكل' : 'All') : s.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold text-foreground">
                  {s === 'All' ? purchaseOrders.length : purchaseOrders.filter(po => po.status === s).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث بـ PO أو المورد...' : 'Search by PO # or vendor...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                <TableHead>{language === 'ar' ? 'رقم PO' : 'PO #'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'البنود' : 'Lines'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{language === 'ar' ? 'لا توجد أوامر شراء' : 'No purchase orders found'}</TableCell></TableRow>
              ) : filtered.map(po => (
                <TableRow key={po.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-semibold text-primary">{po.po_number}</TableCell>
                  <TableCell className="font-medium">{po.vendor?.name || '—'}</TableCell>
                  <TableCell><Badge className={statusColors[po.status]}>{po.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="font-mono">{po.total_amount.toFixed(2)} {po.currency}</TableCell>
                  <TableCell className="text-center">{po.po_lines?.length || 0}</TableCell>
                  <TableCell className="text-sm">{new Date(po.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {po.status === 'Draft' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(po.id, 'Sent')}>
                          <Send className="w-4 h-4 mr-1" />{language === 'ar' ? 'إرسال' : 'Send'}
                        </Button>
                      )}
                      {po.status === 'Sent' && (
                        <Button variant="default" size="sm" onClick={() => updateStatus(po.id, 'Acknowledged')}>
                          <CheckCircle className="w-4 h-4 mr-1" />{language === 'ar' ? 'تأكيد' : 'Acknowledge'}
                        </Button>
                      )}
                      {(po.status === 'Acknowledged' || po.status === 'Partially_Received') && (
                        <Button variant="default" size="sm" onClick={() => updateStatus(po.id, 'Received')}>
                          <Package className="w-4 h-4 mr-1" />{language === 'ar' ? 'استلام' : 'Received'}
                        </Button>
                      )}
                      <InternalMessagesPanel entityType="po" entityId={po.id} entityLabel={po.po_number} />
                    </div>
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

export default PurchaseOrdersPage;
