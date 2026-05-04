import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useLocations } from '@/hooks/useLocations';
import { useItems } from '@/hooks/useItems';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Download, ClipboardList, ArrowRight, Truck, X, CheckCircle } from 'lucide-react';
import type { Order, OrderStatus, OrderItem } from '@/types/erp';
import { useActionGuard } from '@/hooks/useActionGuard';
import { GuardDialog } from '@/components/guard/GuardDialog';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';

const statusConfig: Record<OrderStatus, { color: string; labelEn: string; labelAr: string }> = {
  Draft: { color: 'bg-muted text-muted-foreground', labelEn: 'Draft', labelAr: 'مسودة' },
  Confirmed: { color: 'bg-blue-100 text-blue-700', labelEn: 'Confirmed', labelAr: 'مؤكد' },
  Cancelled: { color: 'bg-destructive/10 text-destructive', labelEn: 'Cancelled', labelAr: 'ملغي' },
  ConvertedToShipment: { color: 'bg-green-100 text-green-700', labelEn: 'Shipped', labelAr: 'تم الشحن' },
};

const OrdersPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { orders, loading, createOrder, updateOrderStatus, convertToShipment } = useOrders();
  const { customers } = useCustomers();
  const { locations } = useLocations();
  const { items } = useItems();
  
  const { isAdmin, isOperations } = useCurrentUserRoles();
  const { guard, dialogProps } = useActionGuard();
  const canCreate = isAdmin || isOperations;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    pickup_location_id: '',
    delivery_location_id: '',
    notes: '',
    requested_date: '',
  });
  
  const [orderItems, setOrderItems] = useState<Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]>([]);
  const [newItem, setNewItem] = useState({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', unit_price: 0 });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addOrderItem = () => {
    if (!newItem.item_name) return;
    setOrderItems([...orderItems, { ...newItem, notes: null }]);
    setNewItem({ item_id: '', item_name: '', quantity: 1, unit: 'pcs', unit_price: 0 });
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setNewItem({
        item_id: itemId,
        item_name: item.name,
        quantity: 1,
        unit: item.unit,
        unit_price: 0,
      });
    }
  };

  const handleSubmit = async () => {
    await createOrder({
      customer_id: formData.customer_id || null,
      pickup_location_id: formData.pickup_location_id || null,
      delivery_location_id: formData.delivery_location_id || null,
      notes: formData.notes || null,
      requested_date: formData.requested_date || null,
    }, orderItems);

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ customer_id: '', pickup_location_id: '', delivery_location_id: '', notes: '', requested_date: '' });
    setOrderItems([]);
  };

  const handleConvert = async (orderId: string) => {
    const shipmentId = await convertToShipment(orderId);
    if (shipmentId) {
      navigate(`/shipments/${shipmentId}`);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredOrders, [
      { key: 'order_number', header: 'Order #' },
      { key: 'customer.name', header: 'Customer' },
      { key: 'status', header: 'Status' },
      { key: 'requested_date', header: 'Requested Date' },
      { key: 'created_at', header: 'Created', format: (v) => new Date(v as string).toLocaleDateString() },
    ], 'orders');
  };

  const getStatusLabel = (status: OrderStatus) => {
    return language === 'ar' ? statusConfig[status].labelAr : statusConfig[status].labelEn;
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
              <ClipboardList className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة طلبات الشحن' : 'Manage shipping orders'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <Button onClick={() => guard([
                { kind: 'permission', condition: !canCreate,
                  titleAr: 'صلاحيات غير كافية', titleEn: 'Insufficient permissions',
                  messageAr: 'تحتاج دور Admin أو Operations لإنشاء طلب جديد.',
                  messageEn: 'You need Admin or Operations role to create an order.' },
                { kind: 'prerequisite', condition: customers.length === 0,
                  titleAr: 'لا يوجد عملاء', titleEn: 'No customers yet',
                  messageAr: 'يجب إضافة عميل واحد على الأقل قبل إنشاء طلب.',
                  messageEn: 'You must add at least one customer before creating an order.',
                  actionLabelAr: 'إضافة عميل', actionLabelEn: 'Add customer', actionTo: '/erp/customers' },
                { kind: 'prerequisite', condition: items.length === 0,
                  titleAr: 'لا يوجد منتجات', titleEn: 'No items yet',
                  messageAr: 'يجب إضافة منتج/صنف واحد على الأقل قبل إنشاء طلب.',
                  messageEn: 'You must add at least one item before creating an order.',
                  actionLabelAr: 'إضافة صنف', actionLabelEn: 'Add item', actionTo: '/erp/items' },
                { kind: 'prerequisite', condition: locations.length === 0,
                  titleAr: 'لا يوجد مواقع', titleEn: 'No locations yet',
                  messageAr: 'يجب إضافة موقع/مستودع واحد قبل إنشاء طلب.',
                  messageEn: 'You must add at least one location/warehouse first.',
                  actionLabelAr: 'إضافة موقع', actionLabelEn: 'Add location', actionTo: '/erp/locations' },
              ], () => setIsDialogOpen(true))}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'طلب جديد' : 'New Order'}
              </Button>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'طلب جديد' : 'New Order'}</DialogTitle>
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

                  {/* Locations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'موقع الاستلام' : 'Pickup Location'}</Label>
                      <Select value={formData.pickup_location_id} onValueChange={(v) => setFormData({ ...formData, pickup_location_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'موقع التسليم' : 'Delivery Location'}</Label>
                      <Select value={formData.delivery_location_id} onValueChange={(v) => setFormData({ ...formData, delivery_location_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <Label className="mb-2 block">{language === 'ar' ? 'المنتجات' : 'Items'}</Label>
                    <div className="space-y-2 mb-3">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="flex-1">{item.item_name}</span>
                          <span>{item.quantity} {item.unit}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeOrderItem(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newItem.item_id} onValueChange={handleItemSelect}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={language === 'ar' ? 'اختر منتج' : 'Select item'} />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((i) => (
                            <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        className="w-20"
                        min={1}
                      />
                      <Button type="button" variant="outline" onClick={addOrderItem} disabled={!newItem.item_name}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Date & Notes */}
                  <div>
                    <Label>{language === 'ar' ? 'التاريخ المطلوب' : 'Requested Date'}</Label>
                    <Input
                      type="date"
                      value={formData.requested_date}
                      onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
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
                    <Button onClick={handleSubmit}>
                      {language === 'ar' ? 'إنشاء الطلب' : 'Create Order'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
            <Card key={status} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStatusFilter(status)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {getStatusLabel(status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === status).length}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'بحث...' : 'Search orders...'}
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
              {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
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
                <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order #'}</TableHead>
                <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ المطلوب' : 'Requested'}</TableHead>
                <TableHead>{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[order.status].color}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.requested_date || '—'}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {order.status === 'Draft' && (
                          <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, 'Confirmed')}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'تأكيد' : 'Confirm'}
                          </Button>
                        )}
                        {order.status === 'Confirmed' && (
                          <Button variant="default" size="sm" onClick={() => handleConvert(order.id)}>
                            <Truck className="w-4 h-4 mr-1" />
                            {language === 'ar' ? 'تحويل لشحنة' : 'Convert'}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
      <GuardDialog {...dialogProps} />
    </ErpLayout>
  );
};

export default OrdersPage;
