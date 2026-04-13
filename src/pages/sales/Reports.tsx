import { SalesLayout } from '@/components/sales/SalesLayout';
import { useLeads } from '@/hooks/useLeads';
import { useQuotations } from '@/hooks/useQuotations';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Target, DollarSign, Users, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function SalesReportsPage() {
  const { language } = useLanguage();
  const { leads } = useLeads();
  const { quotations } = useQuotations();
  const { products, categories } = useProducts();

  const wonLeads = leads.filter(l => l.status === 'won');
  const lostLeads = leads.filter(l => l.status === 'lost');
  const totalRevenue = wonLeads.reduce((s, l) => s + (l.expected_revenue || 0), 0);
  const pipelineRevenue = leads.filter(l => !['won', 'lost'].includes(l.status)).reduce((s, l) => s + (l.expected_revenue || 0), 0);
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100) : 0;
  const avgDealSize = wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0;

  const confirmedQuotes = quotations.filter(q => q.status === 'confirmed');
  const quoteConversion = quotations.length > 0 ? ((confirmedQuotes.length / quotations.length) * 100) : 0;

  // Product category breakdown
  const categoryData = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
  }));

  // Lead source performance
  const sources = ['website', 'referral', 'cold_call', 'social_media', 'exhibition'];
  const sourcePerformance = sources.map(src => {
    const srcLeads = leads.filter(l => l.source === src);
    const srcWon = srcLeads.filter(l => l.status === 'won');
    return {
      name: src.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      total: srcLeads.length,
      won: srcWon.length,
      revenue: srcWon.reduce((s, l) => s + (l.expected_revenue || 0), 0),
    };
  }).filter(s => s.total > 0);

  // Pipeline funnel
  const funnelStages = [
    { stage: 'New', count: leads.filter(l => l.status === 'new').length },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { stage: 'Proposal', count: leads.filter(l => l.status === 'proposal').length },
    { stage: 'Won', count: wonLeads.length },
  ];

  // Quotation status breakdown
  const quoteStatusData = [
    { name: 'Draft', value: quotations.filter(q => q.status === 'draft').length },
    { name: 'Sent', value: quotations.filter(q => q.status === 'sent').length },
    { name: 'Confirmed', value: confirmedQuotes.length },
    { name: 'Cancelled', value: quotations.filter(q => q.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  const kpis = [
    { icon: DollarSign, label: language === 'ar' ? 'الإيرادات المحققة' : 'Won Revenue', value: `${(totalRevenue / 1000).toFixed(1)}K`, color: 'text-emerald-500' },
    { icon: TrendingUp, label: language === 'ar' ? 'خط الأنابيب' : 'Pipeline Value', value: `${(pipelineRevenue / 1000).toFixed(1)}K`, color: 'text-blue-500' },
    { icon: Target, label: language === 'ar' ? 'نسبة التحويل' : 'Win Rate', value: `${conversionRate.toFixed(1)}%`, color: 'text-amber-500' },
    { icon: Users, label: language === 'ar' ? 'متوسط الصفقة' : 'Avg Deal Size', value: `${avgDealSize.toFixed(0)}`, color: 'text-purple-500' },
    { icon: BarChart3, label: language === 'ar' ? 'تحويل العروض' : 'Quote Conversion', value: `${quoteConversion.toFixed(1)}%`, color: 'text-cyan-500' },
    { icon: PieIcon, label: language === 'ar' ? 'المنتجات' : 'Products', value: products.length, color: 'text-orange-500' },
  ];

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Leads', leads.length],
      ['Won Leads', wonLeads.length],
      ['Lost Leads', lostLeads.length],
      ['Won Revenue', totalRevenue],
      ['Pipeline Revenue', pipelineRevenue],
      ['Win Rate', `${conversionRate.toFixed(1)}%`],
      ['Total Quotations', quotations.length],
      ['Confirmed Quotations', confirmedQuotes.length],
      ['Total Products', products.length],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SalesLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'تقارير المبيعات' : 'Sales Reports'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'تحليلات وإحصائيات شاملة' : 'Comprehensive analytics & insights'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                  <span className="text-[10px] text-muted-foreground truncate">{kpi.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'قمع المبيعات' : 'Sales Funnel'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnelStages}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="stage" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'حالة العروض' : 'Quotation Status'}</CardTitle></CardHeader>
            <CardContent>
              {quoteStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={quoteStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {quoteStatusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                  {language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'أداء المصادر' : 'Source Performance'}</CardTitle></CardHeader>
            <CardContent>
              {sourcePerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sourcePerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="won" name="Won" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'المنتجات حسب الفئة' : 'Products by Category'}</CardTitle></CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, count }) => `${name}: ${count}`}>
                      {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top leads table */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{language === 'ar' ? 'أعلى الصفقات' : 'Top Deals'}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">{language === 'ar' ? 'الشركة' : 'Company'}</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">{language === 'ar' ? 'المصدر' : 'Source'}</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .sort((a, b) => (b.expected_revenue || 0) - (a.expected_revenue || 0))
                    .slice(0, 10)
                    .map(lead => (
                      <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium">{lead.name}</td>
                        <td className="p-3 text-muted-foreground">{lead.company_name || '—'}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{lead.source}</Badge></td>
                        <td className="p-3 font-medium">{(lead.expected_revenue || 0).toLocaleString()} JD</td>
                        <td className="p-3"><Badge variant="secondary" className="text-[10px] capitalize">{lead.status}</Badge></td>
                      </tr>
                    ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No leads yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SalesLayout>
  );
}
