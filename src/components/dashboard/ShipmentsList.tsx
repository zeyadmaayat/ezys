import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shipment, ShipmentStatus } from '@/hooks/useShipments';
import { Package, Search, ArrowRight, Eye } from 'lucide-react';

interface ShipmentsListProps {
  shipments: Shipment[];
  loading?: boolean;
  statusFilter: ShipmentStatus | 'all';
  onStatusFilterChange: (status: ShipmentStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  Planned: 'bg-muted text-muted-foreground',
  Booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  In_Transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Cleared: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_OPTIONS: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];

export default function ShipmentsList({
  shipments,
  loading,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}: ShipmentsListProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = {
    title: language === 'ar' ? 'الشحنات' : 'Shipments',
    search: language === 'ar' ? 'بحث...' : 'Search...',
    allStatuses: language === 'ar' ? 'جميع الحالات' : 'All Statuses',
    noShipments: language === 'ar' ? 'لا توجد شحنات' : 'No shipments found',
    viewDetails: language === 'ar' ? 'عرض' : 'View',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          {t.title} ({shipments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ShipmentStatus | 'all')}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder={t.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shipments List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : shipments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">{t.noShipments}</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {shipments.map(shipment => (
              <div
                key={shipment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_COLORS[shipment.status]}>
                    {shipment.status.replace('_', ' ')}
                  </Badge>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <span>{shipment.shipment_state?.origin_country || '—'}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{shipment.shipment_state?.destination_country || '—'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {shipment.shipment_state?.product_category || '—'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/shipments/${shipment.id}`)}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t.viewDetails}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
