import { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpDrivers } from '@/hooks/useDpDrivers';
import { useDpDriverRiskScores } from '@/hooks/useDpDriverRiskScores';
import { useDpRiskAlerts } from '@/hooks/useDpRiskAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, Shield, AlertTriangle, Users, Clock, DollarSign,
  RotateCcw, ArrowUpDown, Ban
} from 'lucide-react';
import { format } from 'date-fns';

const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  LATE_DELIVERY: { label: 'Late Delivery', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
  CASH_MISMATCH: { label: 'Cash Mismatch', color: 'bg-red-100 text-red-700 border-red-300', icon: DollarSign },
  EXCESSIVE_RETURNS: { label: 'Excessive Returns', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: RotateCcw },
  FINANCIAL_ESCALATION: { label: 'Financial Escalation', color: 'bg-rose-100 text-rose-800 border-rose-400', icon: AlertTriangle },
  AUTO_SUSPENDED: { label: 'Auto Suspended', color: 'bg-red-200 text-red-900 border-red-500', icon: Ban },
};

export default function DpRiskDashboard() {
  const { drivers, loading: driversLoading } = useDpDrivers();
  const { scores, loading: scoresLoading, getScore } = useDpDriverRiskScores();
  const { alerts, loading: alertsLoading } = useDpRiskAlerts();
  const [sortBy, setSortBy] = useState<'risk' | 'name'>('risk');
  const [filterSuspended, setFilterSuspended] = useState<string>('ALL');
  const [alertFilter, setAlertFilter] = useState<string>('ALL');

  const loading = driversLoading || scoresLoading || alertsLoading;

  const driversWithRisk = useMemo(() => {
    const mapped = drivers.map(d => ({
      ...d,
      riskScore: getScore(d.id),
      alerts: alerts.filter(a => a.driver_id === d.id),
    }));

    let filtered = mapped;
    if (filterSuspended === 'SUSPENDED') filtered = mapped.filter(d => !d.is_active);
    else if (filterSuspended === 'ACTIVE') filtered = mapped.filter(d => d.is_active);

    return filtered.sort((a, b) =>
      sortBy === 'risk' ? b.riskScore - a.riskScore : a.name.localeCompare(b.name)
    );
  }, [drivers, scores, alerts, sortBy, filterSuspended, getScore]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'ALL') return alerts;
    return alerts.filter(a => a.alert_type === alertFilter);
  }, [alerts, alertFilter]);

  // Summary stats
  const suspendedCount = drivers.filter(d => !d.is_active).length;
  const highRiskCount = drivers.filter(d => getScore(d.id) >= 80).length;
  const lateAlerts = alerts.filter(a => a.alert_type === 'LATE_DELIVERY').length;
  const cashAlerts = alerts.filter(a => a.alert_type === 'CASH_MISMATCH').length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            Risk & Governance
          </h1>
          <p className="text-muted-foreground">Executive operational control — Domestic Pro</p>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspended Drivers</CardTitle>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-sm">
                <Ban className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Drivers</CardTitle>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{highRiskCount}</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Late Deliveries</CardTitle>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{lateAlerts}</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash Mismatches</CardTitle>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-sm">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{cashAlerts}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="drivers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="drivers" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Driver Risk</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">{alerts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Driver Risk Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex gap-3">
              <Select value={filterSuspended} onValueChange={setFilterSuspended}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Drivers</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended Only</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setSortBy(s => s === 'risk' ? 'name' : 'risk')}>
                <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
                Sort by {sortBy === 'risk' ? 'Name' : 'Risk Score'}
              </Button>
            </div>

            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Late Deliveries</TableHead>
                    <TableHead>Excessive Returns</TableHead>
                    <TableHead>Cash Mismatches</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversWithRisk.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No drivers found</TableCell></TableRow>
                  ) : driversWithRisk.map(d => {
                    const lateCount = d.alerts.filter(a => a.alert_type === 'LATE_DELIVERY').length;
                    const returnCount = d.alerts.filter(a => a.alert_type === 'EXCESSIVE_RETURNS').length;
                    const cashCount = d.alerts.filter(a => a.alert_type === 'CASH_MISMATCH').length;
                    const riskColor = d.riskScore >= 100 ? 'text-red-600 bg-red-50' : d.riskScore >= 80 ? 'text-amber-600 bg-amber-50' : 'text-foreground';

                    return (
                      <TableRow key={d.id} className={!d.is_active ? 'bg-red-50/30 dark:bg-red-950/10' : ''}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-sm ${riskColor}`}>
                            {d.riskScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!d.is_active ? (
                            <Badge variant="destructive" className="gap-1">
                              <Ban className="h-3 w-3" /> Suspended
                            </Badge>
                          ) : d.riskScore >= 80 ? (
                            <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" /> At Risk
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{lateCount || '—'}</TableCell>
                        <TableCell className="text-center">{returnCount || '—'}</TableCell>
                        <TableCell className="text-center">{cashCount || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex gap-3">
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Alert Types</SelectItem>
                  {Object.entries(ALERT_TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No alerts</TableCell></TableRow>
                  ) : filteredAlerts.map(a => {
                    const config = ALERT_TYPE_CONFIG[a.alert_type] || { label: a.alert_type, color: 'bg-muted text-foreground', icon: AlertTriangle };
                    const driver = drivers.find(d => d.id === a.driver_id);
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge variant="outline" className={`${config.color} border gap-1`}>
                            <config.icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{a.message || '—'}</TableCell>
                        <TableCell className="font-medium">{driver?.name || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{a.shipment_id?.slice(0, 8) || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.created_at ? format(new Date(a.created_at), 'MMM d, HH:mm') : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
