import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ErpLayout } from '@/components/erp/ErpLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRightLeft, ClipboardCheck, Bell, FileBox, Plus, Play, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useReorderRules, useInventoryTransfers, useCycleCount, useItemBatches } from '@/hooks/useInventoryAdvanced';
import { useItems } from '@/hooks/useItems';
import { useLocations } from '@/hooks/useLocations';

export default function InventoryAdvancedPage() {
  const { language } = useLanguage();
  const [tab, setTab] = useState('transfers');

  return (
    <ErpLayout>
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">{language === 'ar' ? 'عمليات المخزون المتقدمة' : 'Advanced Inventory Operations'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{language === 'ar' ? 'النقل، الجرد، إعادة الطلب، الدفعات' : 'Transfers, Cycle Count, Reorder, Batches'}</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-4">
            <TabsTrigger value="transfers"><ArrowRightLeft className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'النقل' : 'Transfers'}</TabsTrigger>
            <TabsTrigger value="cycle"><ClipboardCheck className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'الجرد' : 'Cycle Count'}</TabsTrigger>
            <TabsTrigger value="reorder"><Bell className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'إعادة الطلب' : 'Reorder'}</TabsTrigger>
            <TabsTrigger value="batches"><FileBox className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'الدفعات' : 'Batches'}</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers"><TransfersSection language={language} /></TabsContent>
          <TabsContent value="cycle"><CycleCountSection language={language} /></TabsContent>
          <TabsContent value="reorder"><ReorderSection language={language} /></TabsContent>
          <TabsContent value="batches"><BatchesSection language={language} /></TabsContent>
        </Tabs>
      </div>
    </ErpLayout>
  );
}

// ================ Transfers ================
function TransfersSection({ language }: { language: string }) {
  const { transfers, loading, createTransfer, executeTransfer } = useInventoryTransfers();
  const { items } = useItems(); const { locations } = useLocations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ from: '', to: '', item_id: '', qty: '', notes: '' });

  const submit = async () => {
    if (!form.from || !form.to || !form.item_id || !form.qty) return;
    const ok = await createTransfer({
      from_location_id: form.from, to_location_id: form.to,
      lines: [{ item_id: form.item_id, quantity: parseFloat(form.qty) }],
      notes: form.notes || undefined,
    });
    if (ok) { setOpen(false); setForm({ from: '', to: '', item_id: '', qty: '', notes: '' }); }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{language === 'ar' ? 'عمليات النقل بين المواقع' : 'Inter-location Transfers'}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'نقل جديد' : 'New Transfer'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{language === 'ar' ? 'نقل جديد' : 'New Transfer'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>{language === 'ar' ? 'من' : 'From'}</Label>
                <Select value={form.from} onValueChange={(v) => setForm({ ...form, from: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'ar' ? 'إلى' : 'To'}</Label>
                <Select value={form.to} onValueChange={(v) => setForm({ ...form, to: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{locations.filter(l => l.id !== form.from).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'ar' ? 'المنتج' : 'Item'}</Label>
                <Select value={form.item_id} onValueChange={(v) => setForm({ ...form, item_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'ar' ? 'الكمية' : 'Quantity'}</Label>
                <Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div><Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={submit} className="w-full" disabled={!form.from || !form.to || !form.item_id || !form.qty}>{language === 'ar' ? 'إنشاء' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>#</TableHead><TableHead>{language === 'ar' ? 'من' : 'From'}</TableHead>
            <TableHead>{language === 'ar' ? 'إلى' : 'To'}</TableHead>
            <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
            <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            <TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8">…</TableCell></TableRow>
            : transfers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد عمليات نقل' : 'No transfers'}</TableCell></TableRow>
            : transfers.map(t => (
              <TableRow key={t.id}>
                <TableCell><Badge variant="secondary" className="font-mono text-xs">{t.transfer_number}</Badge></TableCell>
                <TableCell>{t.from_location?.name || t.from_location_id.slice(0, 8)}</TableCell>
                <TableCell>{t.to_location?.name || t.to_location_id.slice(0, 8)}</TableCell>
                <TableCell className="text-xs">{t.transfer_date}</TableCell>
                <TableCell><Badge variant={t.status === 'Done' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
                <TableCell>{t.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => executeTransfer(t.id)}><Play className="w-3.5 h-3.5 mr-1" />{language === 'ar' ? 'تنفيذ' : 'Execute'}</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ================ Cycle Count ================
function CycleCountSection({ language }: { language: string }) {
  const { sessions, loading, createSession, closeSession } = useCycleCount();
  const { locations } = useLocations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ location_id: '', notes: '' });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{language === 'ar' ? 'جلسات الجرد الدوري' : 'Cycle Count Sessions'}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'جلسة جديدة' : 'New Session'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{language === 'ar' ? 'جلسة جرد' : 'New Cycle Count'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>{language === 'ar' ? 'الموقع' : 'Location'}</Label>
                <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <Button className="w-full" disabled={!form.location_id} onClick={async () => { await createSession(form.location_id, form.notes); setOpen(false); setForm({ location_id: '', notes: '' }); }}>{language === 'ar' ? 'بدء' : 'Start'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>#</TableHead><TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead><TableHead>{language === 'ar' ? 'البداية' : 'Started'}</TableHead><TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">…</TableCell></TableRow>
            : sessions.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد جلسات' : 'No sessions'}</TableCell></TableRow>
            : sessions.map(s => (
              <TableRow key={s.id}>
                <TableCell><Badge variant="secondary" className="font-mono text-xs">{s.session_number}</Badge></TableCell>
                <TableCell>{s.location?.name || '—'}</TableCell>
                <TableCell className="text-xs">{new Date(s.started_at).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant={s.status === 'Closed' ? 'default' : 'secondary'}>{s.status}</Badge></TableCell>
                <TableCell>{s.status !== 'Closed' && <Button size="sm" variant="outline" onClick={() => closeSession(s.id)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ================ Reorder Rules ================
function ReorderSection({ language }: { language: string }) {
  const { rules, loading, createRule, deleteRule } = useReorderRules();
  const { items } = useItems(); const { locations } = useLocations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ item_id: '', location_id: '', min: '', max: '', reorder: '' });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{language === 'ar' ? 'قواعد إعادة الطلب' : 'Reorder Rules'}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'قاعدة جديدة' : 'New Rule'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{language === 'ar' ? 'قاعدة إعادة طلب' : 'Reorder Rule'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>{language === 'ar' ? 'المنتج' : 'Item'}</Label>
                <Select value={form.item_id} onValueChange={(v) => setForm({ ...form, item_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'ar' ? 'الموقع (اختياري)' : 'Location (optional)'}</Label>
                <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'الكل' : 'All'} /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">{language === 'ar' ? 'الحد الأدنى' : 'Min'}</Label><Input type="number" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} /></div>
                <div><Label className="text-xs">{language === 'ar' ? 'الحد الأقصى' : 'Max'}</Label><Input type="number" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} /></div>
                <div><Label className="text-xs">{language === 'ar' ? 'كمية الطلب' : 'Reorder'}</Label><Input type="number" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} /></div>
              </div>
              <Button className="w-full" disabled={!form.item_id || !form.min} onClick={async () => {
                const ok = await createRule({ item_id: form.item_id, location_id: form.location_id || null, min_quantity: +form.min, max_quantity: +form.max, reorder_quantity: +form.reorder });
                if (ok) { setOpen(false); setForm({ item_id: '', location_id: '', min: '', max: '', reorder: '' }); }
              }}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead><TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>{language === 'ar' ? 'كمية الطلب' : 'Reorder Qty'}</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8">…</TableCell></TableRow>
            : rules.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />{language === 'ar' ? 'لا توجد قواعد. أضف قاعدة لتلقي تنبيهات.' : 'No rules yet. Create one to get alerts.'}</TableCell></TableRow>
            : rules.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.item?.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.location?.name || (language === 'ar' ? 'الكل' : 'All')}</TableCell>
                <TableCell className="tabular-nums">{r.min_quantity}</TableCell>
                <TableCell className="tabular-nums">{r.max_quantity}</TableCell>
                <TableCell className="tabular-nums">{r.reorder_quantity}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteRule(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ================ Batches ================
function BatchesSection({ language }: { language: string }) {
  const { batches, loading, createBatch } = useItemBatches();
  const { items } = useItems(); const { locations } = useLocations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ item_id: '', location_id: '', lot_number: '', expiry_date: '', quantity: '', unit_cost: '' });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isExpiringSoon = (d: string | null) => { if (!d) return false; const diff = (new Date(d).getTime() - today.getTime()) / 86400000; return diff >= 0 && diff <= 30; };
  const isExpired = (d: string | null) => d ? new Date(d) < today : false;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{language === 'ar' ? 'الدفعات وتواريخ الصلاحية' : 'Batches & Expiry'}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'دفعة جديدة' : 'New Batch'}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{language === 'ar' ? 'دفعة جديدة' : 'New Batch'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>{language === 'ar' ? 'المنتج' : 'Item'}</Label>
                <Select value={form.item_id} onValueChange={(v) => setForm({ ...form, item_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'ar' ? 'الموقع' : 'Location'}</Label>
                <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">{language === 'ar' ? 'رقم الدفعة' : 'Lot #'}</Label><Input value={form.lot_number} onChange={(e) => setForm({ ...form, lot_number: e.target.value })} /></div>
                <div><Label className="text-xs">{language === 'ar' ? 'تاريخ الصلاحية' : 'Expiry'}</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
                <div><Label className="text-xs">{language === 'ar' ? 'الكمية' : 'Qty'}</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                <div><Label className="text-xs">{language === 'ar' ? 'تكلفة الوحدة' : 'Unit Cost'}</Label><Input type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} /></div>
              </div>
              <Button className="w-full" disabled={!form.item_id || !form.location_id} onClick={async () => {
                const ok = await createBatch({ item_id: form.item_id, location_id: form.location_id, lot_number: form.lot_number || null, expiry_date: form.expiry_date || null, quantity: +form.quantity, unit_cost: +form.unit_cost });
                if (ok) { setOpen(false); setForm({ item_id: '', location_id: '', lot_number: '', expiry_date: '', quantity: '', unit_cost: '' }); }
              }}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead><TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead><TableHead>Lot</TableHead><TableHead>{language === 'ar' ? 'الصلاحية' : 'Expiry'}</TableHead><TableHead>{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">…</TableCell></TableRow>
            : batches.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد دفعات' : 'No batches'}</TableCell></TableRow>
            : batches.map(b => (
              <TableRow key={b.id} className={isExpired(b.expiry_date) ? 'bg-destructive/5' : isExpiringSoon(b.expiry_date) ? 'bg-amber-500/5' : ''}>
                <TableCell className="font-medium">{b.item?.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.location?.name}</TableCell>
                <TableCell className="font-mono text-xs">{b.lot_number || '—'}</TableCell>
                <TableCell className="text-xs">
                  {b.expiry_date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{b.expiry_date}
                      {isExpired(b.expiry_date) && <Badge variant="destructive" className="ml-1 text-[10px]">{language === 'ar' ? 'منتهي' : 'Expired'}</Badge>}
                      {!isExpired(b.expiry_date) && isExpiringSoon(b.expiry_date) && <Badge variant="secondary" className="ml-1 text-[10px] bg-amber-500/20 text-amber-700">{language === 'ar' ? 'قريباً' : 'Soon'}</Badge>}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="tabular-nums font-semibold">{b.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
