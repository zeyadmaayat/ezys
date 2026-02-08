import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, Package, FileText, DollarSign, Truck, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  message: string;
  meta: string;
  timestamp: string;
  tone: 'info' | 'warn' | 'success' | 'error';
  type?: 'shipment' | 'invoice' | 'payment' | 'alert' | 'general';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const TYPE_ICONS: Record<NonNullable<ActivityItem['type']>, React.ComponentType<{ className?: string }>> = {
  shipment: Truck,
  invoice: FileText,
  payment: DollarSign,
  alert: AlertTriangle,
  general: Package,
};

const TONE_COLORS: Record<ActivityItem['tone'], string> = {
  info: 'bg-blue-100 dark:bg-blue-900/30',
  warn: 'bg-yellow-100 dark:bg-yellow-900/30',
  success: 'bg-green-100 dark:bg-green-900/30',
  error: 'bg-red-100 dark:bg-red-900/30',
};

const TONE_ICON_COLORS: Record<ActivityItem['tone'], string> = {
  info: 'text-blue-600',
  warn: 'text-yellow-600',
  success: 'text-green-600',
  error: 'text-red-600',
};

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'ar' ? 'آخر الأنشطة' : 'Recent Activity',
    noActivity: language === 'ar' ? 'لا توجد أنشطة حديثة' : 'No recent activity',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            {t.noActivity}
          </p>
        ) : (
          <div className="space-y-1 max-h-[320px] overflow-y-auto">
            {activities.map((activity, index) => {
              const Icon = TYPE_ICONS[activity.type || 'general'];
              const isLast = index === activities.length - 1;
              
              return (
                <div
                  key={activity.id}
                  className="flex gap-3 py-2"
                >
                  <div className="relative flex flex-col items-center">
                    <div className={`p-1.5 rounded-full ${TONE_COLORS[activity.tone]}`}>
                      <Icon className={`h-3 w-3 ${TONE_ICON_COLORS[activity.tone]}`} />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-sm font-medium leading-tight">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.meta} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
