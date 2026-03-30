import { SalesLayout } from '@/components/sales/SalesLayout';
import { useLeads } from '@/hooks/useLeads';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, User, Building2 } from 'lucide-react';
import type { LeadStatus } from '@/types/sales';

const columns: { status: LeadStatus; en: string; ar: string; color: string }[] = [
  { status: 'new', en: 'New', ar: 'جديد', color: 'border-t-blue-500' },
  { status: 'contacted', en: 'Contacted', ar: 'تم التواصل', color: 'border-t-amber-500' },
  { status: 'qualified', en: 'Qualified', ar: 'مؤهل', color: 'border-t-purple-500' },
  { status: 'proposal', en: 'Proposal', ar: 'عرض سعر', color: 'border-t-cyan-500' },
  { status: 'won', en: 'Won', ar: 'فاز', color: 'border-t-emerald-500' },
  { status: 'lost', en: 'Lost', ar: 'خسر', color: 'border-t-red-500' },
];

export default function PipelinePage() {
  const { language } = useLanguage();
  const { leads, loading, updateLead } = useLeads();

  return (
    <SalesLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'ar' ? 'خط أنابيب المبيعات' : 'Sales Pipeline'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'تتبع تقدم العملاء المحتملين' : 'Track lead progression through stages'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
          {columns.map(col => {
            const colLeads = leads.filter(l => l.status === col.status);
            const totalRev = colLeads.reduce((s, l) => s + (l.expected_revenue || 0), 0);
            return (
              <div key={col.status} className="min-w-[200px]">
                <div className={`rounded-t-lg border-t-4 ${col.color} bg-muted/30 p-3 mb-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{language === 'ar' ? col.ar : col.en}</span>
                    <Badge variant="secondary" className="text-xs">{colLeads.length}</Badge>
                  </div>
                  {totalRev > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{(totalRev / 1000).toFixed(0)}K SAR</p>
                  )}
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {colLeads.map(lead => (
                    <Card key={lead.id} className="border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">{lead.name}</span>
                        </div>
                        {lead.company_name && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{lead.company_name}</span>
                          </div>
                        )}
                        {lead.expected_revenue > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">{lead.expected_revenue.toLocaleString()} SAR</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">{lead.source}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {colLeads.length === 0 && !loading && (
                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                      {language === 'ar' ? 'فارغ' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SalesLayout>
  );
}
