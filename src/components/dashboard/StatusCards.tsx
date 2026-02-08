import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShipmentStatus } from '@/hooks/useShipments';
import { Clock, FileCheck, Truck, CheckCircle, Package } from 'lucide-react';

interface StatusCardsProps {
  counts: Record<ShipmentStatus, number>;
  loading?: boolean;
  activeStatus: ShipmentStatus | 'all';
  onStatusClick: (status: ShipmentStatus | 'all') => void;
}

const STATUS_ICONS: Record<ShipmentStatus, React.ComponentType<{ className?: string }>> = {
  Planned: Clock,
  Booked: FileCheck,
  In_Transit: Truck,
  Cleared: CheckCircle,
  Delivered: Package,
};

const STATUS_COLORS: Record<ShipmentStatus, { bg: string; icon: string }> = {
  Planned: { bg: 'bg-gray-50 dark:bg-gray-900/30', icon: 'text-gray-600' },
  Booked: { bg: 'bg-blue-50 dark:bg-blue-900/30', icon: 'text-blue-600' },
  In_Transit: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', icon: 'text-yellow-600' },
  Cleared: { bg: 'bg-purple-50 dark:bg-purple-900/30', icon: 'text-purple-600' },
  Delivered: { bg: 'bg-green-50 dark:bg-green-900/30', icon: 'text-green-600' },
};

const STATUS_OPTIONS: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];

export default function StatusCards({ counts, loading, activeStatus, onStatusClick }: StatusCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {STATUS_OPTIONS.map(status => {
        const Icon = STATUS_ICONS[status];
        const colors = STATUS_COLORS[status];
        const isActive = activeStatus === status;

        return (
          <Card
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isActive ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => onStatusClick(activeStatus === status ? 'all' : status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold mt-1">{counts[status]}</p>
                </div>
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
