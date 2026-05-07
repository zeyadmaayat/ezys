import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory, useInventoryLedger } from '@/hooks/useInventory';
import { useItems } from '@/hooks/useItems';
import { useLocations } from '@/hooks/useLocations';
import { exportToCSV } from '@/lib/csv-export';
import { ErpLayout } from '@/components/erp/ErpLayout';
import { ViewSwitcher, type ViewMode } from '@/components/erp/ViewSwitcher';
import { InventoryKanban } from '@/components/erp/inventory/InventoryKanban';
import { InventoryFormView } from '@/components/erp/inventory/InventoryFormView';
import { InventoryCalendar } from '@/components/erp/inventory/InventoryCalendar';
import { InventoryPivot } from '@/components/erp/inventory/InventoryPivot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Download, BoxesIcon, ArrowDownToLine, ArrowUpFromLine,
  History, Plus, Minus, Boxes, Package, AlertTriangle, CheckCircle2,
  Sparkles, LayoutDashboard, ArrowRightLeft,
} from 'lucide-react';
import type { InventoryMovementType } from '@/types/erp';
import { Link } from 'react-router-dom';
import { VisionScannerDialog } from '@/components/inventory/VisionScannerDialog';
import { useActionGuard, type GuardCheck } from '@/hooks/useActionGuard';
import { GuardDialog } from '@/components/guard/GuardDialog';
import { GuardBadge } from '@/components/guard/GuardBadge';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';

const movementTypes: { value: InventoryMovementType; labelEn: string; labelAr: string }[] = [
  { value: 'Inbound', labelEn: 'Inbound', labelAr: 'وارد' },
  { value: 'Outbound', labelEn: 'Outbound', labelAr: 'صادر' },
  { value: 'Adjustment', labelEn: 'Adjustment', labelAr: 'تعديل' },
  { value: 'Return', labelEn: 'Return', labelAr: 'مرتجع' },
];

const InventoryPage = () => {
  const { language } = useLanguage();
  const { inventory, loading, adjustInventory } = useInventory();
  const { entries: ledgerEntries, loading: ledgerLoading } = useInventoryLedger();
  const { items } = useItems();
  const { locations } = useLocations();
  const { isAdmin, isWarehouse } = useCurrentUserRoles();
  const canManage = isAdmin || isWarehouse;
  const { guard, dialogProps } = useActionGuard();
  const warehouseLocs = locations.filter(l => l.location_type === 'warehouse');

  const newMovementChecks: GuardCheck[] = [
    { kind: 'permission', condition: !canManage,
      messageAr: 'تحتاج صلاحية Admin أو Warehouse لإجراء حركات مخزون.',
      messageEn: 'You need Admin or Warehouse role to record movements.' },
    { kind: 'prerequisite', condition: items.length === 0,
      titleAr: 'لا توجد منتجات', titleEn: 'No items',
      messageAr: 'يجب إضافة منتجات قبل تسجيل حركة مخزون.',
      messageEn: 'Add items before recording a movement.',
      actionTo: '/erp/items', actionLabelAr: 'إضافة منتج', actionLabelEn: 'Add item' },
    { kind: 'prerequisite', condition: warehouseLocs.length === 0,
      titleAr: 'لا توجد مواقع تخزين', titleEn: 'No warehouse locations',
      messageAr: 'يجب إضافة موقع مستودع قبل تسجيل حركة.',
      messageEn: 'Add a warehouse location before recording a movement.',
      actionTo: '/erp/locations', actionLabelAr: 'إضافة موقع', actionLabelEn: 'Add location' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [formIndex, setFormIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [scannerOpen, setScannerOpen] = useState(false);

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
  const uniqueLocations = new Set(inventory.map(inv => inv.location_id)).size;

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
      <ErpLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div className="p-6">
        {/* Breadcrumb + Actions bar (Odoo style) */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'المخزون' : 'Inventory'}
            </h1>
            <Badge variant="secondary" className="tabular-nums">{filteredInventory.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ViewSwitcher
              current={viewMode}
              onChange={(m) => {
                setViewMode(m);
                if (m === 'form' && filteredInventory.length > 0) setFormIndex(0);
              }}
              available={activeTab === 'stock' ? ['list', 'kanban', 'form', 'pivot'] : ['list', 'calendar']}
            />
            <Button asChild variant="ghost" size="sm">
              <Link to="/erp/inventory/dashboard"><LayoutDashboard className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'لوحة' : 'Dashboard'}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/erp/inventory/transfers"><ArrowRightLeft className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'متقدم' : 'Advanced'}</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10">
              <Sparkles className="w-4 h-4" />{language === 'ar' ? 'مسح ذكي' : 'AI Scan'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={(e) => {
                  e.preventDefault();
                  guard([
                    { kind: 'permission', condition: !canManage,
                      messageAr: 'تحتاج صلاحية Admin أو Warehouse لإجراء حركات مخزون.',
                      messageEn: 'You need Admin or Warehouse role to record movements.' },
                    { kind: 'prerequisite', condition: items.length === 0,
                      titleAr: 'لا توجد منتجات', titleEn: 'No items',
                      messageAr: 'يجب إضافة منتجات قبل تسجيل حركة مخزون.',
                      messageEn: 'Add items before recording a movement.',
                      actionTo: '/erp/items', actionLabelAr: 'إضافة منتج', actionLabelEn: 'Add item' },
                    { kind: 'prerequisite', condition: warehouseLocs.length === 0,
                      titleAr: 'لا توجد مواقع تخزين', titleEn: 'No warehouse locations',
                      messageAr: 'يجب إضافة موقع مستودع قبل تسجيل حركة.',
                      messageEn: 'Add a warehouse location before recording a movement.',
                      actionTo: '/erp/locations', actionLabelAr: 'إضافة موقع', actionLabelEn: 'Add location' },
                  ], () => setIsDialogOpen(true));
                }}>
                  <Plus className="w-4 h-4 mr-1.5" />
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
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المنتج' : 'Select item'} /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} /></SelectTrigger>
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

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalStock.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ar' ? 'إجمالي المخزون' : 'Total Stock'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalReserved.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ar' ? 'المحجوز' : 'Reserved'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{uniqueLocations}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ar' ? 'المواقع' : 'Locations'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{lowStockItems}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Stock vs Ledger */}
        <Tabs value={activeTab} onValueChange={(t) => { setActiveTab(t); setViewMode(t === 'stock' ? 'list' : 'list'); }}>
          <TabsList className="mb-4">
            <TabsTrigger value="stock" className="gap-1.5">
              <BoxesIcon className="w-3.5 h-3.5" />
              {language === 'ar' ? 'المخزون' : 'Stock'}
            </TabsTrigger>
            <TabsTrigger value="ledger" className="gap-1.5">
              <History className="w-3.5 h-3.5" />
              {language === 'ar' ? 'السجل' : 'Ledger'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            {/* Search */}
            {viewMode !== 'form' && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'بحث بالاسم أو SKU أو الموقع...' : 'Search by name, SKU, or location...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <Card className="border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'ar' ? 'الكمية' : 'On Hand'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'ar' ? 'محجوز' : 'Reserved'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'ar' ? 'متاح' : 'Available'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          {language === 'ar' ? 'لا يوجد مخزون' : 'No inventory records'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((inv, idx) => {
                        const available = inv.quantity - inv.reserved_quantity;
                        return (
                          <TableRow
                            key={inv.id}
                            className="cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => { setFormIndex(idx); setViewMode('form'); }}
                          >
                            <TableCell>
                              <Badge variant="secondary" className="font-mono text-xs">{inv.item?.sku}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{inv.item?.name}</TableCell>
                            <TableCell className="text-muted-foreground">{inv.location?.name}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">{inv.quantity}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{inv.reserved_quantity}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={available < 10 ? 'destructive' : 'default'}
                                className="font-mono tabular-nums"
                              >
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
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
              <InventoryKanban
                inventory={filteredInventory}
                onSelect={(inv) => {
                  const idx = filteredInventory.findIndex(i => i.id === inv.id);
                  setFormIndex(idx);
                  setViewMode('form');
                }}
              />
            )}

            {/* Form View */}
            {viewMode === 'form' && (
              <InventoryFormView
                inventory={filteredInventory}
                currentIndex={formIndex}
                onNavigate={setFormIndex}
                onClose={() => setViewMode('list')}
              />
            )}

            {/* Pivot View */}
            {viewMode === 'pivot' && <InventoryPivot inventory={filteredInventory} />}
          </TabsContent>

          <TabsContent value="ledger">
            {viewMode === 'calendar' ? (
              <InventoryCalendar
                entries={ledgerEntries}
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
              />
            ) : (
              <Card className="border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-semibold">{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                      <TableHead className="text-right font-semibold">{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                      <TableHead className="font-semibold">{language === 'ar' ? 'ملاحظات' : 'Notes'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : ledgerEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          {language === 'ar' ? 'لا توجد حركات' : 'No movements found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgerEntries.map((entry) => {
                        const typeInfo = movementTypes.find(t => t.value === entry.movement_type);
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="text-sm">{new Date(entry.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={entry.quantity >= 0 ? 'default' : 'destructive'} className="text-xs">
                                {language === 'ar' ? typeInfo?.labelAr : typeInfo?.labelEn}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{entry.item?.sku}</TableCell>
                            <TableCell>{entry.location?.name}</TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              <span className={entry.quantity > 0 ? 'text-emerald-600' : 'text-destructive'}>
                                {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{entry.notes || '—'}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <VisionScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          defaultType="product"
          onAction={async (action, result) => {
            if (action === 'add' && result.matched_item_id && result.suggested_location_id && result.detected_quantity) {
              await adjustInventory(
                String(result.matched_item_id),
                String(result.suggested_location_id),
                Number(result.detected_quantity),
                'Inbound',
                `AI Vision: ${result.matched_item_name || ''} (${result.confidence || 0}%)`
              );
            }
          }}
        />
        <GuardDialog {...dialogProps} />
      </div>
    </ErpLayout>
  );
};

export default InventoryPage;
