import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRequisitions } from '@/hooks/useRequisitions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useItems } from '@/hooks/useItems';
import { useClients } from '@/hooks/useClients';
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
import { Plus, Search, FileText, ArrowRight, X, Send, CheckCircle, XCircle } from 'lucide-react';
import type { RequisitionStatus } from '@/types/procurement';

const statusColors: Record<RequisitionStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Submitted: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-destructive/10 text-destructive',
  Converted: 'bg-purple-100 text-purple-700',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-muted text-muted-foreground',
  Normal: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const RequisitionsPage = () => {
  const { language } = useLanguage();
  const { requisitions, loading, createRequisition, updateStatus } = useRequisitions();
  const { createPO } = usePurchaseOrders();
  const { items } = useItems();
  const { clients } = useClients();
  const vendors = clients.filter(c => c.type === 'VENDOR');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertReqId, setConvertReqId] = useState<string | null>(null);
  const [convertVendorId, setConvertVendorId] = useState('');
  const [converting, setConverting] = useState(false);
  const [formData, setFormData] = useState({ priority: 'Normal', required_date: '', notes: '' });
  const [lines, setLines] = useState<{ item_id: string; item_name: string; quantity: number; unit: string; estimated_unit_price: number; notes: null }[]>([]);
  const [newLine, setNewLine] = useState({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', estimated_unit_price: 0 });

  const filtered = requisitions.filter(r =>
    r.requisition_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    return <MainLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
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
                      <span className="flex-1">{line.item_name}</span>
                      <span>{line.quantity} {line.unit}</span>
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(['Draft', 'Submitted', 'Approved', 'Rejected', 'Converted'] as RequisitionStatus[]).map(s => (
            <Card key={s}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{requisitions.filter(r => r.status === s).length}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'الرقم' : 'REQ #'}</TableHead>
                <TableHead>{language === 'ar' ? 'الأولوية' : 'Priority'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'المنتجات' : 'Items'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد طلبات' : 'No requisitions found'}</TableCell></TableRow>
              ) : filtered.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-medium">{req.requisition_number}</TableCell>
                  <TableCell><Badge className={priorityColors[req.priority]}>{req.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[req.status]}>{req.status}</Badge></TableCell>
                  <TableCell>{req.lines?.length || 0} items</TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
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
                        <Button variant="default" size="sm" onClick={() => { setConvertReqId(req.id); setConvertVendorId(''); setIsConvertOpen(true); }}>
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

        {/* Convert to PO Dialog */}
        <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'تحويل طلب الشراء إلى PO' : 'Convert Requisition to PO'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{language === 'ar' ? 'المورد (اختياري)' : 'Vendor (optional)'}</Label>
                <Select value={convertVendorId} onValueChange={setConvertVendorId}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر مورد' : 'Select vendor'} /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'سيتم نقل جميع بنود طلب الشراء إلى أمر شراء جديد.' : 'All requisition lines will be transferred to a new PO.'}
              </p>
              <div className="flex justify-end gap-2">
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
                      { vendor_id: convertVendorId || undefined, requisition_id: convertReqId },
                      poLines
                    );
                    if (result) {
                      await updateStatus(convertReqId, 'Converted');
                    }
                    setConverting(false);
                    setIsConvertOpen(false);
                  }}
                >
                  {converting ? (language === 'ar' ? 'جاري التحويل...' : 'Converting...') : (language === 'ar' ? 'تحويل' : 'Convert')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default RequisitionsPage;
