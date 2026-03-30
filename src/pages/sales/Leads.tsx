import { useState } from 'react';
import { SalesLayout } from '@/components/sales/SalesLayout';
import { useLeads } from '@/hooks/useLeads';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Edit, Phone, Mail } from 'lucide-react';
import type { LeadStatus, LeadSource, CreateLeadInput } from '@/types/sales';

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contacted: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  qualified: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  proposal: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  won: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusLabels: Record<LeadStatus, { en: string; ar: string }> = {
  new: { en: 'New', ar: 'جديد' },
  contacted: { en: 'Contacted', ar: 'تم التواصل' },
  qualified: { en: 'Qualified', ar: 'مؤهل' },
  proposal: { en: 'Proposal', ar: 'عرض سعر' },
  won: { en: 'Won', ar: 'فاز' },
  lost: { en: 'Lost', ar: 'خسر' },
};

export default function LeadsPage() {
  const { language } = useLanguage();
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateLeadInput>({ name: '' });

  const filtered = leads.filter(l => {
    const matchesSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!form.name) return;
    const result = await createLead(form);
    if (result) {
      setForm({ name: '' });
      setDialogOpen(false);
    }
  };

  return (
    <SalesLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'العملاء المحتملين' : 'Leads'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'إدارة العملاء المحتملين وتتبعهم' : 'Manage and track your sales leads'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> {language === 'ar' ? 'عميل جديد' : 'New Lead'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{language === 'ar' ? 'إضافة عميل محتمل' : 'Add New Lead'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder={language === 'ar' ? 'الاسم *' : 'Name *'} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder={language === 'ar' ? 'الشركة' : 'Company'} value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                <Input placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input placeholder={language === 'ar' ? 'الهاتف' : 'Phone'} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Select value={form.source || 'website'} onValueChange={v => setForm({ ...form, source: v as LeadSource })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder={language === 'ar' ? 'الإيراد المتوقع' : 'Expected Revenue'} value={form.expected_revenue || ''} onChange={e => setForm({ ...form, expected_revenue: Number(e.target.value) })} />
                <Textarea placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <Button className="w-full" onClick={handleCreate}>{language === 'ar' ? 'إضافة' : 'Create Lead'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All Status'}</SelectItem>
              {(Object.keys(statusLabels) as LeadStatus[]).map(s => (
                <SelectItem key={s} value={s}>{language === 'ar' ? statusLabels[s].ar : statusLabels[s].en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الشركة' : 'Company'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التواصل' : 'Contact'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المصدر' : 'Source'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإيراد المتوقع' : 'Expected Revenue'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد بيانات' : 'No leads found'}</TableCell></TableRow>
                ) : filtered.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.company_name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {lead.email && <Mail className="w-3 h-3 text-muted-foreground" />}
                        {lead.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">{lead.email || lead.phone || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{lead.source}</Badge></TableCell>
                    <TableCell>{lead.expected_revenue > 0 ? `${lead.expected_revenue.toLocaleString()} SAR` : '—'}</TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={v => updateLead(lead.id, { status: v as LeadStatus })}>
                        <SelectTrigger className={`h-7 text-xs w-28 ${statusColors[lead.status as LeadStatus]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusLabels) as LeadStatus[]).map(s => (
                            <SelectItem key={s} value={s}>{language === 'ar' ? statusLabels[s].ar : statusLabels[s].en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLead(lead.id)}>
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
