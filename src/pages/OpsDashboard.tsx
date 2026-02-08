import { useState, useEffect, useMemo, useCallback } from 'react';
import { useShipments, ShipmentStatus } from '@/hooks/useShipments';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus } from 'lucide-react';
import { addDays } from 'date-fns';

// Dashboard components
import KPICards, { KPIData } from '@/components/dashboard/KPICards';
import StatusCards from '@/components/dashboard/StatusCards';
import TaskInbox, { TaskItem } from '@/components/dashboard/TaskInbox';
import ActivityFeed, { ActivityItem } from '@/components/dashboard/ActivityFeed';
import ShipmentsList from '@/components/dashboard/ShipmentsList';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';

interface CostData {
  shipment_id: string;
  cost_type: string;
  estimate_amount: number | null;
  actual_amount: number | null;
  created_at: string;
}

export default function OpsDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { shipments, loading: shipmentsLoading } = useShipments();
  
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [allCosts, setAllCosts] = useState<CostData[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [costsLoading, setCostsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const t = {
    title: language === 'ar' ? 'مركز العمليات' : 'Operations Command Center',
    subtitle: language === 'ar' ? 'نظرة عامة شاملة على عملياتك اللوجستية' : 'Complete overview of your logistics operations',
    showAnalytics: language === 'ar' ? 'عرض التحليلات' : 'Show Analytics',
    hideAnalytics: language === 'ar' ? 'إخفاء التحليلات' : 'Hide Analytics',
    newShipment: language === 'ar' ? 'شحنة جديدة' : 'New Shipment',
  };

  // Fetch upcoming tasks with priority mapping
  const fetchTasks = useCallback(async () => {
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
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      const taskItems: TaskItem[] = (data || []).map((t: any) => {
        // Determine priority based on due date
        const dueDate = t.due_date ? new Date(t.due_date) : null;
        const now = new Date();
        let priority: TaskItem['priority'] = 'Medium';
        
        if (dueDate) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue < 0) priority = 'High';
          else if (daysUntilDue <= 2) priority = 'High';
          else if (daysUntilDue <= 5) priority = 'Medium';
          else priority = 'Low';
        }

        // Determine type based on title keywords
        let type: TaskItem['type'] = 'Document';
        const titleLower = t.title.toLowerCase();
        if (titleLower.includes('invoice') || titleLower.includes('bill')) type = 'Billing';
        else if (titleLower.includes('approve') || titleLower.includes('confirm')) type = 'Approval';
        else if (titleLower.includes('inventory') || titleLower.includes('stock')) type = 'Inventory';
        else if (titleLower.includes('exception') || titleLower.includes('issue')) type = 'Exception';

        return {
          id: t.id,
          title: t.title,
          type,
          priority,
          dueDate: t.due_date,
          shipmentId: t.shipment_id,
          shipmentTitle: t.shipments?.shipment_plans?.title || 'Shipment',
        };
      });

      // Sort by priority (High first)
      taskItems.sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setTasks(taskItems);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  }, [user]);

  // Fetch recent activities from audit_log and shipment updates
  const fetchActivities = useCallback(async () => {
    if (!user) return;

    try {
      // Get recent shipment updates as activity items
      const { data: recentShipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('id, status, updated_at, plan_id, shipment_plans(title)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (shipmentsError) throw shipmentsError;

      const activityItems: ActivityItem[] = (recentShipments || []).map((s: any) => {
        let tone: ActivityItem['tone'] = 'info';
        let type: ActivityItem['type'] = 'shipment';
        
        if (s.status === 'Delivered') tone = 'success';
        else if (s.status === 'In_Transit') tone = 'warn';

        return {
          id: s.id,
          message: `Shipment ${s.status.replace('_', ' ')}`,
          meta: s.shipment_plans?.title || 'Unknown shipment',
          timestamp: s.updated_at,
          tone,
          type,
        };
      });

      setActivities(activityItems);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  }, [user]);

  // Fetch all costs for KPIs and analytics
  const fetchCosts = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    fetchCosts();
  }, [fetchTasks, fetchActivities, fetchCosts]);

  // Calculate KPI data
  const kpiData: KPIData = useMemo(() => {
    const totalCosts = allCosts.reduce((sum, c) => sum + (c.actual_amount || c.estimate_amount || 0), 0);
    
    return {
      totalShipments: shipments.length,
      inTransitCount: shipments.filter(s => s.status === 'In_Transit').length,
      pendingTasks: tasks.length,
      totalCosts: Math.round(totalCosts),
    };
  }, [shipments, tasks, allCosts]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<ShipmentStatus, number> = {
      Planned: 0,
      Booked: 0,
      In_Transit: 0,
      Cleared: 0,
      Delivered: 0,
    };
    shipments.forEach(s => counts[s.status]++);
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

  const isLoading = shipmentsLoading || tasksLoading || costsLoading;

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? t.hideAnalytics : t.showAnalytics}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards data={kpiData} loading={isLoading} />

        {/* Status Cards */}
        <StatusCards
          counts={statusCounts}
          loading={shipmentsLoading}
          activeStatus={statusFilter}
          onStatusClick={setStatusFilter}
        />

        {/* Analytics Charts (collapsible) */}
        {showAnalytics && (
          <AnalyticsCharts
            shipments={shipments}
            costs={allCosts}
            loading={shipmentsLoading || costsLoading}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shipments List - 2 columns */}
          <div className="lg:col-span-2">
            <ShipmentsList
              shipments={filteredShipments}
              loading={shipmentsLoading}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            <TaskInbox tasks={tasks} loading={tasksLoading} />
            <ActivityFeed activities={activities} loading={activitiesLoading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
