import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipments, ShipmentStatus, Shipment } from '@/hooks/useShipments';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  FileCheck,
  Search,
  ArrowRight,
  Eye,
  BarChart3,
} from 'lucide-react';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';

interface TaskWithShipment {
  id: string;
  title: string;
  due_date: string;
  shipment_id: string;
  shipment_title: string;
}

interface CostData {
  shipment_id: string;
  cost_type: string;
  estimate_amount: number | null;
  actual_amount: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  Planned: 'bg-muted text-muted-foreground',
  Booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  In_Transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Cleared: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_ICONS: Record<ShipmentStatus, React.ComponentType<{ className?: string }>> = {
  Planned: Clock,
  Booked: FileCheck,
  In_Transit: Truck,
  Cleared: CheckCircle,
  Delivered: Package,
};

const STATUS_OPTIONS: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];

export default function OpsDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shipments, loading: shipmentsLoading } = useShipments();
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithShipment[]>([]);
  const [allCosts, setAllCosts] = useState<CostData[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [costsLoading, setCostsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(true);

  const t = {
    title: language === 'ar' ? 'لوحة العمليات' : 'Operations Dashboard',
    subtitle: language === 'ar' ? 'نظرة عامة على جميع الشحنات والمهام' : 'Overview of all shipments and tasks',
    shipmentsByStatus: language === 'ar' ? 'الشحنات حسب الحالة' : 'Shipments by Status',
    attentionNeeded: language === 'ar' ? 'تحتاج انتباه' : 'Needs Attention',
    upcomingTasks: language === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks',
    next7Days: language === 'ar' ? 'الأيام 7 القادمة' : 'Next 7 days',
    filterByStatus: language === 'ar' ? 'تصفية حسب الحالة' : 'Filter by Status',
    allStatuses: language === 'ar' ? 'جميع الحالات' : 'All Statuses',
    search: language === 'ar' ? 'بحث...' : 'Search...',
    noShipments: language === 'ar' ? 'لا توجد شحنات' : 'No shipments found',
    noTasks: language === 'ar' ? 'لا توجد مهام قادمة' : 'No upcoming tasks',
    viewDetails: language === 'ar' ? 'عرض' : 'View',
    openTasks: language === 'ar' ? 'مهام مفتوحة' : 'open tasks',
    missingDocs: language === 'ar' ? 'مستندات ناقصة' : 'missing docs',
    analytics: language === 'ar' ? 'التحليلات' : 'Analytics',
    showAnalytics: language === 'ar' ? 'عرض التحليلات' : 'Show Analytics',
    hideAnalytics: language === 'ar' ? 'إخفاء التحليلات' : 'Hide Analytics',
  };

  // Fetch upcoming tasks
  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      if (!user) return;

      try {
        const sevenDaysLater = addDays(new Date(), 7);
        const { data, error } = await supabase
          .from('shipment_tasks')
          .select(`
            id,
            title,
            due_date,
            shipment_id,
            shipments!inner(plan_id, shipment_plans(title))
          `)
          .eq('user_id', user.id)
          .eq('status', 'Pending')
          .not('due_date', 'is', null)
          .lte('due_date', sevenDaysLater.toISOString().split('T')[0])
          .order('due_date', { ascending: true });

        if (error) throw error;

        const tasks: TaskWithShipment[] = (data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          shipment_id: t.shipment_id,
          shipment_title: t.shipments?.shipment_plans?.title || 'Unknown Shipment',
        }));

        setUpcomingTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, [user]);

  // Fetch all costs for analytics
  useEffect(() => {
    const fetchAllCosts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('shipment_costs')
          .select('shipment_id, cost_type, estimate_amount, actual_amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAllCosts(data || []);
      } catch (error) {
        console.error('Error fetching costs:', error);
      } finally {
        setCostsLoading(false);
      }
    };

    fetchAllCosts();
  }, [user]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<ShipmentStatus, number> = {
      Planned: 0,
      Booked: 0,
      In_Transit: 0,
      Cleared: 0,
      Delivered: 0,
    };
    shipments.forEach(s => {
      counts[s.status]++;
    });
    return counts;
  }, [shipments]);

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch = !searchQuery || 
        s.shipment_state?.origin_country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shipment_state?.destination_country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shipment_state?.product_category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [shipments, statusFilter, searchQuery]);

  // Shipments needing attention (simplified - would need document/task data for full implementation)
  const attentionShipments = shipments.filter(s => {
    // Simple heuristic: Planned for too long or In Transit for too long
    const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    return (s.status === 'Planned' && daysSinceUpdate > 3) || (s.status === 'In_Transit' && daysSinceUpdate > 7);
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Analytics Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showAnalytics ? t.hideAnalytics : t.showAnalytics}
          </Button>
        </div>

        {/* Analytics Charts */}
        {showAnalytics && (
          <div className="mb-8">
            <AnalyticsCharts 
              shipments={shipments} 
              costs={allCosts} 
              loading={shipmentsLoading || costsLoading} 
            />
          </div>
        )}

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {STATUS_OPTIONS.map(status => {
            const Icon = STATUS_ICONS[status];
            return (
              <Card 
                key={status} 
                className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{status.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold">{statusCounts[status]}</p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Shipments List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShipmentStatus | 'all')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t.filterByStatus} />
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
              </CardContent>
            </Card>

            {/* Shipments List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {language === 'ar' ? 'الشحنات' : 'Shipments'} ({filteredShipments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shipmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : filteredShipments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t.noShipments}</p>
                ) : (
                  <div className="space-y-3">
                    {filteredShipments.map(shipment => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={STATUS_COLORS[shipment.status]}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              <span>{shipment.shipment_state?.origin_country || '—'}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span>{shipment.shipment_state?.destination_country || '—'}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {shipment.shipment_state?.product_category || '—'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/shipments/${shipment.id}`)}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attention Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {t.attentionNeeded}
                  {attentionShipments.length > 0 && (
                    <Badge className="bg-orange-100 text-orange-800">
                      {attentionShipments.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attentionShipments.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attentionShipments.slice(0, 5).map(shipment => (
                      <div
                        key={shipment.id}
                        className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-950/50"
                        onClick={() => navigate(`/shipments/${shipment.id}`)}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>{shipment.shipment_state?.origin_country}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{shipment.shipment_state?.destination_country}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {shipment.status.replace('_', ' ')} • Updated {format(new Date(shipment.updated_at), 'MMM d')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t.upcomingTasks}
                  <span className="text-sm font-normal text-muted-foreground">({t.next7Days})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : upcomingTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">{t.noTasks}</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map(task => {
                      const isOverdue = isBefore(new Date(task.due_date), new Date());
                      return (
                        <div
                          key={task.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isOverdue 
                              ? 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 hover:bg-red-100'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => navigate(`/shipments/${task.shipment_id}`)}
                        >
                          <p className="font-medium text-sm">{task.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">{task.shipment_title}</p>
                            <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-xs">
                              {format(new Date(task.due_date), 'MMM d')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
