import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { usePayments } from '@/hooks/usePayments';
import { useShipmentsV2 } from '@/hooks/useShipmentsV2';
import { useCompany } from '@/hooks/useCompany';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { RequireRole, RoleBadge, PermissionButtonWrapper } from '@/components/auth/RequireRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Loader2, DollarSign, Send, CheckCircle, Download, Search,
  FileText, TrendingUp, Clock, AlertCircle, CreditCard, Receipt, ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceStatusV2, PaymentMethod, SUPPORTED_CURRENCIES } from '@/types/saas-erp';
import { downloadInvoicePDF } from '@/lib/invoice-pdf';
import { SecureValue } from '@/components/rbac/FieldGate';

const statusConfig: Record<InvoiceStatusV2, { color: string; icon: typeof FileText }> = {
  Draft: { color: 'bg-muted text-muted-foreground', icon: FileText },
  Sent: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
  Paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  Overdue: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
  Cancelled: { color: 'bg-muted text-muted-foreground/60', icon: FileText },
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  check: 'Check',
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { invoices, loading, createInvoice, updateInvoiceStatus } = useInvoicesV2();
  const { payments, createPayment, getTotalPayments } = usePayments();
  const { getDeliveredShipments } = useShipmentsV2();
  const { company } = useCompany();
  const { canManageInvoices, canRecordPayments } = useCurrentUserRoles();

  const [activeTab, setActiveTab] = useState('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ shipment_id: '', amount: '', currency: 'SAR', due_date: '', notes: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'bank_transfer' as PaymentMethod, reference: '' });

  useEffect(() => {
    const shipmentId = searchParams.get('shipment');
    if (shipmentId) {
      setFormData(prev => ({ ...prev, shipment_id: shipmentId }));
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // KPIs
  const kpis = useMemo(() => {
    // Group by currency for display
    const byCurrency: Record<string, { total: number; paid: number; unpaid: number }> = {};
    invoices.forEach(i => {
      const c = i.currency || 'SAR';
      if (!byCurrency[c]) byCurrency[c] = { total: 0, paid: 0, unpaid: 0 };
      byCurrency[c].total += Number(i.amount);
      if (i.status === 'Paid') byCurrency[c].paid += Number(i.amount);
      if (i.status !== 'Paid' && i.status !== 'Cancelled') byCurrency[c].unpaid += Number(i.amount);
    });
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
    return { byCurrency, overdueCount, totalCount: invoices.length };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return inv.invoice_number.toLowerCase().includes(q) ||
          inv.shipment?.tracking_number?.toLowerCase().includes(q) ||
          inv.shipment?.origin?.toLowerCase().includes(q) ||
          inv.shipment?.destination?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  const handleCreate = async () => {
    if (!formData.shipment_id || !formData.amount) return;
    setIsCreating(true);
    const result = await createInvoice({
      shipment_id: formData.shipment_id,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      due_date: formData.due_date || undefined,
      notes: formData.notes || undefined,
    });
    setIsCreating(false);
    if (result) {
      setIsCreateOpen(false);
      setFormData({ shipment_id: '', amount: '', currency: 'SAR', due_date: '', notes: '' });
    }
  };

  const handlePayment = async () => {
    if (!selectedInvoiceId || !paymentData.amount) return;
    setIsCreating(true);
    const result = await createPayment({
      invoice_id: selectedInvoiceId,
      amount: parseFloat(paymentData.amount),
      method: paymentData.method,
      reference: paymentData.reference || undefined,
    });
    setIsCreating(false);
    if (result) {
      setIsPaymentOpen(false);
      setSelectedInvoiceId(null);
      setPaymentData({ amount: '', method: 'bank_transfer', reference: '' });
    }
  };

  const openPaymentDialog = (invoiceId: string, amount: number) => {
    setSelectedInvoiceId(invoiceId);
    setPaymentData({ amount: amount.toString(), method: 'bank_transfer', reference: '' });
    setIsPaymentOpen(true);
  };

  const deliveredShipments = getDeliveredShipments();

  if (loading) {
    return (
      <SaasLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SaasLayout>
    );
  }

  return (
    <SaasLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              {isRTL ? 'المالية' : 'Finance'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? 'إدارة الفواتير والمدفوعات والتقارير المالية' : 'Manage invoices, payments & financial reports'}
            </p>
          </div>
          <RequireRole
            roles={['admin', 'finance']}
            fallback={<RoleBadge roles={['admin', 'finance']} />}
            hideWhenForbidden={false}
          >
            <Button onClick={() => setIsCreateOpen(true)} disabled={deliveredShipments.length === 0 || !canManageInvoices}>
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'فاتورة جديدة' : 'New Invoice'}
            </Button>
          </RequireRole>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(kpis.byCurrency).map(([cur, v]) => (
                      <p key={cur} className="text-lg font-bold">
                        {v.total.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{cur}</span>
                      </p>
                    ))}
                    {Object.keys(kpis.byCurrency).length === 0 && <p className="text-2xl font-bold">0</p>}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {kpis.totalCount} {isRTL ? 'فاتورة' : 'invoices'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {isRTL ? 'المحصّل' : 'Collected'}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(kpis.byCurrency).filter(([, v]) => v.paid > 0).map(([cur, v]) => (
                      <p key={cur} className="text-lg font-bold text-green-600">
                        {v.paid.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{cur}</span>
                      </p>
                    ))}
                    {Object.values(kpis.byCurrency).every(v => v.paid === 0) && <p className="text-2xl font-bold text-green-600">0</p>}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {isRTL ? 'غير محصّل' : 'Outstanding'}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(kpis.byCurrency).filter(([, v]) => v.unpaid > 0).map(([cur, v]) => (
                      <p key={cur} className="text-lg font-bold text-orange-600">
                        {v.unpaid.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{cur}</span>
                      </p>
                    ))}
                    {Object.values(kpis.byCurrency).every(v => v.unpaid === 0) && <p className="text-2xl font-bold text-orange-600">0</p>}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {isRTL ? 'متأخرة' : 'Overdue'}
                  </p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{kpis.overdueCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Invoices & Payments */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-11 p-1">
            <TabsTrigger value="invoices" className="gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {isRTL ? 'الفواتير' : 'Invoices'}
              <Badge variant="secondary" className="ms-1">{invoices.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              {isRTL ? 'المدفوعات' : 'Payments'}
              <Badge variant="secondary" className="ms-1">{payments.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'بحث برقم الفاتورة أو الشحنة...' : 'Search by invoice # or shipment...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="Draft">{isRTL ? 'مسودة' : 'Draft'}</SelectItem>
                  <SelectItem value="Sent">{isRTL ? 'مرسلة' : 'Sent'}</SelectItem>
                  <SelectItem value="Paid">{isRTL ? 'مدفوعة' : 'Paid'}</SelectItem>
                  <SelectItem value="Overdue">{isRTL ? 'متأخرة' : 'Overdue'}</SelectItem>
                  <SelectItem value="Cancelled">{isRTL ? 'ملغية' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardContent className="p-0">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">{isRTL ? 'لا يوجد فواتير' : 'No invoices found'}</p>
                    <p className="text-sm mt-1">
                      {searchQuery || statusFilter !== 'all'
                        ? (isRTL ? 'جرّب تغيير الفلتر' : 'Try adjusting your filters')
                        : (isRTL ? 'أنشئ فاتورة لشحنة مكتملة' : 'Create an invoice for a delivered shipment')}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
                        <TableHead>{isRTL ? 'الشحنة' : 'Shipment'}</TableHead>
                        <TableHead>{isRTL ? 'المسار' : 'Route'}</TableHead>
                        <TableHead className="text-end">{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                        <TableHead className="text-end">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map(invoice => {
                        const cfg = statusConfig[invoice.status];
                        return (
                          <TableRow key={invoice.id} className="group">
                            <TableCell className="font-mono font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {invoice.shipment?.tracking_number || '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {invoice.shipment
                                ? `${invoice.shipment.origin} → ${invoice.shipment.destination}`
                                : '—'}
                            </TableCell>
                            <TableCell className="text-end font-semibold">
                              <SecureValue entity="invoices" field="amount" value={invoice.amount} format={(v) => Number(v).toLocaleString()} /> <span className="text-xs text-muted-foreground">{invoice.currency || 'SAR'}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={cfg.color}>{invoice.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => downloadInvoicePDF(invoice, company?.name)}
                                  title={isRTL ? 'تحميل PDF' : 'Download PDF'}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                {invoice.status === 'Draft' && (
                                  <PermissionButtonWrapper roles={['admin', 'finance']} tooltip="Admin or Finance role required">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs"
                                      onClick={() => canManageInvoices && updateInvoiceStatus(invoice.id, 'Sent')}
                                      disabled={!canManageInvoices}
                                    >
                                      <Send className="h-3 w-3 me-1" />
                                      {isRTL ? 'إرسال' : 'Send'}
                                    </Button>
                                  </PermissionButtonWrapper>
                                )}
                                {(invoice.status === 'Draft' || invoice.status === 'Sent') && (
                                  <PermissionButtonWrapper roles={['admin', 'finance']} tooltip="Admin or Finance role required">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs"
                                      onClick={() => canRecordPayments && openPaymentDialog(invoice.id, invoice.amount)}
                                      disabled={!canRecordPayments}
                                    >
                                      <DollarSign className="h-3 w-3 me-1" />
                                      {isRTL ? 'دفع' : 'Pay'}
                                    </Button>
                                  </PermissionButtonWrapper>
                                )}
                                {invoice.status === 'Paid' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {isRTL ? 'سجل المدفوعات' : 'Payment History'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">{isRTL ? 'لا يوجد مدفوعات' : 'No payments recorded'}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'الفاتورة' : 'Invoice'}</TableHead>
                        <TableHead className="text-end">{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                        <TableHead>{isRTL ? 'طريقة الدفع' : 'Method'}</TableHead>
                        <TableHead>{isRTL ? 'المرجع' : 'Reference'}</TableHead>
                        <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono">
                            {payment.invoice?.invoice_number || '—'}
                          </TableCell>
                          <TableCell className="text-end font-semibold text-green-600">
                            +<SecureValue entity="payments" field="amount" value={payment.amount} format={(v) => Number(v).toLocaleString()} /> {payment.invoice?.currency || 'SAR'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{paymentMethodLabels[payment.method]}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.reference || '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(payment.paid_at), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء فاتورة' : 'Create Invoice'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'أنشئ فاتورة لشحنة مكتملة' : 'Create an invoice for a delivered shipment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الشحنة' : 'Shipment'} *</Label>
              <Select value={formData.shipment_id} onValueChange={v => setFormData(prev => ({ ...prev, shipment_id: v }))}>
                <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر شحنة مكتملة' : 'Select delivered shipment'} /></SelectTrigger>
                <SelectContent>
                  {deliveredShipments.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.tracking_number} — {s.origin} → {s.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'المبلغ' : 'Amount'} *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'العملة' : 'Currency'}</Label>
                <Select value={formData.currency} onValueChange={v => setFormData(prev => ({ ...prev, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
              <Input type="date" value={formData.due_date} onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'} value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleCreate} disabled={isCreating || !formData.shipment_id || !formData.amount}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? 'إنشاء' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تسجيل دفعة' : 'Record Payment'}</DialogTitle>
            <DialogDescription>{isRTL ? 'سجّل دفعة لهذه الفاتورة' : 'Record a payment for this invoice.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'المبلغ' : 'Amount'} (SAR) *</Label>
              <Input type="number" step="0.01" value={paymentData.amount} onChange={e => setPaymentData(prev => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</Label>
              <Select value={paymentData.method} onValueChange={(v: PaymentMethod) => setPaymentData(prev => ({ ...prev, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</SelectItem>
                  <SelectItem value="credit_card">{isRTL ? 'بطاقة ائتمان' : 'Credit Card'}</SelectItem>
                  <SelectItem value="cash">{isRTL ? 'نقدي' : 'Cash'}</SelectItem>
                  <SelectItem value="check">{isRTL ? 'شيك' : 'Check'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'رقم المرجع' : 'Reference #'}</Label>
              <Input placeholder={isRTL ? 'رقم التحويل أو المعاملة' : 'Transaction ID'} value={paymentData.reference} onChange={e => setPaymentData(prev => ({ ...prev, reference: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handlePayment} disabled={isCreating || !paymentData.amount}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? 'تسجيل الدفعة' : 'Record Payment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasLayout>
  );
}
