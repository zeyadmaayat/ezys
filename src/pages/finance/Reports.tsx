import { useMemo, useState } from 'react';
import { FinanceLayout } from '@/components/finance/FinanceLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoicesV2 } from '@/hooks/useInvoicesV2';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--ezy-blue-light))',
  'hsl(var(--accent-foreground))',
];

export default function ReportsPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { invoices, loading: invLoading } = useInvoicesV2();
  const { expenses, loading: expLoading } = useExpenses();
  const [period, setPeriod] = useState('6');

  const loading = invLoading || expLoading;
  const months = parseInt(period);

  const monthlyData = useMemo(() => {
    const data: { month: string; revenue: number; expenses: number; profit: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const label = format(date, 'MMM yyyy');

      const rev = invoices
        .filter(inv => inv.status === 'Paid' && inv.paid_at && isWithinInterval(new Date(inv.paid_at), { start, end }))
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      const exp = expenses
        .filter(e => isWithinInterval(new Date(e.expense_date), { start, end }))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      data.push({ month: label, revenue: rev, expenses: exp, profit: rev - exp });
    }
    return data;
  }, [invoices, expenses, months]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  if (loading) {
    return <FinanceLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></FinanceLayout>;
  }

  return (
    <FinanceLayout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {isRTL ? 'التقارير المالية' : 'Financial Reports'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? 'تحليلات الإيرادات والمصاريف والأرباح' : 'Revenue, expenses & profit analytics'}
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">{isRTL ? '3 أشهر' : '3 Months'}</SelectItem>
              <SelectItem value="6">{isRTL ? '6 أشهر' : '6 Months'}</SelectItem>
              <SelectItem value="12">{isRTL ? '12 شهر' : '12 Months'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
              <p className="text-2xl font-bold mt-1 text-green-600 flex items-center gap-1">
                <TrendingUp className="h-5 w-5" />{totalRevenue.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'إجمالي المصاريف' : 'Total Expenses'}</p>
              <p className="text-2xl font-bold mt-1 text-red-600 flex items-center gap-1">
                <TrendingDown className="h-5 w-5" />{totalExpenses.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span>
              </p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-primary' : 'border-l-red-500'}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{isRTL ? 'صافي الربح' : 'Net Profit'}</p>
              <p className={`text-2xl font-bold mt-1 flex items-center gap-1 ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                <DollarSign className="h-5 w-5" />{netProfit.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">{isRTL ? 'الإيرادات مقابل المصاريف' : 'Revenue vs Expenses'}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name={isRTL ? 'الإيرادات' : 'Revenue'} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={isRTL ? 'المصاريف' : 'Expenses'} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profit Trend */}
          <Card>
            <CardHeader><CardTitle className="text-base">{isRTL ? 'اتجاه الربح' : 'Profit Trend'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" name={isRTL ? 'الربح' : 'Profit'} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card>
            <CardHeader><CardTitle className="text-base">{isRTL ? 'المصاريف حسب الفئة' : 'Expenses by Category'}</CardTitle></CardHeader>
            <CardContent>
              {expenseByCategory.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                  {isRTL ? 'لا توجد بيانات' : 'No data available'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FinanceLayout>
  );
}
