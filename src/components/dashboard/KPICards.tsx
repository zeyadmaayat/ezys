import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Package, 
  Truck, 
  DollarSign, 
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface KPIData {
  totalShipments: number;
  inTransitCount: number;
  pendingTasks: number;
  totalCosts: number;
  deltaShipments?: number;
  deltaCosts?: number;
}

interface KPICardsProps {
  data: KPIData;
  loading?: boolean;
}

export default function KPICards({ data, loading }: KPICardsProps) {
  const { language } = useLanguage();

  const kpis = [
    {
      label: language === 'ar' ? 'إجمالي الشحنات' : 'Total Shipments',
      value: data.totalShipments,
      delta: data.deltaShipments,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: language === 'ar' ? 'في الطريق' : 'In Transit',
      value: data.inTransitCount,
      icon: Truck,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      label: language === 'ar' ? 'مهام معلقة' : 'Pending Tasks',
      value: data.pendingTasks,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: language === 'ar' ? 'إجمالي التكاليف' : 'Total Costs',
      value: `$${data.totalCosts.toLocaleString()}`,
      delta: data.deltaCosts,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      isMonetary: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const hasPositiveDelta = kpi.delta && kpi.delta > 0;
        const hasNegativeDelta = kpi.delta && kpi.delta < 0;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  {kpi.value}
                </span>
                {kpi.delta !== undefined && kpi.delta !== 0 && (
                  <span className={`flex items-center text-xs font-medium mb-1 ${
                    hasPositiveDelta 
                      ? 'text-green-600' 
                      : hasNegativeDelta 
                        ? 'text-red-600' 
                        : ''
                  }`}>
                    {hasPositiveDelta ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(kpi.delta)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
