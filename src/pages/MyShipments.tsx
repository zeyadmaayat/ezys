import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipments, ShipmentStatus } from '@/hooks/useShipments';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ArrowRight, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  Planned: 'bg-muted text-muted-foreground',
  Booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  In_Transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Cleared: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_OPTIONS: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];

export default function MyShipments() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { shipments, loading, updateShipmentStatus, deleteShipment } = useShipments();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = async (shipmentId: string, status: ShipmentStatus) => {
    await updateShipmentStatus(shipmentId, status);
  };

  const handleDelete = async (shipmentId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this shipment?')) {
      setDeletingId(shipmentId);
      await deleteShipment(shipmentId);
      setDeletingId(null);
    }
  };

  const t = {
    title: language === 'ar' ? 'شحناتي' : 'My Shipments',
    subtitle: language === 'ar' ? 'تتبع وإدارة شحناتك النشطة' : 'Track and manage your active shipments',
    noShipments: language === 'ar' ? 'لا توجد شحنات بعد' : 'No shipments yet',
    createFirst: language === 'ar' ? 'أنشئ شحنة من خطة شحن مكتملة' : 'Create a shipment from a completed shipment plan',
    goToPlanner: language === 'ar' ? 'الذهاب إلى المخطط' : 'Go to Planner',
    route: language === 'ar' ? 'المسار' : 'Route',
    product: language === 'ar' ? 'المنتج' : 'Product',
    status: language === 'ar' ? 'الحالة' : 'Status',
    lastUpdated: language === 'ar' ? 'آخر تحديث' : 'Last Updated',
    actions: language === 'ar' ? 'الإجراءات' : 'Actions',
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{t.noShipments}</p>
                <p className="text-muted-foreground mb-4">{t.createFirst}</p>
                <Button onClick={() => navigate('/logistics-assistant')}>
                  {t.goToPlanner}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.route}</TableHead>
                    <TableHead>{t.product}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.lastUpdated}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map(shipment => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {shipment.shipment_state?.origin_country || '—'}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {shipment.shipment_state?.destination_country || '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {shipment.shipment_state?.product_category || '—'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => handleStatusChange(shipment.id, value as ShipmentStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              <Badge className={STATUS_COLORS[shipment.status]}>
                                {shipment.status.replace('_', ' ')}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(status => (
                              <SelectItem key={status} value={status}>
                                <Badge className={STATUS_COLORS[status]}>
                                  {status.replace('_', ' ')}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(shipment.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/shipments/${shipment.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'عرض' : 'View'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(shipment.id)}
                            disabled={deletingId === shipment.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
