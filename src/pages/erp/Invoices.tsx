import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { exportToCSV } from '@/lib/csv-export';
import { ErpLayout } from '@/components/erp/ErpLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Download, Receipt, MoreVertical, Send, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types/erp';

const statusConfig: Record<InvoiceStatus, { color: string; labelEn: string; labelAr: string; icon: typeof CheckCircle }> = {
  Draft: { color: 'bg-muted text-muted-foreground', labelEn: 'Draft', labelAr: 'مسودة', icon: Receipt },
  Sent: { color: 'bg-blue-100 text-blue-700', labelEn: 'Sent', labelAr: 'مرسلة', icon: Send },
  Paid: { color: 'bg-green-100 text-green-700', labelEn: 'Paid', labelAr: 'مدفوعة', icon: CheckCircle },
  Overdue: { color: 'bg-orange-100 text-orange-700', labelEn: 'Overdue', labelAr: 'متأخرة', icon: AlertCircle },
  Cancelled: { color: 'bg-destructive/10 text-destructive', labelEn: 'Cancelled', labelAr: 'ملغية', icon: X },
};

const InvoicesPage = () => {
  const { language } = useLanguage();
  const { invoices, loading, stats, createInvoice, updateInvoiceStatus, deleteInvoice } = useInvoices();
  const { customers } = useCustomers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    due_date: '',
    notes: '',
    tax_amount: 0,
  });
  
  const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unit_price: 0 });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addInvoiceItem = () => {
    if (!newItem.description) return;
    setInvoiceItems([...invoiceItems, {
      ...newItem,
      total_price: newItem.quantity * newItem.unit_price,
    }]);
    setNewItem({ description: '', quantity: 1, unit_price: 0 });
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total_price, 0);

  const handleSubmit = async () => {
    await createInvoice({
      customer_id: formData.customer_id || null,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
      tax_amount: formData.tax_amount,
    }, invoiceItems);

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ customer_id: '', due_date: '', notes: '', tax_amount: 0 });
    setInvoiceItems([]);
  };

  const handleExport = () => {
    exportToCSV(filteredInvoices, [
      { key: 'invoice_number', header: 'Invoice #' },
      { key: 'customer.name', header: 'Customer' },
      { key: 'status', header: 'Status' },
      { key: 'total_amount', header: 'Total' },
      { key: 'currency', header: 'Currency' },
      { key: 'issue_date', header: 'Issue Date' },
      { key: 'due_date', header: 'Due Date' },
    ], 'invoices');
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    return language === 'ar' ? statusConfig[status].labelAr : statusConfig[status].labelEn;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <ErpLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Receipt className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'الفواتير' : 'Invoices'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة الفواتير والمدفوعات' : 'Manage invoices and payments'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Customer */}
                  <div>
                    <Label>{language === 'ar' ? 'العميل' : 'Customer'}</Label>
                    <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select customer'} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <Label className="mb-2 block">{language === 'ar' ? 'البنود' : 'Line Items'}</Label>
                    <div className="space-y-2 mb-3">
                      {invoiceItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                          <span className="flex-1">{item.description}</span>
                          <span>{item.quantity} × {item.unit_price}</span>
                          <span className="font-medium">{item.total_price.toFixed(2)}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeInvoiceItem(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={language === 'ar' ? 'الوصف' : 'Description'}
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder={language === 'ar' ? 'الكمية' : 'Qty'}
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        className="w-20"
                        min={1}
                      />
                      <Input
                        type="number"
                        placeholder={language === 'ar' ? 'السعر' : 'Price'}
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-24"
                        step="0.01"
                      />
                      <Button type="button" variant="outline" onClick={addInvoiceItem} disabled={!newItem.description}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="font-mono">{subtotal.toFixed(2)} SAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{language === 'ar' ? 'الضريبة' : 'Tax'}</span>
                      <Input
                        type="number"
                        value={formData.tax_amount}
                        onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                        className="w-32 text-right"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span className="font-mono">{(subtotal + formData.tax_amount).toFixed(2)} SAR</span>
                    </div>
                  </div>

                  {/* Due Date & Notes */}
                  <div>
                    <Label>{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={invoiceItems.length === 0}>
                      {language === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الإيرادات' : 'Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue, 'SAR')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المستحقة' : 'Outstanding'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalOutstanding, 'SAR')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'مدفوعة' : 'Paid'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalPaid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'متأخرة' : 'Overdue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{stats.totalOverdue}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'بحث...' : 'Search invoices...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
              {(Object.keys(statusConfig) as InvoiceStatus[]).map((status) => (
                <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
                <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-right">{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                <TableHead>{language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'الاستحقاق' : 'Due Date'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[invoice.status].color}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </TableCell>
                    <TableCell>{invoice.issue_date}</TableCell>
                    <TableCell>{invoice.due_date || '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invoice.status === 'Draft' && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'Sent')}>
                              <Send className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'إرسال' : 'Send'}
                            </DropdownMenuItem>
                          )}
                          {['Sent', 'Overdue'].includes(invoice.status) && (
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'Paid')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'تم الدفع' : 'Mark Paid'}
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'Draft' && (
                            <DropdownMenuItem onClick={() => deleteInvoice(invoice.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </ErpLayout>
  );
};

export default InvoicesPage;
