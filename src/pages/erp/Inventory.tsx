import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory, useInventoryLedger } from '@/hooks/useInventory';
import { useItems } from '@/hooks/useItems';
import { useLocations } from '@/hooks/useLocations';
import { exportToCSV } from '@/lib/csv-export';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Search, Download, BoxesIcon, ArrowDownToLine, ArrowUpFromLine, History, Plus, Minus } from 'lucide-react';
import type { InventoryMovementType } from '@/types/erp';

const movementTypes: { value: InventoryMovementType; labelEn: string; labelAr: string; icon: typeof Plus }[] = [
  { value: 'Inbound', labelEn: 'Inbound', labelAr: 'وارد', icon: ArrowDownToLine },
  { value: 'Outbound', labelEn: 'Outbound', labelAr: 'صادر', icon: ArrowUpFromLine },
  { value: 'Adjustment', labelEn: 'Adjustment', labelAr: 'تعديل', icon: Plus },
  { value: 'Return', labelEn: 'Return', labelAr: 'مرتجع', icon: Minus },
];

const InventoryPage = () => {
  const { language } = useLanguage();
  const { inventory, loading, adjustInventory } = useInventory();
  const { entries: ledgerEntries, loading: ledgerLoading } = useInventoryLedger();
  const { items } = useItems();
  const { locations } = useLocations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');
  
  const [formData, setFormData] = useState({
    item_id: '',
    location_id: '',
    quantity: '',
    movement_type: 'Inbound' as InventoryMovementType,
    notes: '',
  });

  const filteredInventory = inventory.filter(inv =>
    inv.item?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.location?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
  const totalReserved = inventory.reduce((sum, inv) => sum + inv.reserved_quantity, 0);
  const lowStockItems = inventory.filter(inv => inv.quantity > 0 && inv.quantity < 10).length;

  const handleSubmit = async () => {
    const success = await adjustInventory(
      formData.item_id,
      formData.location_id,
      parseFloat(formData.quantity),
      formData.movement_type,
      formData.notes || undefined
    );

    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ item_id: '', location_id: '', quantity: '', movement_type: 'Inbound', notes: '' });
  };

  const handleExport = () => {
    exportToCSV(filteredInventory.map(inv => ({
      sku: inv.item?.sku || '',
      item_name: inv.item?.name || '',
      location: inv.location?.name || '',
      quantity: inv.quantity,
      reserved: inv.reserved_quantity,
      available: inv.quantity - inv.reserved_quantity,
    })), [
      { key: 'sku', header: 'SKU' },
      { key: 'item_name', header: 'Item' },
      { key: 'location', header: 'Location' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'reserved', header: 'Reserved' },
      { key: 'available', header: 'Available' },
    ], 'inventory');
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
              <BoxesIcon className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'المخزون' : 'Inventory'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة المخزون وحركة البضائع' : 'Manage stock and movements'}
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
                  {language === 'ar' ? 'حركة جديدة' : 'New Movement'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'حركة مخزون جديدة' : 'New Inventory Movement'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{language === 'ar' ? 'نوع الحركة' : 'Movement Type'}</Label>
                    <Select value={formData.movement_type} onValueChange={(v) => setFormData({ ...formData, movement_type: v as InventoryMovementType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {movementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {language === 'ar' ? type.labelAr : type.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'المنتج' : 'Item'} *</Label>
                    <Select value={formData.item_id} onValueChange={(v) => setFormData({ ...formData, item_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر المنتج' : 'Select item'} />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.sku} - {item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الموقع' : 'Location'} *</Label>
                    <Select value={formData.location_id} onValueChange={(v) => setFormData({ ...formData, location_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.filter(l => l.location_type === 'warehouse').map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الكمية' : 'Quantity'} *</Label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      min="0"
                      step="0.01"
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
                    <Button onClick={handleSubmit} disabled={!formData.item_id || !formData.location_id || !formData.quantity}>
                      {language === 'ar' ? 'تنفيذ' : 'Execute'}
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
                {language === 'ar' ? 'إجمالي المخزون' : 'Total Stock'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalStock.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المحجوز' : 'Reserved'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalReserved.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المتاح' : 'Available'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{(totalStock - totalReserved).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange">{lowStockItems}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="stock" className="gap-2">
              <BoxesIcon className="w-4 h-4" />
              {language === 'ar' ? 'المخزون الحالي' : 'Current Stock'}
            </TabsTrigger>
            <TabsTrigger value="ledger" className="gap-2">
              <History className="w-4 h-4" />
              {language === 'ar' ? 'سجل الحركات' : 'Movement Ledger'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث...' : 'Search inventory...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'محجوز' : 'Reserved'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'متاح' : 'Available'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {language === 'ar' ? 'لا يوجد مخزون' : 'No inventory found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((inv) => {
                      const available = inv.quantity - inv.reserved_quantity;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">{inv.item?.sku}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{inv.item?.name}</TableCell>
                          <TableCell>{inv.location?.name}</TableCell>
                          <TableCell className="text-right font-mono">{inv.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">{inv.reserved_quantity}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={available < 10 ? 'destructive' : 'default'} className="font-mono">
                              {available}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="ledger">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                    <TableHead>{language === 'ar' ? 'ملاحظات' : 'Notes'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : ledgerEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {language === 'ar' ? 'لا توجد حركات' : 'No movements found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledgerEntries.map((entry) => {
                      const typeInfo = movementTypes.find(t => t.value === entry.movement_type);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={entry.quantity >= 0 ? 'default' : 'destructive'}>
                              {language === 'ar' ? typeInfo?.labelAr : typeInfo?.labelEn}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{entry.item?.sku}</TableCell>
                          <TableCell>{entry.location?.name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{entry.notes || '—'}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default InventoryPage;
