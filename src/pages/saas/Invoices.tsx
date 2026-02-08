import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { usePayments } from '@/hooks/usePayments';
import { useShipmentsV2 } from '@/hooks/useShipmentsV2';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { RequireRole, RoleBadge, PermissionButtonWrapper } from '@/components/auth/RequireRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, ArrowLeft, DollarSign, Send, CheckCircle, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceStatusV2, PaymentMethod } from '@/types/saas-erp';

const statusColors: Record<InvoiceStatusV2, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Sent: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { invoices, loading, createInvoice, updateInvoiceStatus } = useInvoicesV2();
  const { createPayment } = usePayments();
  const { shipments, getDeliveredShipments } = useShipmentsV2();
  const { canManageInvoices, canRecordPayments } = useCurrentUserRoles();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    shipment_id: '',
    amount: '',
    due_date: '',
    notes: '',
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'bank_transfer' as PaymentMethod,
    reference: '',
  });

  // Auto-open create dialog if shipment param is present
  useEffect(() => {
    const shipmentId = searchParams.get('shipment');
    if (shipmentId) {
      setFormData(prev => ({ ...prev, shipment_id: shipmentId }));
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreate = async () => {
    if (!formData.shipment_id || !formData.amount) return;
    
    setIsCreating(true);
    const result = await createInvoice({
      shipment_id: formData.shipment_id,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date || undefined,
      notes: formData.notes || undefined,
    });
    setIsCreating(false);
    
    if (result) {
      setIsCreateOpen(false);
      setFormData({ shipment_id: '', amount: '', due_date: '', notes: '' });
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          {/* Only Admin/Finance can create invoices */}
          <RequireRole 
            roles={['admin', 'finance']} 
            fallback={
              <RoleBadge roles={['admin', 'finance']} className="ml-2" />
            }
            hideWhenForbidden={false}
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={deliveredShipments.length === 0 || !canManageInvoices}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>
                  Create an invoice for a delivered shipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Shipment *</Label>
                  <Select 
                    value={formData.shipment_id} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, shipment_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivered shipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveredShipments.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.tracking_number} - {s.origin} → {s.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating || !formData.shipment_id || !formData.amount}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </RequireRole>

          {/* Payment Dialog */}
          <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Record a payment for this invoice.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payAmount">Amount *</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={paymentData.method} 
                    onValueChange={(v: PaymentMethod) => setPaymentData(prev => ({ ...prev, method: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Transaction ID"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                <Button onClick={handlePayment} disabled={isCreating || !paymentData.amount}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices yet. Create an invoice for a delivered shipment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {invoice.shipment?.tracking_number || '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(invoice.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.due_date 
                          ? format(new Date(invoice.due_date), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {invoice.status === 'Draft' && (
                            <PermissionButtonWrapper 
                              roles={['admin', 'finance']}
                              tooltip="Admin or Finance role required"
                            >
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => canManageInvoices && updateInvoiceStatus(invoice.id, 'Sent')}
                                disabled={!canManageInvoices}
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Send
                              </Button>
                            </PermissionButtonWrapper>
                          )}
                          {(invoice.status === 'Draft' || invoice.status === 'Sent') && (
                            <PermissionButtonWrapper 
                              roles={['admin', 'finance']}
                              tooltip="Admin or Finance role required to record payments"
                            >
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => canRecordPayments && openPaymentDialog(invoice.id, invoice.amount)}
                                disabled={!canRecordPayments}
                              >
                                <DollarSign className="mr-1 h-3 w-3" />
                                Pay
                              </Button>
                            </PermissionButtonWrapper>
                          )}
                          {invoice.status === 'Paid' && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
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
