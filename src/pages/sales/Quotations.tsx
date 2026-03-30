import { useState } from 'react';
import { SalesLayout } from '@/components/sales/SalesLayout';
import { useQuotations } from '@/hooks/useQuotations';
import { useClients } from '@/hooks/useClients';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { QuotationStatus } from '@/types/sales';

const statusColors: Record<QuotationStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/10 text-blue-600',
  confirmed: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

export default function QuotationsPage() {
  const { language } = useLanguage();
  const { quotations, loading, createQuotation, updateQuotation, deleteQuotation } = useQuotations();
  const { clients } = useClients();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client_id: '', notes: '', subtotal: 0, tax_amount: 0 });

  const filtered = quotations.filter(q =>
    !search || q.quotation_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    const total = (form.subtotal || 0) + (form.tax_amount || 0);
    const result = await createQuotation({
      client_id: form.client_id || undefined,
      notes: form.notes || undefined,
      subtotal: form.subtotal,
      tax_amount: form.tax_amount,
      total_amount: total,
    });
    if (result) {
      setForm({ client_id: '', notes: '', subtotal: 0, tax_amount: 0 });
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
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> {language === 'ar' ? 'عرض جديد' : 'New Quotation'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{language === 'ar' ? 'إنشاء عرض سعر' : 'Create Quotation'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select Client'} /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder={language === 'ar' ? 'المبلغ الفرعي' : 'Subtotal'} value={form.subtotal || ''} onChange={e => setForm({ ...form, subtotal: Number(e.target.value) })} />
                <Input type="number" placeholder={language === 'ar' ? 'الضريبة' : 'Tax Amount'} value={form.tax_amount || ''} onChange={e => setForm({ ...form, tax_amount: Number(e.target.value) })} />
                <Textarea placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <Button className="w-full" onClick={handleCreate}>{language === 'ar' ? 'إنشاء' : 'Create'}</Button>
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
      </div>
    </SalesLayout>
  );
}
