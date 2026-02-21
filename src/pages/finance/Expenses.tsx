import { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { RequireRole, RoleBadge } from '@/components/auth/RequireRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Loader2, Receipt, Trash2, Download, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { EXPENSE_CATEGORIES, SUPPORTED_CURRENCIES, type ExpenseCategory } from '@/types/saas-erp';
import { exportToCSV } from '@/lib/csv-export';

const categoryColors: Record<ExpenseCategory, string> = {
  Freight: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Customs: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Insurance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  Warehouse: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Fuel: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  Salaries: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Utilities: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Office: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  Marketing: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Other: 'bg-muted text-muted-foreground',
};

export default function ExpensesPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { expenses, loading, createExpense, deleteExpense } = useExpenses();
  const { canManageInvoices } = useCurrentUserRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Other' as ExpenseCategory,
    amount: '',
    currency: 'SAR',
    expense_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    description: '',
    reference: '',
  });

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.expense_number.toLowerCase().includes(q) ||
          (e.vendor_name || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.reference || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totals = useMemo(() => {
    const byCurrency: Record<string, number> = {};
    filtered.forEach(e => {
      const c = e.currency || 'SAR';
      byCurrency[c] = (byCurrency[c] || 0) + Number(e.amount);
    });
    return byCurrency;
  }, [filtered]);

  const handleCreate = async () => {
    if (!formData.amount) return;
    const result = await createExpense({
      category: formData.category,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      expense_date: formData.expense_date,
      vendor_name: formData.vendor_name || undefined,
      description: formData.description || undefined,
      reference: formData.reference || undefined,
    });
    if (result) {
      setIsOpen(false);
      setFormData({ category: 'Other', amount: '', currency: 'SAR', expense_date: new Date().toISOString().split('T')[0], vendor_name: '', description: '', reference: '' });
    }
  };

  const handleExport = () => {
    exportToCSV(filtered, [
      { key: 'expense_number', header: 'Expense #' },
      { key: 'category', header: 'Category' },
      { key: 'amount', header: 'Amount', format: (v) => String(v) },
      { key: 'currency', header: 'Currency' },
      { key: 'expense_date', header: 'Date', format: (v) => new Date(String(v)).toLocaleDateString() },
      { key: 'vendor_name', header: 'Vendor', format: (v) => String(v || '') },
      { key: 'description', header: 'Description', format: (v) => String(v || '') },
    ], 'Expenses_Export');
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-red-500" />
              {isRTL ? 'المصاريف' : 'Expenses'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? 'تتبع وإدارة مصاريف الشركة' : 'Track & manage company expenses'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 me-2" />{isRTL ? 'تصدير' : 'Export'}
            </Button>
            <RequireRole roles={['admin', 'finance']} fallback={<RoleBadge roles={['admin', 'finance']} />} hideWhenForbidden={false}>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 me-2" />{isRTL ? 'مصروف جديد' : 'New Expense'}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{isRTL ? 'تسجيل مصروف' : 'Record Expense'}</DialogTitle>
                    <DialogDescription>{isRTL ? 'أدخل تفاصيل المصروف' : 'Enter expense details'}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ExpenseCategory })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{isRTL ? 'العملة' : 'Currency'}</Label>
                        <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{SUPPORTED_CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{isRTL ? 'المبلغ' : 'Amount'}</Label>
                        <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} min={0} step="0.01" />
                      </div>
                      <div>
                        <Label>{isRTL ? 'التاريخ' : 'Date'}</Label>
                        <Input type="date" value={formData.expense_date} onChange={e => setFormData({ ...formData, expense_date: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>{isRTL ? 'المورد' : 'Vendor'}</Label>
                      <Input value={formData.vendor_name} onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} placeholder={isRTL ? 'اسم المورد (اختياري)' : 'Vendor name (optional)'} />
                    </div>
                    <div>
                      <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                      <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
                    </div>
                    <div>
                      <Label>{isRTL ? 'مرجع' : 'Reference'}</Label>
                      <Input value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder={isRTL ? 'رقم مرجعي (اختياري)' : 'Reference # (optional)'} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                      <Button onClick={handleCreate} disabled={!formData.amount}>{isRTL ? 'حفظ' : 'Save'}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </RequireRole>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{isRTL ? 'إجمالي المصاريف' : 'Total Expenses'}</p>
              <div className="mt-1 space-y-0.5">
                {Object.entries(totals).map(([cur, val]) => (
                  <p key={cur} className="text-lg font-bold">{val.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{cur}</span></p>
                ))}
                {Object.keys(totals).length === 0 && <p className="text-2xl font-bold">0</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{isRTL ? 'عدد المصاريف' : 'Count'}</p>
              <p className="text-2xl font-bold mt-1">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{isRTL ? 'هذا الشهر' : 'This Month'}</p>
              <p className="text-2xl font-bold mt-1">
                {expenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth() && new Date(e.expense_date).getFullYear() === new Date().getFullYear()).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{isRTL ? 'الفئات' : 'Categories'}</p>
              <p className="text-2xl font-bold mt-1">{new Set(expenses.map(e => e.category)).size}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={isRTL ? 'بحث...' : 'Search expenses...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="ps-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder={isRTL ? 'الفئة' : 'Category'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">{isRTL ? 'لا توجد مصاريف' : 'No expenses found'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'الرقم' : '#'}</TableHead>
                    <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                    <TableHead>{isRTL ? 'المورد' : 'Vendor'}</TableHead>
                    <TableHead>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead className="text-end">{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-mono font-medium text-primary">{exp.expense_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(exp.expense_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell><Badge className={categoryColors[exp.category]}>{exp.category}</Badge></TableCell>
                      <TableCell>{exp.vendor_name || '—'}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{exp.description || '—'}</TableCell>
                      <TableCell className="text-end font-semibold">{Number(exp.amount).toLocaleString()} <span className="text-xs text-muted-foreground">{exp.currency}</span></TableCell>
                      <TableCell>
                        {canManageInvoices && (
                          <Button variant="ghost" size="sm" onClick={() => deleteExpense(exp.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
