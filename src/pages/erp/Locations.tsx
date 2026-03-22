import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocations } from '@/hooks/useLocations';
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
import { Plus, Search, Download, Warehouse, MapPin, Edit, Trash2 } from 'lucide-react';
import type { Location, LocationType } from '@/types/erp';

const locationTypes: { value: LocationType; labelEn: string; labelAr: string }[] = [
  { value: 'warehouse', labelEn: 'Warehouse', labelAr: 'مستودع' },
  { value: 'distribution_center', labelEn: 'Distribution Center', labelAr: 'مركز توزيع' },
  { value: 'pickup_point', labelEn: 'Pickup Point', labelAr: 'نقطة استلام' },
  { value: 'customer_site', labelEn: 'Customer Site', labelAr: 'موقع العميل' },
];

const LocationsPage = () => {
  const { language } = useLanguage();
  const { locations, loading, createLocation, updateLocation, deleteLocation } = useLocations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location_type: 'warehouse' as LocationType,
    address_line1: '',
    city: '',
    country: 'SA',
  });

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    const locationData = {
      name: formData.name,
      location_type: formData.location_type,
      address_line1: formData.address_line1 || null,
      city: formData.city || null,
      country: formData.country,
    };

    if (editingLocation) {
      await updateLocation(editingLocation.id, locationData);
    } else {
      await createLocation(locationData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      location_type: location.location_type,
      address_line1: location.address_line1 || '',
      city: location.city || '',
      country: location.country,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
      await deleteLocation(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location_type: 'warehouse', address_line1: '', city: '', country: 'SA' });
    setEditingLocation(null);
  };

  const handleExport = () => {
    exportToCSV(filteredLocations, [
      { key: 'name', header: 'Name' },
      { key: 'location_type', header: 'Type' },
      { key: 'city', header: 'City' },
      { key: 'country', header: 'Country' },
    ], 'locations');
  };

  const getTypeLabel = (type: LocationType) => {
    const t = locationTypes.find(lt => lt.value === type);
    return language === 'ar' ? t?.labelAr : t?.labelEn;
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
              <Warehouse className="w-8 h-8 text-primary" />
              {language === 'ar' ? 'المواقع والمستودعات' : 'Locations & Warehouses'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة المواقع ومراكز التوزيع' : 'Manage warehouses and distribution centers'}
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
                  {language === 'ar' ? 'إضافة موقع' : 'Add Location'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLocation
                      ? (language === 'ar' ? 'تعديل الموقع' : 'Edit Location')
                      : (language === 'ar' ? 'موقع جديد' : 'New Location')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{language === 'ar' ? 'الاسم' : 'Name'} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === 'ar' ? 'اسم الموقع' : 'Location name'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                    <Select
                      value={formData.location_type}
                      onValueChange={(v) => setFormData({ ...formData, location_type: v as LocationType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {language === 'ar' ? type.labelAr : type.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                    <Input
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'المدينة' : 'City'}</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                      {editingLocation ? (language === 'ar' ? 'حفظ' : 'Save') : (language === 'ar' ? 'إضافة' : 'Add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {locationTypes.map((type) => (
            <Card key={type.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {language === 'ar' ? type.labelAr : type.labelEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {locations.filter(l => l.location_type === type.value).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ar' ? 'بحث...' : 'Search locations...'}
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
                <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{language === 'ar' ? 'المدينة' : 'City'}</TableHead>
                <TableHead>{language === 'ar' ? 'البلد' : 'Country'}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد مواقع' : 'No locations found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {location.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(location.location_type)}</Badge>
                    </TableCell>
                    <TableCell>{location.city || '—'}</TableCell>
                    <TableCell>{location.country}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)}>
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
    </ErpLayout>
  );
};

export default LocationsPage;
