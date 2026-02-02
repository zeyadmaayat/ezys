import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useItems } from '@/hooks/useItems';
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
import { Plus, Search, Download, Package, Barcode, Edit, Trash2 } from 'lucide-react';
import type { Item } from '@/types/erp';

const ItemsPage = () => {
  const { language } = useLanguage();
  const { items, loading, createItem, updateItem, deleteItem } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit: 'pcs',
    barcode: '',
    weight_kg: '',
  });

  const filteredItems = items.filter(i =>
    i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.barcode?.includes(searchQuery)
  );

  const handleSubmit = async () => {
    const itemData = {
      sku: formData.sku,
      name: formData.name,
      description: formData.description || null,
      unit: formData.unit,
      barcode: formData.barcode || null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
    };

    if (editingItem) {
      await updateItem(editingItem.id, itemData);
    } else {
      await createItem(itemData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      unit: item.unit,
      barcode: item.barcode || '',
      weight_kg: item.weight_kg?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
      await deleteItem(id);
    }
  };

  const resetForm = () => {
    setFormData({ sku: '', name: '', description: '', unit: 'pcs', barcode: '', weight_kg: '' });
    setEditingItem(null);
  };

  const handleExport = () => {
    exportToCSV(filteredItems, [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Name' },
      { key: 'unit', header: 'Unit' },
      { key: 'barcode', header: 'Barcode' },
      { key: 'weight_kg', header: 'Weight (kg)' },
    ], 'items');
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
              <Package className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'المنتجات / SKUs' : 'Items / SKUs'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة كتالوج المنتجات' : 'Manage product catalog'}
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
                  {language === 'ar' ? 'إضافة منتج' : 'Add Item'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem
                      ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Item')
                      : (language === 'ar' ? 'منتج جديد' : 'New Item')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SKU *</Label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="SKU-001"
                        disabled={!!editingItem}
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'الوحدة' : 'Unit'}</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="pcs, kg, box..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الاسم' : 'Name'} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'الباركود' : 'Barcode'}</Label>
                      <Input
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.sku || !formData.name}>
                      {editingItem ? (language === 'ar' ? 'حفظ' : 'Save') : (language === 'ar' ? 'إضافة' : 'Add')}
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
                {language === 'ar' ? 'إجمالي المنتجات' : 'Total Items'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'لديها باركود' : 'With Barcode'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{items.filter(i => i.barcode).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {language === 'ar' ? 'لديها وزن' : 'With Weight'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{items.filter(i => i.weight_kg).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'بحث بالـ SKU أو الاسم أو الباركود...' : 'Search by SKU, name, or barcode...'}
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
                <TableHead>SKU</TableHead>
                <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
                <TableHead>{language === 'ar' ? 'الباركود' : 'Barcode'}</TableHead>
                <TableHead>{language === 'ar' ? 'الوزن' : 'Weight'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No items found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{item.sku}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      {item.barcode ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Barcode className="w-3 h-3" />
                          {item.barcode}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {item.weight_kg ? `${item.weight_kg} kg` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

export default ItemsPage;
