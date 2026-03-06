import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlanketOrders } from '@/hooks/useBlanketOrders';
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
import { Plus, Search, RefreshCw, X, Pause, Play, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { BlanketStatus, BlanketOrderLine } from '@/types/procurement';

const statusColors: Record<BlanketStatus, string> = {
  Active: 'bg-primary/15 text-primary',
  Paused: 'bg-accent text-accent-foreground border border-border',
  Expired: 'bg-muted text-muted-foreground',
  Cancelled: 'bg-destructive/10 text-destructive',
};

const BlanketOrdersPage = () => {
  const { language } = useLanguage();
  const { blanketOrders, loading, createBlanket, updateStatus } = useBlanketOrders();
  const { clients } = useClients();
  const { items } = useItems();
  const vendors = clients.filter(c => c.type === 'VENDOR');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlanketStatus | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vendor_id: '', start_date: '', end_date: '', release_frequency_months: 6,
    currency: 'SAR', total_contract_value: 0, notes: '',
  });
  const [lines, setLines] = useState<Omit<BlanketOrderLine, 'id' | 'blanket_order_id' | 'created_at' | 'total_released'>[]>([]);
  const [newLine, setNewLine] = useState({ item_id: '', item_name: '', quantity_per_release: 1, unit: 'pcs', unit_price: 0, notes: null as string | null });

  const filtered = blanketOrders.filter(b => {
    const matchesSearch =
      b.blanket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) setNewLine({ ...newLine, item_id: itemId, item_name: item.name, unit: item.unit });
  };

  const addLine = () => {
    if (!newLine.item_name) return;
    setLines([...lines, { ...newLine }]);
    setNewLine({ item_id: '', item_name: '', quantity_per_release: 1, unit: 'pcs', unit_price: 0, notes: null });
  };

  const handleSubmit = async () => {
    await createBlanket(formData, lines);
    setIsDialogOpen(false);
    setFormData({ vendor_id: '', start_date: '', end_date: '', release_frequency_months: 6, currency: 'SAR', total_contract_value: 0, notes: '' });
    setLines([]);
  };

  const handleExportCSV = () => {
    exportToCSV(filtered, [
      { key: 'blanket_number', header: 'BLK #' },
      { key: 'vendor', header: 'Vendor', format: (_, r) => r.vendor?.name || '' },
      { key: 'status', header: 'Status' },
      { key: 'start_date', header: 'Start' },
      { key: 'end_date', header: 'End' },
      { key: 'total_contract_value', header: 'Value', format: (v) => String(v) },
      { key: 'currency', header: 'Currency' },
    ], 'BLK_Export');
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></MainLayout>;
  }

  const kpiStatuses: (BlanketStatus | 'All')[] = ['All', 'Active', 'Paused', 'Expired', 'Cancelled'];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'عقود التوريد المتكررة' : 'Blanket Orders'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة عقود التوريد الدورية' : 'Manage recurring supply contracts'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{language === 'ar' ? 'عقد جديد' : 'New Contract'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'عقد توريد جديد' : 'New Blanket Order'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{language === 'ar' ? 'المورد' : 'Vendor'}</Label>
                    <Select value={formData.vendor_id} onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}>
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المورد' : 'Select vendor'} /></SelectTrigger>
                      <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
                      <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label>
                      <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'التكرار (شهور)' : 'Frequency (months)'}</Label>
                      <Input type="number" value={formData.release_frequency_months} onChange={(e) => setFormData({ ...formData, release_frequency_months: parseInt(e.target.value) || 6 })} min={1} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'قيمة العقد' : 'Contract Value'}</Label>
                      <Input type="number" value={formData.total_contract_value} onChange={(e) => setFormData({ ...formData, total_contract_value: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                      <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['SAR', 'USD', 'EUR', 'AED'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">{language === 'ar' ? 'المنتجات لكل دفعة' : 'Items per Release'}</Label>
                    {lines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded mb-2">
                        <span className="flex-1">{line.item_name}</span>
                        <span>{line.quantity_per_release} {line.unit} × {line.unit_price}</span>
                        <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Select value={newLine.item_id} onValueChange={handleItemSelect}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder={language === 'ar' ? 'اختر منتج' : 'Select item'} /></SelectTrigger>
                        <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={newLine.quantity_per_release} onChange={(e) => setNewLine({ ...newLine, quantity_per_release: parseInt(e.target.value) || 1 })} className="w-16" min={1} />
                      <Input type="number" value={newLine.unit_price} onChange={(e) => setNewLine({ ...newLine, unit_price: parseFloat(e.target.value) || 0 })} className="w-24" placeholder="Price" />
                      <Button variant="outline" onClick={addLine} disabled={!newLine.item_name}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button onClick={handleSubmit}>{language === 'ar' ? 'إنشاء العقد' : 'Create Contract'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards — clickable filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {kpiStatuses.map(s => {
            const count = s === 'All' ? blanketOrders.length : blanketOrders.filter(b => b.status === s).length;
            const value = s === 'All'
              ? blanketOrders.reduce((sum, b) => sum + b.total_contract_value, 0)
              : blanketOrders.filter(b => b.status === s).reduce((sum, b) => sum + b.total_contract_value, 0);
            return (
              <Card
                key={s}
                className={`cursor-pointer transition-all border-2 ${statusFilter === s ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/40'}`}
                onClick={() => setStatusFilter(s)}
              >
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    {s === 'All' ? (language === 'ar' ? 'الكل' : 'All') : s}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{value.toLocaleString()} SAR</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {language === 'ar' ? 'نتيجة' : 'results'}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {language === 'ar' ? 'الإجمالي:' : 'Total:'} {filtered.reduce((s, b) => s + b.total_contract_value, 0).toLocaleString()} SAR
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>{language === 'ar' ? 'الرقم' : 'BLK #'}</TableHead>
                <TableHead>{language === 'ar' ? 'المورد' : 'Vendor'}</TableHead>
                <TableHead>{language === 'ar' ? 'الفترة' : 'Period'}</TableHead>
                <TableHead>{language === 'ar' ? 'التكرار' : 'Frequency'}</TableHead>
                <TableHead>{language === 'ar' ? 'القيمة' : 'Value'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد عقود' : 'No blanket orders'}</TableCell></TableRow>
              ) : filtered.map(b => {
                const isExpanded = expandedId === b.id;
                const bLines = b.blanket_order_lines || [];
                const releases = b.blanket_releases || [];
                return (
                  <>
                    <TableRow key={b.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                      <TableCell className="pr-0">
                        {(bLines.length > 0 || releases.length > 0) ? (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-primary">{b.blanket_number}</TableCell>
                      <TableCell className="font-medium">{b.vendor?.name || '—'}</TableCell>
                      <TableCell className="text-sm">{b.start_date} → {b.end_date}</TableCell>
                      <TableCell>{language === 'ar' ? `كل ${b.release_frequency_months} شهور` : `Every ${b.release_frequency_months} mo`}</TableCell>
                      <TableCell className="font-mono">{b.total_contract_value.toLocaleString()} {b.currency}</TableCell>
                      <TableCell><Badge className={statusColors[b.status]}>{b.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {b.status === 'Active' && (
                            <Button variant="outline" size="sm" onClick={() => updateStatus(b.id, 'Paused')}>
                              <Pause className="w-4 h-4 mr-1" />{language === 'ar' ? 'إيقاف' : 'Pause'}
                            </Button>
                          )}
                          {b.status === 'Paused' && (
                            <Button variant="outline" size="sm" onClick={() => updateStatus(b.id, 'Active')}>
                              <Play className="w-4 h-4 mr-1" />{language === 'ar' ? 'تفعيل' : 'Resume'}
                            </Button>
                          )}
                          <InternalMessagesPanel entityType="blanket_order" entityId={b.id} entityLabel={b.blanket_number} />
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (bLines.length > 0 || releases.length > 0) && (
                      <TableRow key={`${b.id}-detail`}>
                        <TableCell colSpan={8} className="p-0 border-b-2 border-primary/20">
                          <div className="bg-muted/20 px-8 py-4 space-y-4">
                            {bLines.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  {language === 'ar' ? 'بنود العقد' : 'Contract Lines'}
                                </p>
                                <div className="grid gap-2">
                                  {bLines.map((line) => (
                                    <div key={line.id} className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border/50">
                                      <span className="flex-1 font-medium text-sm">{line.item_name}</span>
                                      <span className="text-sm text-muted-foreground">{line.quantity_per_release} {line.unit} / {language === 'ar' ? 'دفعة' : 'release'}</span>
                                      <span className="text-sm font-mono">{line.unit_price.toLocaleString()} {b.currency}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {language === 'ar' ? 'تم إطلاق' : 'Released:'} {line.total_released}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {releases.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  {language === 'ar' ? 'الإصدارات' : 'Releases'}
                                </p>
                                <div className="grid gap-1">
                                  {releases.map((r) => (
                                    <div key={r.id} className="flex items-center gap-4 p-2 bg-card rounded border border-border/50 text-sm">
                                      <span className="font-mono text-muted-foreground">#{r.release_number}</span>
                                      <span>{r.release_date}</span>
                                      <Badge variant="outline" className="text-xs">{r.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BlanketOrdersPage;
