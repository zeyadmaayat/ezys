import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ErpLayout } from '@/components/erp/ErpLayout';
import { useInventory, useInventoryLedger } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Boxes, Package, AlertTriangle, TrendingUp, TrendingDown, Sparkles, ArrowRightLeft, ClipboardCheck, Bell, FileBox, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisionScannerDialog } from '@/components/inventory/VisionScannerDialog';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)'];

export default function InventoryDashboardPage() {
  const { language } = useLanguage();
  const { inventory, loading } = useInventory();
  const { entries: ledger } = useInventoryLedger();
  const [scannerOpen, setScannerOpen] = useState(false);

  const stats = useMemo(() => {
    const totalUnits = inventory.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const totalReserved = inventory.reduce((s, i) => s + Number(i.reserved_quantity || 0), 0);
    const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity < 10);
    const outOfStock = inventory.filter(i => i.quantity <= 0);
    const uniqueItems = new Set(inventory.map(i => i.item_id)).size;
    const uniqueLocations = new Set(inventory.map(i => i.location_id)).size;

    // By location pie
    const byLocation: Record<string, number> = {};
    inventory.forEach(i => {
      const k = i.location?.name || '—';
      byLocation[k] = (byLocation[k] || 0) + Number(i.quantity || 0);
    });
    const locationData = Object.entries(byLocation).map(([name, value]) => ({ name, value }));

    // Top items by quantity
    const itemTotals: Record<string, { name: string; qty: number }> = {};
    inventory.forEach(i => {
      const k = i.item_id;
      if (!itemTotals[k]) itemTotals[k] = { name: i.item?.name || '—', qty: 0 };
      itemTotals[k].qty += Number(i.quantity || 0);
    });
    const topItems = Object.values(itemTotals).sort((a, b) => b.qty - a.qty).slice(0, 8);

    return { totalUnits, totalReserved, lowStock, outOfStock, uniqueItems, uniqueLocations, locationData, topItems };
  }, [inventory]);

  // Movement trend (last 14 days from ledger)
  const trend = useMemo(() => {
    const days: Record<string, { date: string; in: number; out: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      days[k] = { date: k.slice(5), in: 0, out: 0 };
    }
    ledger.forEach(e => {
      const k = (e.created_at || '').slice(0, 10);
      if (days[k]) {
        if (e.quantity > 0) days[k].in += e.quantity;
        else days[k].out += Math.abs(e.quantity);
      }
    });
    return Object.values(days);
  }, [ledger]);

  if (loading) return <ErpLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></ErpLayout>;

  return (
    <ErpLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{language === 'ar' ? 'لوحة المخزون' : 'Inventory Dashboard'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{language === 'ar' ? 'نظرة شاملة وذكاء اصطناعي لإدارة المخزون' : 'Smart overview powered by AI'}</p>
          </div>
          <Button size="lg" onClick={() => setScannerOpen(true)} className="shadow-md">
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'مسح ذكي بالكاميرا' : 'AI Vision Scan'}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={<Boxes className="w-5 h-5" />} label={language === 'ar' ? 'إجمالي الوحدات' : 'Total Units'} value={stats.totalUnits.toLocaleString()} tone="primary" />
          <KPI icon={<Package className="w-5 h-5" />} label={language === 'ar' ? 'منتجات فريدة' : 'Unique Items'} value={stats.uniqueItems.toLocaleString()} tone="secondary" />
          <KPI icon={<AlertTriangle className="w-5 h-5" />} label={language === 'ar' ? 'مخزون منخفض' : 'Low Stock'} value={stats.lowStock.length} tone="warning" />
          <KPI icon={<TrendingDown className="w-5 h-5" />} label={language === 'ar' ? 'نفذ من المخزون' : 'Out of Stock'} value={stats.outOfStock.length} tone="destructive" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <QuickAction to="/erp/inventory" icon={<Boxes className="w-5 h-5" />} label={language === 'ar' ? 'المخزون' : 'Stock'} />
          <QuickAction to="/erp/inventory/transfers" icon={<ArrowRightLeft className="w-5 h-5" />} label={language === 'ar' ? 'النقل' : 'Transfers'} />
          <QuickAction to="/erp/inventory/cycle-count" icon={<ClipboardCheck className="w-5 h-5" />} label={language === 'ar' ? 'الجرد' : 'Cycle Count'} />
          <QuickAction to="/erp/inventory/reorder" icon={<Bell className="w-5 h-5" />} label={language === 'ar' ? 'إعادة الطلب' : 'Reorder'} />
          <QuickAction to="/erp/inventory/batches" icon={<FileBox className="w-5 h-5" />} label={language === 'ar' ? 'الدفعات' : 'Batches'} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{language === 'ar' ? 'الحركات (آخر 14 يوم)' : 'Movements (Last 14 days)'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="in" stroke="hsl(142 71% 45%)" strokeWidth={2} name={language === 'ar' ? 'وارد' : 'In'} />
                  <Line type="monotone" dataKey="out" stroke="hsl(0 84% 60%)" strokeWidth={2} name={language === 'ar' ? 'صادر' : 'Out'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{language === 'ar' ? 'التوزيع حسب الموقع' : 'Stock by Location'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.locationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>
                    {stats.locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top items + Low stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4" />{language === 'ar' ? 'الأكثر مخزوناً' : 'Top Stocked Items'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.topItems} layout="vertical">
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />{language === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[260px] overflow-y-auto">
              {stats.lowStock.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">{language === 'ar' ? '✓ كل شي تمام' : '✓ All good'}</p>}
              {stats.lowStock.map(i => (
                <div key={i.id} className="flex items-center justify-between p-2 rounded-lg border bg-amber-500/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{i.item?.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{i.location?.name}</p>
                  </div>
                  <Badge variant="destructive" className="tabular-nums">{i.quantity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <VisionScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} defaultType="product" />
      </div>
    </ErpLayout>
  );
}

function KPI({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: 'primary' | 'secondary' | 'warning' | 'destructive' }) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary-foreground',
    warning: 'bg-amber-500/10 text-amber-600',
    destructive: 'bg-destructive/10 text-destructive',
  }[tone];
  return (
    <Card className="border shadow-sm hover:shadow-md transition">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to}>
      <Card className="border hover:border-primary/50 hover:shadow-md transition cursor-pointer">
        <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
          <p className="text-sm font-medium">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
