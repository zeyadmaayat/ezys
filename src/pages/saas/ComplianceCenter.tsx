import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, ShieldQuestion, Download, Loader2,
  Database, KeyRound, ScrollText, Globe, FileCheck2,
} from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

type ControlStatus = 'implemented' | 'partial' | 'planned';

interface Control {
  id: string;
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
  status: ControlStatus;
  framework: string;
}

const CONTROLS: Control[] = [
  {
    id: 'AC-1',
    framework: 'SOC 2 CC6.1 / ISO 27001 A.9',
    titleEn: 'Role-based access control',
    titleAr: 'التحكم بالوصول حسب الدور',
    detailEn: 'Six roles (admin, operations, warehouse, finance, viewer, user) enforced in the database, not the UI.',
    detailAr: 'ستة أدوار (أدمن، عمليات، مستودع، مالية، مشاهد، مستخدم) مطبّقة على مستوى قاعدة البيانات لا الواجهة.',
    status: 'implemented',
  },
  {
    id: 'AC-2',
    framework: 'SOC 2 CC6.1',
    titleEn: 'Field-level permissions',
    titleAr: 'صلاحيات على مستوى الحقل',
    detailEn: 'Sensitive fields (amounts, costs, driver data) are masked per role with a documented policy matrix.',
    detailAr: 'الحقول الحسّاسة (المبالغ، التكاليف، بيانات السائقين) مخفيّة حسب الدور مع مصفوفة سياسات موثّقة.',
    status: 'implemented',
  },
  {
    id: 'AC-3',
    framework: 'ISO 27001 A.9.4',
    titleEn: 'Manual approval for new accounts',
    titleAr: 'موافقة يدوية للحسابات الجديدة',
    detailEn: 'New sign-ups stay inactive until an administrator approves them; both sides get an email.',
    detailAr: 'الحسابات الجديدة معطّلة حتى يوافق الأدمن، مع إشعار بريدي للطرفين.',
    status: 'implemented',
  },
  {
    id: 'DP-1',
    framework: 'SOC 2 CC6.6',
    titleEn: 'Tenant data isolation',
    titleAr: 'عزل بيانات المستأجرين',
    detailEn: 'Every table enforces row-level security scoped to the company; admins only see their own company.',
    detailAr: 'كل الجداول تطبّق أمن الصفوف حسب الشركة، والأدمن يرى شركته فقط.',
    status: 'implemented',
  },
  {
    id: 'DP-2',
    framework: 'SOC 2 CC7.2',
    titleEn: 'Immutable audit trail',
    titleAr: 'سجل تدقيق غير قابل للتعديل',
    detailEn: 'Who / when / old value / new value recorded for critical actions, exportable for auditors.',
    detailAr: 'تسجيل من ومتى والقيمة القديمة والجديدة للعمليات الحسّاسة، قابل للتصدير للمدققين.',
    status: 'implemented',
  },
  {
    id: 'DP-3',
    framework: 'ISO 27001 A.12.3',
    titleEn: 'Backups and point-in-time recovery',
    titleAr: 'النسخ الاحتياطي والاستعادة الزمنية',
    detailEn: 'Managed daily backups on the hosting platform. Restore drills are not documented yet.',
    detailAr: 'نسخ احتياطي يومي مُدار على منصة الاستضافة. تجارب الاستعادة غير موثّقة بعد.',
    status: 'partial',
  },
  {
    id: 'OP-1',
    framework: 'SOC 2 CC7.3',
    titleEn: 'Security monitoring and alerting',
    titleAr: 'المراقبة والتنبيهات الأمنية',
    detailEn: 'Critical backend errors and access requests trigger email alerts to the platform owner.',
    detailAr: 'الأخطاء الحرجة وطلبات الوصول تُرسل تنبيهات بريدية لمالك المنصة.',
    status: 'implemented',
  },
  {
    id: 'OP-2',
    framework: 'ISO 27001 A.14.2',
    titleEn: 'Security checks in the release pipeline',
    titleAr: 'فحوصات أمنية في خط الإصدار',
    detailEn: 'Cross-company isolation gate blocks merges that introduce a tenant-leak in new database policies.',
    detailAr: 'بوابة العزل بين الشركات تمنع الدمج إذا أدخلت سياسات جديدة ثغرة تسريب بين المستأجرين.',
    status: 'implemented',
  },
  {
    id: 'ID-1',
    framework: 'ISO 27001 A.9.2',
    titleEn: 'Single sign-on (SAML / Entra / Okta)',
    titleAr: 'الدخول الموحّد (SAML / Entra / Okta)',
    detailEn: 'Not enabled yet. Requires the identity provider metadata and verified email domains.',
    detailAr: 'غير مفعّل بعد. يحتاج بيانات مزوّد الهوية والدومينات الموثّقة.',
    status: 'planned',
  },
  {
    id: 'DR-1',
    framework: 'GDPR Art. 44',
    titleEn: 'Data residency selection',
    titleAr: 'اختيار موقع تخزين البيانات',
    detailEn: 'Data currently lives in a single managed region. Per-customer region choice is not available yet.',
    detailAr: 'البيانات مخزّنة حاليًا في منطقة واحدة مُدارة. اختيار المنطقة لكل عميل غير متاح بعد.',
    status: 'planned',
  },
];

const STATUS_META: Record<ControlStatus, { labelEn: string; labelAr: string; icon: typeof ShieldCheck; className: string; weight: number }> = {
  implemented: { labelEn: 'Implemented', labelAr: 'مطبّق', icon: ShieldCheck, className: 'border-primary/40 text-primary', weight: 1 },
  partial: { labelEn: 'Partial', labelAr: 'جزئي', icon: ShieldQuestion, className: 'border-muted-foreground/40 text-muted-foreground', weight: 0.5 },
  planned: { labelEn: 'Planned', labelAr: 'مخطّط', icon: ShieldAlert, className: 'border-destructive/40 text-destructive', weight: 0 },
};

interface AuditRow {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

export default function ComplianceCenter() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [last30, setLast30] = useState(0);
  const [actors, setActors] = useState(0);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [{ count: total }, { count: recent }, { data: latest }] = await Promise.all([
        supabase.from('audit_log').select('*', { count: 'exact', head: true }),
        supabase.from('audit_log').select('*', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('audit_log').select('user_email, created_at').order('created_at', { ascending: false }).limit(500),
      ]);

      setTotalEvents(total ?? 0);
      setLast30(recent ?? 0);
      setActors(new Set((latest ?? []).map((r) => r.user_email).filter(Boolean)).size);
      setLastEventAt(latest?.[0]?.created_at ?? null);
    } catch (error) {
      console.error('Error loading compliance stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadStats();
  }, [isAdmin, loadStats]);

  const exportEvidence = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('id, user_email, action, entity_type, entity_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      exportToCSV<AuditRow>(
        (data ?? []) as AuditRow[],
        [
          { key: 'created_at', header: 'Timestamp (UTC)' },
          { key: 'user_email', header: 'Actor' },
          { key: 'action', header: 'Action' },
          { key: 'entity_type', header: 'Entity type' },
          { key: 'entity_id', header: 'Entity ID' },
          { key: 'id', header: 'Event ID' },
        ],
        `ezys-audit-evidence-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      );
    } catch (error) {
      console.error('Error exporting audit evidence:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!isAdmin) {
    return (
      <SaasLayout>
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{isAr ? 'صلاحية غير كافية' : 'Access Denied'}</h2>
          <p className="text-muted-foreground">
            {isAr ? 'مركز الالتزام متاح للأدمن فقط.' : 'The compliance center is available to administrators only.'}
          </p>
        </div>
      </SaasLayout>
    );
  }

  const score = Math.round(
    (CONTROLS.reduce((sum, c) => sum + STATUS_META[c.status].weight, 0) / CONTROLS.length) * 100,
  );
  const implemented = CONTROLS.filter((c) => c.status === 'implemented').length;

  return (
    <SaasLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{isAr ? 'مركز الالتزام والأمان' : 'Compliance Center'}</h1>
            <p className="text-muted-foreground">
              {isAr
                ? 'حالة الضوابط الأمنية وأدلة التدقيق الجاهزة للمراجعين'
                : 'Security control status and audit-ready evidence for reviewers'}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={exportEvidence} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isAr ? 'تصدير أدلة التدقيق' : 'Export audit evidence'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{isAr ? 'جاهزية الضوابط' : 'Control readiness'}</CardDescription>
              <CardTitle className="text-3xl">{score}%</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={score} />
              <p className="text-xs text-muted-foreground">
                {implemented}/{CONTROLS.length} {isAr ? 'ضابط مطبّق بالكامل' : 'controls fully implemented'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{isAr ? 'إجمالي أحداث التدقيق' : 'Total audit events'}</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalEvents.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <ScrollText className="mr-1 inline h-3 w-3" />
                {isAr ? 'مسجّلة لشركتك' : 'recorded for your company'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{isAr ? 'آخر 30 يوم' : 'Last 30 days'}</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : last30.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {lastEventAt
                  ? `${isAr ? 'آخر حدث' : 'Last event'}: ${format(new Date(lastEventAt), 'MMM d, HH:mm')}`
                  : isAr
                    ? 'لا أحداث بعد'
                    : 'No events yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{isAr ? 'مستخدمون نشِطون بالسجل' : 'Distinct actors'}</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : actors}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <KeyRound className="mr-1 inline h-3 w-3" />
                {isAr ? 'في آخر 500 حدث' : 'across the latest 500 events'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              {isAr ? 'مصفوفة الضوابط' : 'Control matrix'}
            </CardTitle>
            <CardDescription>
              {isAr
                ? 'مطابقة ضوابط المنصة مع بنود SOC 2 و ISO 27001 و GDPR — الحالة معلنة بصدق دون مبالغة.'
                : 'Platform controls mapped to SOC 2, ISO 27001 and GDPR clauses. Status is stated honestly, with no overclaiming.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTROLS.map((control, index) => {
              const meta = STATUS_META[control.status];
              const Icon = meta.icon;
              return (
                <div key={control.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex flex-wrap items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.className.split(' ').pop()}`} />
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{isAr ? control.titleAr : control.titleEn}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">{control.id}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isAr ? control.detailAr : control.detailEn}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">{control.framework}</p>
                    </div>
                    <Badge variant="outline" className={meta.className}>
                      {isAr ? meta.labelAr : meta.labelEn}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                {isAr ? 'موقع البيانات والاحتفاظ' : 'Data residency & retention'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{isAr ? 'منطقة التخزين: منطقة واحدة مُدارة (سحابة المنصة).' : 'Storage region: a single managed cloud region.'}</p>
              <p>{isAr ? 'التشفير: أثناء النقل وفي حالة السكون بشكل افتراضي.' : 'Encryption: in transit and at rest by default.'}</p>
              <p>{isAr ? 'أحداث حكومة الشحن تُنظّف بعد 90 يومًا؛ سجل التدقيق يُحتفظ به.' : 'Governance events are purged after 90 days; audit log is retained.'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                {isAr ? 'خطوات تالية للتدقيق' : 'Next steps for audit'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{isAr ? '١. تفعيل الدخول الموحّد SAML للمؤسسات.' : '1. Enable SAML single sign-on for enterprises.'}</p>
              <p>{isAr ? '٢. توثيق تجربة استعادة النسخ الاحتياطي.' : '2. Document a backup restore drill.'}</p>
              <p>{isAr ? '٣. إضافة اختيار منطقة البيانات لكل عميل.' : '3. Add per-customer data residency選 selection.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SaasLayout>
  );
}
