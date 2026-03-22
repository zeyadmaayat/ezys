import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRequisitions } from '@/hooks/useRequisitions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useItems } from '@/hooks/useItems';
import { useClients } from '@/hooks/useClients';
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
import { Plus, Search, FileText, ArrowRight, X, Send, CheckCircle, XCircle, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { RequisitionStatus } from '@/types/procurement';

const statusColors: Record<RequisitionStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Submitted: 'bg-secondary/20 text-secondary-foreground',
  Approved: 'bg-primary/15 text-primary',
  Rejected: 'bg-destructive/10 text-destructive',
  Converted: 'bg-accent text-accent-foreground border border-primary/30',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-muted text-muted-foreground',
  Normal: 'bg-secondary/20 text-secondary-foreground',
  High: 'bg-destructive/10 text-destructive',
  Urgent: 'bg-destructive/20 text-destructive font-semibold',
};

const RequisitionsPage = () => {
  const { language } = useLanguage();
  const { requisitions, loading, createRequisition, updateStatus } = useRequisitions();
  const { createPO } = usePurchaseOrders();
  const { items } = useItems();
  const { clients } = useClients();
  const vendors = clients.filter(c => c.type === 'VENDOR');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertReqId, setConvertReqId] = useState<string | null>(null);
  const [convertVendorId, setConvertVendorId] = useState('');
  const [convertPaymentTerms, setConvertPaymentTerms] = useState('');
  const [convertDeliveryDate, setConvertDeliveryDate] = useState('');
  const [converting, setConverting] = useState(false);
  const [formData, setFormData] = useState({ priority: 'Normal', required_date: '', notes: '' });
  const [lines, setLines] = useState<{ item_id: string; item_name: string; quantity: number; unit: string; estimated_unit_price: number; notes: null }[]>([]);
  const [newLine, setNewLine] = useState({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', estimated_unit_price: 0 });

  const filtered = requisitions.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.requisition_number.toLowerCase().includes(q) ||
      r.priority.toLowerCase().includes(q) ||
      (r.notes || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const convertReq = convertReqId ? requisitions.find(r => r.id === convertReqId) : null;

  const handleExportCSV = () => {
    exportToCSV(filtered, [
      { key: 'requisition_number', header: 'REQ #' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'required_date', header: 'Required Date', format: (v) => v ? String(v) : '' },
      { key: 'created_at', header: 'Created', format: (v) => new Date(String(v)).toLocaleDateString() },
    ], 'PR_Export');
  };

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) setNewLine({ item_id: itemId, item_name: item.name, quantity: 1, unit: item.unit, estimated_unit_price: 0 });
  };

  const addLine = () => {
    if (!newLine.item_name) return;
    setLines([...lines, { ...newLine, notes: null }]);
    setNewLine({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', estimated_unit_price: 0 });
  };

  const handleSubmit = async () => {
    await createRequisition(formData, lines);
    setIsDialogOpen(false);
    setFormData({ priority: 'Normal', required_date: '', notes: '' });
    setLines([]);
  };

  if (loading) {
    return <ErpLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></ErpLayout>;
  }

  const kpiStatuses: (RequisitionStatus | 'All')[] = ['All', 'Draft', 'Submitted', 'Approved', 'Converted'];

  return (
    <ErpLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'طلبات الشراء (PR)' : 'Purchase Requisitions'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة طلبات الشراء الداخلية' : 'Manage internal purchase requests'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'طلب جديد' : 'New Requisition'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'طلب شراء جديد' : 'New Purchase Requisition'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'التاريخ المطلوب' : 'Required Date'}</Label>
                      <Input type="date" value={formData.required_date} onChange={(e) => setFormData({ ...formData, required_date: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">{language === 'ar' ? 'المنتجات' : 'Items'}</Label>
                    {lines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded mb-2">
                        <span className="flex-1 text-sm">{line.item_name}</span>
                        <span className="text-sm text-muted-foreground">{line.quantity} {line.unit}</span>
                        <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Select value={newLine.item_id} onValueChange={handleItemSelect}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder={language === 'ar' ? 'اختر منتج' : 'Select item'} /></SelectTrigger>
                        <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={newLine.quantity} onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })} className="w-20" min={1} />
                      <Button variant="outline" onClick={addLine} disabled={!newLine.item_name}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button onClick={handleSubmit}>{language === 'ar' ? 'إنشاء' : 'Create'}</Button>
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
                  {s === 'All' ? (language === 'ar' ? 'الكل' : 'All') : s}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <p className="text-2xl font-bold text-foreground">
                  {s === 'All' ? requisitions.length : requisitions.filter(r => r.status === s).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث بـ REQ #...' : 'Search by REQ #...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                <TableHead>{language === 'ar' ? 'الرقم' : 'REQ #'}</TableHead>
                <TableHead>{language === 'ar' ? 'الأولوية' : 'Priority'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'المنتجات' : 'Items'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ المطلوب' : 'Required Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Created'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{language === 'ar' ? 'لا توجد طلبات' : 'No requisitions found'}</TableCell></TableRow>
              ) : filtered.map(req => (
                <TableRow key={req.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-semibold text-primary">{req.requisition_number}</TableCell>
                  <TableCell><Badge className={priorityColors[req.priority]}>{req.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[req.status]}>{req.status}</Badge></TableCell>
                  <TableCell className="text-center">{req.lines?.length || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{req.required_date ? new Date(req.required_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {req.status === 'Draft' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(req.id, 'Submitted')}>
                          <Send className="w-4 h-4 mr-1" />{language === 'ar' ? 'إرسال' : 'Submit'}
                        </Button>
                      )}
                      {req.status === 'Submitted' && (
                        <>
                          <Button variant="default" size="sm" onClick={() => updateStatus(req.id, 'Approved')}>
                            <CheckCircle className="w-4 h-4 mr-1" />{language === 'ar' ? 'موافقة' : 'Approve'}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => updateStatus(req.id, 'Rejected')}>
                            <XCircle className="w-4 h-4 mr-1" />{language === 'ar' ? 'رفض' : 'Reject'}
                          </Button>
                        </>
                      )}
                      {req.status === 'Approved' && (
                        <Button variant="default" size="sm" onClick={() => {
                          setConvertReqId(req.id);
                          setConvertVendorId('');
                          setConvertPaymentTerms('');
                          setConvertDeliveryDate('');
                          setIsConvertOpen(true);
                        }}>
                          <ArrowRight className="w-4 h-4 mr-1" />{language === 'ar' ? 'تحويل لـ PO' : 'Convert to PO'}
                        </Button>
                      )}
                      <InternalMessagesPanel entityType="requisition" entityId={req.id} entityLabel={req.requisition_number} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Convert to PO Dialog — Enhanced */}
        <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'تحويل طلب الشراء إلى PO' : 'Convert Requisition to PO'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Preview lines */}
              {convertReq && convertReq.lines && convertReq.lines.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {language === 'ar' ? 'البنود التي ستُنقل:' : 'Lines to transfer:'}
                  </p>
                  {convertReq.lines.map((l, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium">{l.item_name}</span>
                      <span className="text-muted-foreground">{l.quantity} {l.unit}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label>{language === 'ar' ? 'المورد' : 'Vendor'} <span className="text-muted-foreground text-xs">{language === 'ar' ? '(اختياري)' : '(optional)'}</span></Label>
                <Select value={convertVendorId} onValueChange={setConvertVendorId}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر مورد' : 'Select vendor'} /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{language === 'ar' ? 'تاريخ التسليم' : 'Delivery Date'}</Label>
                  <Input type="date" value={convertDeliveryDate} onChange={(e) => setConvertDeliveryDate(e.target.value)} />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</Label>
                  <Input value={convertPaymentTerms} onChange={(e) => setConvertPaymentTerms(e.target.value)} placeholder="Net 30" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsConvertOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button
                  disabled={converting}
                  onClick={async () => {
                    if (!convertReqId) return;
                    setConverting(true);
                    const req = requisitions.find(r => r.id === convertReqId);
                    if (!req) { setConverting(false); return; }
                    const poLines = (req.lines || []).map((l, idx) => ({
                      line_number: idx + 1,
                      item_id: l.item_id,
                      item_name: l.item_name,
                      quantity: l.quantity,
                      received_quantity: 0,
                      unit: l.unit,
                      unit_price: l.estimated_unit_price || 0,
                      notes: l.notes,
                    }));
                    const result = await createPO(
                      {
                        vendor_id: convertVendorId || undefined,
                        requisition_id: convertReqId,
                        payment_terms: convertPaymentTerms || undefined,
                        delivery_date: convertDeliveryDate || undefined,
                      },
                      poLines
                    );
                    if (result) {
                      await updateStatus(convertReqId, 'Converted');
                    }
                    setConverting(false);
                    setIsConvertOpen(false);
                  }}
                >
                  {converting
                    ? (language === 'ar' ? 'جاري التحويل...' : 'Converting...')
                    : (language === 'ar' ? 'تحويل وإنشاء PO' : 'Convert & Create PO')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErpLayout>
  );
};

export default RequisitionsPage;
