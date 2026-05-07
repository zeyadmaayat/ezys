import { useState } from 'react';
import { SalesLayout } from '@/components/sales/SalesLayout';
import { useQuotations } from '@/hooks/useQuotations';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, FileText, Package } from 'lucide-react';
import { format } from 'date-fns';
import type { QuotationStatus } from '@/types/sales';
import { useActionGuard, type GuardCheck } from '@/hooks/useActionGuard';
import { GuardDialog } from '@/components/guard/GuardDialog';
import { GuardBadge } from '@/components/guard/GuardBadge';

const statusColors: Record<QuotationStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/10 text-blue-600',
  confirmed: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

interface QuoteLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function QuotationsPage() {
  const { language } = useLanguage();
  const { quotations, loading, createQuotation, updateQuotation, deleteQuotation } = useQuotations();
  const { clients } = useClients();
  const { products } = useProducts();
  const { guard, dialogProps } = useActionGuard();

  const newQuoteChecks: GuardCheck[] = [
    { kind: 'prerequisite', condition: clients.length === 0,
      titleAr: 'لا يوجد عملاء', titleEn: 'No clients',
      messageAr: 'يجب إضافة عميل قبل إنشاء عرض سعر.',
      messageEn: 'Add a client before creating a quotation.',
      actionTo: '/saas/clients', actionLabelAr: 'إضافة عميل', actionLabelEn: 'Add client' },
    { kind: 'prerequisite', condition: products.length === 0,
      titleAr: 'لا توجد منتجات', titleEn: 'No products',
      messageAr: 'يجب إضافة منتجات في الكتالوج قبل إنشاء عرض.',
      messageEn: 'Add products to the catalog before creating a quotation.',
      actionTo: '/sales/products', actionLabelAr: 'إضافة منتج', actionLabelEn: 'Add product' },
  ];
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client_id: '', notes: '' });
  const [lines, setLines] = useState<QuoteLine[]>([]);

  const filtered = quotations.filter(q =>
    !search || q.quotation_number.toLowerCase().includes(search.toLowerCase())
  );

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = lines.find(l => l.product_id === productId);
    if (existing) {
      setLines(lines.map(l => l.product_id === productId
        ? { ...l, quantity: l.quantity + 1, total: (l.quantity + 1) * l.unit_price }
        : l
      ));
    } else {
      setLines([...lines, {
        product_id: productId,
        name: product.name,
        quantity: 1,
        unit_price: product.price_jd + (product.sim_price_jd || 0),
        total: product.price_jd + (product.sim_price_jd || 0),
      }]);
    }
  };

  const removeLine = (productId: string) => {
    setLines(lines.filter(l => l.product_id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    setLines(lines.map(l => l.product_id === productId
      ? { ...l, quantity: qty, total: qty * l.unit_price }
      : l
    ));
  };

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCreate = async () => {
    const result = await createQuotation({
      client_id: form.client_id || undefined,
      notes: form.notes || undefined,
      subtotal,
      tax_amount: tax,
      total_amount: total,
    });
    if (result) {
      setForm({ client_id: '', notes: '' });
      setLines([]);
      setDialogOpen(false);
    }
  };

  return (
    <SalesLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'عروض الأسعار' : 'Quotations'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'إنشاء وإدارة عروض الأسعار' : 'Create and manage sales quotations'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={(e) => {
                e.preventDefault();
                guard([
                  { kind: 'prerequisite', condition: clients.length === 0,
                    titleAr: 'لا يوجد عملاء', titleEn: 'No clients',
                    messageAr: 'يجب إضافة عميل قبل إنشاء عرض سعر.',
                    messageEn: 'Add a client before creating a quotation.',
                    actionTo: '/saas/clients', actionLabelAr: 'إضافة عميل', actionLabelEn: 'Add client' },
                  { kind: 'prerequisite', condition: products.length === 0,
                    titleAr: 'لا توجد منتجات', titleEn: 'No products',
                    messageAr: 'يجب إضافة منتجات في الكتالوج قبل إنشاء عرض.',
                    messageEn: 'Add products to the catalog before creating a quotation.',
                    actionTo: '/sales/products', actionLabelAr: 'إضافة منتج', actionLabelEn: 'Add product' },
                ], () => setDialogOpen(true));
              }}><Plus className="w-4 h-4 mr-1" /> {language === 'ar' ? 'عرض جديد' : 'New Quotation'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{language === 'ar' ? 'إنشاء عرض سعر' : 'Create Quotation'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select Client'} /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Product selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {language === 'ar' ? 'أضف منتج' : 'Add Product'}
                  </label>
                  <Select onValueChange={addProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر منتج من الكتالوج...' : 'Select from product catalog...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                            {p.name} — {p.category} — {(p.price_jd + (p.sim_price_jd || 0)).toFixed(2)} JD
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lines */}
                {lines.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                          <TableHead className="text-xs w-20">{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                          <TableHead className="text-xs">{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                          <TableHead className="text-xs">{language === 'ar' ? 'الإجمالي' : 'Total'}</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map(l => (
                          <TableRow key={l.product_id}>
                            <TableCell className="text-sm">{l.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                value={l.quantity}
                                onChange={e => updateQuantity(l.product_id, Math.max(1, Number(e.target.value)))}
                                className="h-7 w-16 text-sm"
                              />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{l.unit_price.toFixed(2)}</TableCell>
                            <TableCell className="text-sm font-medium">{l.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeLine(l.product_id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="border-t border-border p-3 space-y-1 bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span>{subtotal.toFixed(2)} JD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{language === 'ar' ? 'ضريبة 16%' : 'Tax 16%'}</span>
                        <span>{tax.toFixed(2)} JD</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-foreground">
                        <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                        <span>{total.toFixed(2)} JD</span>
                      </div>
                    </div>
                  </div>
                )}

                <Textarea placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <Button className="w-full" onClick={handleCreate} disabled={lines.length === 0}>
                  {language === 'ar' ? 'إنشاء عرض السعر' : 'Create Quotation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الرقم' : 'Number'}</TableHead>
                  <TableHead>{language === 'ar' ? 'العميل' : 'Client'}</TableHead>
                  <TableHead>{language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد عروض' : 'No quotations'}</TableCell></TableRow>
                ) : filtered.map(q => {
                  const client = clients.find(c => c.id === q.client_id);
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {q.quotation_number}
                        </div>
                      </TableCell>
                      <TableCell>{client?.name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(q.issue_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="font-medium">{q.total_amount.toLocaleString()} {q.currency}</TableCell>
                      <TableCell>
                        <Select value={q.status} onValueChange={v => updateQuotation(q.id, { status: v as QuotationStatus })}>
                          <SelectTrigger className={`h-7 text-xs w-28 ${statusColors[q.status as QuotationStatus]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteQuotation(q.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <GuardDialog {...dialogProps} />
      </div>
    </SalesLayout>
  );
}
