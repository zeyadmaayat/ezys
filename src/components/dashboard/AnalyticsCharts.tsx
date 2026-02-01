import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shipment, ShipmentStatus } from '@/hooks/useShipments';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';

interface CostData {
  shipment_id: string;
  cost_type: string;
  estimate_amount: number | null;
  actual_amount: number | null;
  created_at: string;
}

interface AnalyticsChartsProps {
  shipments: Shipment[];
  costs: CostData[];
  loading?: boolean;
}

const STATUS_CHART_COLORS: Record<ShipmentStatus, string> = {
  Planned: 'hsl(var(--muted-foreground))',
  Booked: 'hsl(217 91% 60%)',
  In_Transit: 'hsl(45 93% 47%)',
  Cleared: 'hsl(271 91% 65%)',
  Delivered: 'hsl(142 76% 36%)',
};

export default function AnalyticsCharts({ shipments, costs, loading }: AnalyticsChartsProps) {
  const { language } = useLanguage();

  const t = {
    costTrends: language === 'ar' ? 'اتجاهات التكلفة' : 'Cost Trends',
    shipmentVolume: language === 'ar' ? 'حجم الشحنات' : 'Shipment Volume',
    avgTransitTime: language === 'ar' ? 'متوسط وقت النقل' : 'Avg Transit Time',
    costByType: language === 'ar' ? 'التكلفة حسب النوع' : 'Cost by Type',
    estimate: language === 'ar' ? 'التقدير' : 'Estimate',
    actual: language === 'ar' ? 'الفعلي' : 'Actual',
    days: language === 'ar' ? 'أيام' : 'days',
    noData: language === 'ar' ? 'لا توجد بيانات كافية' : 'Not enough data',
  };

  // Generate last 6 months for x-axis
  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        key: format(date, 'yyyy-MM'),
        label: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      });
    }
    return months;
  }, []);

  // Shipment volume by month
  const volumeData = useMemo(() => {
    return last6Months.map(month => {
      const count = shipments.filter(s => {
        const created = new Date(s.created_at);
        return created >= month.start && created <= month.end;
      }).length;
      return {
        month: month.label,
        count,
      };
    });
  }, [shipments, last6Months]);

  // Cost trends by month (aggregate estimate vs actual)
  const costTrendData = useMemo(() => {
    return last6Months.map(month => {
      const monthCosts = costs.filter(c => {
        const created = new Date(c.created_at);
        return created >= month.start && created <= month.end;
      });
      
      const totalEstimate = monthCosts.reduce((sum, c) => sum + (c.estimate_amount || 0), 0);
      const totalActual = monthCosts.reduce((sum, c) => sum + (c.actual_amount || 0), 0);
      
      return {
        month: month.label,
        estimate: Math.round(totalEstimate),
        actual: Math.round(totalActual),
      };
    });
  }, [costs, last6Months]);

  // Average transit time (Booked → Delivered)
  const transitTimeData = useMemo(() => {
    return last6Months.map(month => {
      const deliveredInMonth = shipments.filter(s => {
        if (s.status !== 'Delivered') return false;
        const updated = new Date(s.updated_at);
        return updated >= month.start && updated <= month.end;
      });

      if (deliveredInMonth.length === 0) {
        return { month: month.label, avgDays: 0 };
      }

      // Approximate: use created_at to updated_at as transit time
      const totalDays = deliveredInMonth.reduce((sum, s) => {
        const days = differenceInDays(new Date(s.updated_at), new Date(s.created_at));
        return sum + Math.max(0, days);
      }, 0);

      return {
        month: month.label,
        avgDays: Math.round(totalDays / deliveredInMonth.length),
      };
    });
  }, [shipments, last6Months]);

  // Cost by type (pie chart data)
  const costByTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    costs.forEach(c => {
      const amount = c.actual_amount || c.estimate_amount || 0;
      typeMap[c.cost_type] = (typeMap[c.cost_type] || 0) + amount;
    });

    const colors = [
      'hsl(217 91% 60%)',   // Blue
      'hsl(142 76% 36%)',   // Green
      'hsl(45 93% 47%)',    // Yellow
      'hsl(271 91% 65%)',   // Purple
      'hsl(0 84% 60%)',     // Red
      'hsl(199 89% 48%)',   // Cyan
      'hsl(24 95% 53%)',    // Orange
    ];

    return Object.entries(typeMap)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name: name.replace('_', ' '),
        value: Math.round(value),
        fill: colors[index % colors.length],
      }));
  }, [costs]);

  const chartConfig = {
    estimate: { label: t.estimate, color: 'hsl(217 91% 60%)' },
    actual: { label: t.actual, color: 'hsl(142 76% 36%)' },
    count: { label: 'Shipments', color: 'hsl(var(--primary))' },
    avgDays: { label: t.avgTransitTime, color: 'hsl(271 91% 65%)' },
  };

  const hasVolumeData = volumeData.some(d => d.count > 0);
  const hasCostData = costTrendData.some(d => d.estimate > 0 || d.actual > 0);
  const hasTransitData = transitTimeData.some(d => d.avgDays > 0);
  const hasCostTypeData = costByTypeData.length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Shipment Volume Over Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t.shipmentVolume}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasVolumeData ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {t.noData}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Cost Trends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-green-600" />
            {t.costTrends}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasCostData ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {t.noData}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={costTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={50} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="estimate" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actual" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Average Transit Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-purple-600" />
            {t.avgTransitTime}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasTransitData ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {t.noData}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={transitTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} unit=" d" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgDays" fill="hsl(271 91% 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Cost by Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-blue-600" />
            {t.costByType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasCostTypeData ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {t.noData}
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={costByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {costByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
