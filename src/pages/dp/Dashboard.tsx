import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/hooks/useCompany';
import { useDpDashboardStats } from '@/hooks/useDpDashboardStats';
import { DpLayout } from '@/components/dp/DpLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package, Truck, CheckCircle, ArrowRight, Loader2,
  Users, Warehouse, ScanBarcode, DollarSign, XCircle, RotateCcw,
  Shield, AlertTriangle, Clock, Ban
} from 'lucide-react';

export default function DpDashboard() {
  const navigate = useNavigate();
  const { company, loading: companyLoading, hasCompany } = useCompany();
  const { stats, loading: statsLoading } = useDpDashboardStats();

  useEffect(() => {
    if (!companyLoading && !hasCompany) navigate('/saas/setup');
  }, [companyLoading, hasCompany, navigate]);

  if (companyLoading || statsLoading) {
    return (
      <DpLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DpLayout>
    );
  }

  if (!company) return null;

  const statusCards = [
    { title: 'Total Shipments', value: stats.totalShipments, icon: Package, gradient: 'from-blue-500 to-blue-700' },
    { title: 'Created', value: stats.created, icon: Package, gradient: 'from-slate-400 to-slate-600' },
    { title: 'Picked Up', value: stats.pickedUp, icon: Truck, gradient: 'from-amber-400 to-amber-600' },
    { title: 'In Transit', value: stats.inTransit, icon: Truck, gradient: 'from-orange-400 to-orange-600' },
    { title: 'Delivered', value: stats.delivered, icon: CheckCircle, gradient: 'from-emerald-400 to-emerald-600' },
    { title: 'Returned', value: stats.returned, icon: RotateCcw, gradient: 'from-red-400 to-red-600' },
    { title: 'Cancelled', value: stats.cancelled, icon: XCircle, gradient: 'from-gray-400 to-gray-600' },
    { title: 'COD Pending', value: `${stats.totalCodPending.toLocaleString()} SAR`, icon: DollarSign, gradient: 'from-yellow-400 to-yellow-600' },
  ];

  const governanceCards = [
    { title: 'Suspended Drivers', value: stats.suspendedDrivers, icon: Ban, gradient: 'from-red-500 to-red-700', color: 'text-red-600' },
    { title: 'Open Risk Alerts', value: stats.openRiskAlerts, icon: AlertTriangle, gradient: 'from-amber-500 to-amber-700', color: 'text-amber-600' },
    { title: 'Late Deliveries', value: stats.lateDeliveries, icon: Clock, gradient: 'from-orange-400 to-orange-600', color: '' },
    { title: 'High Risk Drivers', value: stats.highRiskDrivers, icon: Shield, gradient: 'from-rose-400 to-rose-600', color: 'text-rose-600' },
    { title: 'COD Variance', value: `${stats.totalCodVariance.toLocaleString()} SAR`, icon: DollarSign, gradient: 'from-purple-400 to-purple-600', color: stats.totalCodVariance < 0 ? 'text-red-600' : stats.totalCodVariance > 0 ? 'text-amber-600' : 'text-emerald-600' },
  ];

  const quickLinks = [
    { label: 'Shipments', icon: Package, path: '/dp/shipments' },
    { label: 'Drivers', icon: Users, path: '/dp/drivers' },
    { label: 'Warehouse', icon: Warehouse, path: '/dp/warehouse' },
    { label: 'Inventory', icon: ScanBarcode, path: '/dp/inventory' },
    { label: 'COD Settlements', icon: DollarSign, path: '/dp/cod' },
    { label: 'Risk & Governance', icon: Shield, path: '/dp/risk' },
  ];

  return (
    <DpLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Domestic Pro</h1>
            <p className="text-muted-foreground">{company.name} — Domestic shipment operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dp/drivers')}>
              <Users className="mr-2 h-4 w-4" /> Drivers
            </Button>
            <Button onClick={() => navigate('/dp/shipments')}>
              <Package className="mr-2 h-4 w-4" /> Shipments
            </Button>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => (
            <Card key={card.title} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Governance KPIs */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" /> Risk & Governance
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {governanceCards.map((card) => (
              <Card key={card.title} className="border-border/60 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dp/risk')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${card.color || 'text-foreground'}`}>{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Driver Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Driver Fleet</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-foreground">{stats.totalDrivers}</div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">{stats.activeDrivers}</div>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="outline"
                  className="justify-between h-auto py-3"
                  onClick={() => navigate(link.path)}
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="h-4 w-4 text-primary" />
                    {link.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DpLayout>
  );
}
