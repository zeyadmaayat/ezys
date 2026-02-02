import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomers } from '@/hooks/useCustomers';
import { exportToCSV } from '@/lib/csv-export';
import MainLayout from '@/components/MainLayout';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Download, Users, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import type { Customer } from '@/types/erp';

const CustomersPage = () => {
  const { language } = useLanguage();
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleSubmit = async () => {
    const customerData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      billing_address: formData.address ? { full: formData.address } : {},
    };

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, customerData);
    } else {
      await createCustomer(customerData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: (customer.billing_address as { full?: string })?.full || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
      await deleteCustomer(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setEditingCustomer(null);
  };

  const handleExport = () => {
    exportToCSV(filteredCustomers, [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'created_at', header: 'Created', format: (v) => new Date(v as string).toLocaleDateString() },
    ], 'customers');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'العملاء' : 'Customers'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة بيانات العملاء' : 'Manage customer data'}
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
                  {language === 'ar' ? 'إضافة عميل' : 'Add Customer'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer
                      ? (language === 'ar' ? 'تعديل العميل' : 'Edit Customer')
                      : (language === 'ar' ? 'عميل جديد' : 'New Customer')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{language === 'ar' ? 'الاسم' : 'Name'} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === 'ar' ? 'اسم العميل' : 'Customer name'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966..."
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'العنوان' : 'Billing Address'}</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                      {editingCustomer
                        ? (language === 'ar' ? 'حفظ' : 'Save')
                        : (language === 'ar' ? 'إضافة' : 'Add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'لديهم بريد إلكتروني' : 'With Email'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customers.filter(c => c.email).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'لديهم هاتف' : 'With Phone'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{customers.filter(c => c.phone).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'بحث...' : 'Search customers...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{language === 'ar' ? 'البريد' : 'Email'}</TableHead>
                <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                <TableHead>{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      {customer.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">—</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">—</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CustomersPage;
