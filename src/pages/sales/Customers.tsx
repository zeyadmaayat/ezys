import { useState } from 'react';
import { SalesLayout } from '@/components/sales/SalesLayout';
import { useClients } from '@/hooks/useClients';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesCustomersPage() {
  const { language } = useLanguage();
  const { clients, loading, createClient, deleteClient } = useClients();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const customers = clients.filter(c => c.type === 'CLIENT');
  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name) return;
    const result = await createClient({ name: form.name, email: form.email, phone: form.phone, type: 'CLIENT' });
    if (result) { setForm({ name: '', email: '', phone: '' }); setDialogOpen(false); }
  };

  return (
    <SalesLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{language === 'ar' ? 'العملاء' : 'Customers'}</h1>
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إدارة قاعدة عملائك' : 'Manage your customer base'}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> {language === 'ar' ? 'عميل جديد' : 'New Customer'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{language === 'ar' ? 'إضافة عميل' : 'Add Customer'}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder={language === 'ar' ? 'الاسم *' : 'Name *'} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder={language === 'ar' ? 'البريد' : 'Email'} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input placeholder={language === 'ar' ? 'الهاتف' : 'Phone'} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Button className="w-full" onClick={handleCreate}>{language === 'ar' ? 'إضافة' : 'Create'}</Button>
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
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'البريد' : 'Email'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا يوجد عملاء' : 'No customers'}</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.email ? <div className="flex items-center gap-1 text-sm"><Mail className="w-3 h-3" />{c.email}</div> : '—'}
                    </TableCell>
                    <TableCell>
                      {c.phone ? <div className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3" />{c.phone}</div> : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(c.created_at), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteClient(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SalesLayout>
  );
}
