import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/hooks/useCompany';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  FileText, 
  DollarSign,
  Plus,
  Loader2,
  ArrowRight,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SaaSDashboard() {
  const navigate = useNavigate();
  const { company, loading: companyLoading, hasCompany } = useCompany();
  const { stats, loading: statsLoading } = useDashboardStats();
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-data');
      if (error) throw error;
      toast.success('تم إضافة البيانات التجريبية بنجاح!', {
        description: `تم إنشاء: ${Object.entries(data.results || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
      });
      // Refresh page to show new data
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error('فشل في إضافة البيانات', { description: err.message });
    } finally {
      setSeeding(false);
    }
  };

  // Redirect to setup if no company
  useEffect(() => {
    if (!companyLoading && !hasCompany) {
      navigate('/saas/setup');
    }
  }, [companyLoading, hasCompany, navigate]);

  if (companyLoading || statsLoading) {
    return (
      <SaasLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SaasLayout>
    );
  }

  if (!company) {
    return null;
  }

  const statCards = [
    { 
      title: 'Total Shipments', 
      value: stats.totalShipments, 
      icon: Package, 
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/50'
    },
    { 
      title: 'Created', 
      value: stats.createdCount, 
      icon: Package, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    { 
      title: 'In Transit', 
      value: stats.inTransitCount, 
      icon: Truck, 
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950/50'
    },
    { 
      title: 'Delivered', 
      value: stats.deliveredCount, 
      icon: CheckCircle, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950/50'
    },
    { 
      title: 'Pending Invoices', 
      value: stats.pendingInvoices, 
      icon: FileText, 
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950/50'
    },
    { 
      title: 'Total Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/50'
    },
  ];

  return (
    <SaasLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">
              Plan: <span className="capitalize">{company.plan}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSeedData} disabled={seeding}>
              {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              {seeding ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية'}
            </Button>
            <Button asChild>
              <Link to="/saas/shipments/new">
                <Plus className="mr-2 h-4 w-4" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/saas/shipments')}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">Shipments</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/saas/clients')}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Clients</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/saas/warehouses')}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">Warehouses</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/saas/invoices')}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">Invoices</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    </SaasLayout>
  );
}
