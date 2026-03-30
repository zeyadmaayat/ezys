import { SalesLayout } from '@/components/sales/SalesLayout';
import { useLeads } from '@/hooks/useLeads';
import { useQuotations } from '@/hooks/useQuotations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, FileText, TrendingUp, DollarSign, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function SalesDashboard() {
  const { language } = useLanguage();
  const { leads } = useLeads();
  const { quotations } = useQuotations();

  const totalRevenue = leads.reduce((sum, l) => sum + (l.expected_revenue || 0), 0);
  const wonLeads = leads.filter(l => l.status === 'won');
  const wonRevenue = wonLeads.reduce((sum, l) => sum + (l.expected_revenue || 0), 0);
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100).toFixed(1) : '0';

  const confirmedQuotations = quotations.filter(q => q.status === 'confirmed');
  const quotationValue = confirmedQuotations.reduce((sum, q) => sum + (q.total_amount || 0), 0);

  const pipelineData = [
    { name: language === 'ar' ? 'جديد' : 'New', value: leads.filter(l => l.status === 'new').length },
    { name: language === 'ar' ? 'تم التواصل' : 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: language === 'ar' ? 'مؤهل' : 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: language === 'ar' ? 'عرض سعر' : 'Proposal', value: leads.filter(l => l.status === 'proposal').length },
    { name: language === 'ar' ? 'فاز' : 'Won', value: wonLeads.length },
    { name: language === 'ar' ? 'خسر' : 'Lost', value: leads.filter(l => l.status === 'lost').length },
  ];

  const sourceData = [
    { name: 'Website', value: leads.filter(l => l.source === 'website').length },
    { name: 'Referral', value: leads.filter(l => l.source === 'referral').length },
    { name: 'Cold Call', value: leads.filter(l => l.source === 'cold_call').length },
    { name: 'Social', value: leads.filter(l => l.source === 'social_media').length },
    { name: 'Exhibition', value: leads.filter(l => l.source === 'exhibition').length },
  ].filter(s => s.value > 0);

  const kpis = [
    { icon: Target, label: language === 'ar' ? 'إجمالي العملاء المحتملين' : 'Total Leads', value: leads.length, color: 'text-blue-500' },
    { icon: DollarSign, label: language === 'ar' ? 'الإيرادات المتوقعة' : 'Expected Revenue', value: `${(totalRevenue / 1000).toFixed(0)}K SAR`, color: 'text-emerald-500' },
    { icon: CheckCircle, label: language === 'ar' ? 'نسبة التحويل' : 'Conversion Rate', value: `${conversionRate}%`, color: 'text-amber-500' },
    { icon: FileText, label: language === 'ar' ? 'عروض الأسعار' : 'Quotations', value: quotations.length, color: 'text-purple-500' },
    { icon: TrendingUp, label: language === 'ar' ? 'الإيرادات المحققة' : 'Won Revenue', value: `${(wonRevenue / 1000).toFixed(0)}K SAR`, color: 'text-green-500' },
    { icon: Users, label: language === 'ar' ? 'عروض مؤكدة' : 'Confirmed Quotes', value: confirmedQuotations.length, color: 'text-cyan-500' },
  ];

  return (
    <SalesLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'ar' ? 'لوحة تحكم المبيعات' : 'Sales Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? 'نظرة عامة على أداء المبيعات' : 'Sales performance overview'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                  <span className="text-xs text-muted-foreground truncate">{kpi.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language === 'ar' ? 'خط أنابيب المبيعات' : 'Sales Pipeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language === 'ar' ? 'مصادر العملاء المحتملين' : 'Lead Sources'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {sourceData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                  {language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SalesLayout>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
