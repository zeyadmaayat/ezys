import { useLanguage } from '@/contexts/LanguageContext';
import { useRequisitions } from '@/hooks/useRequisitions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useGoodsReceipts } from '@/hooks/useGoodsReceipts';
import { useReturnOrders } from '@/hooks/useReturnOrders';
import { useBlanketOrders } from '@/hooks/useBlanketOrders';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText, ShoppingCart, PackageCheck, RotateCcw, RefreshCw,
  ArrowRight, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  BarChart3
} from 'lucide-react';

const ProcurementDashboard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { requisitions, loading: prLoading } = useRequisitions();
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders();
  const { receipts, loading: grnLoading } = useGoodsReceipts();
  const { returnOrders, loading: rtvLoading } = useReturnOrders();
  const { blanketOrders, loading: blkLoading } = useBlanketOrders();

  const loading = prLoading || poLoading || grnLoading || rtvLoading || blkLoading;

  // PR stats
  const prDraft = requisitions.filter(r => r.status === 'Draft').length;
  const prSubmitted = requisitions.filter(r => r.status === 'Submitted').length;
  const prApproved = requisitions.filter(r => r.status === 'Approved').length;
  const prConverted = requisitions.filter(r => r.status === 'Converted').length;

  // PO stats
  const poDraft = purchaseOrders.filter(p => p.status === 'Draft').length;
  const poSent = purchaseOrders.filter(p => p.status === 'Sent').length;
  const poPartial = purchaseOrders.filter(p => p.status === 'Partially_Received').length;
  const poReceived = purchaseOrders.filter(p => p.status === 'Received').length;
  const poTotalValue = purchaseOrders.reduce((s, p) => s + p.total_amount, 0);
  const poOpenValue = purchaseOrders
    .filter(p => !['Received', 'Closed', 'Cancelled'].includes(p.status))
    .reduce((s, p) => s + p.total_amount, 0);

  // GRN stats
  const grnDraft = receipts.filter(r => r.status === 'Draft').length;
  const grnPosted = receipts.filter(r => r.status === 'Posted').length;

  // RTV stats
  const rtvOpen = returnOrders.filter(r => !['Closed', 'Credited'].includes(r.status)).length;
  const rtvCredited = returnOrders.filter(r => r.status === 'Credited').length;

  // BLK stats
  const blkActive = blanketOrders.filter(b => b.status === 'Active').length;
  const blkTotalValue = blanketOrders.reduce((s, b) => s + b.total_contract_value, 0);

  // Pipeline progress
  const totalPR = requisitions.length;
  const convertedPct = totalPR > 0 ? Math.round((prConverted / totalPR) * 100) : 0;
  const totalPO = purchaseOrders.length;
  const receivedPct = totalPO > 0 ? Math.round((poReceived / totalPO) * 100) : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  const modules = [
    {
      icon: FileText,
      title: language === 'ar' ? 'طلبات الشراء' : 'Requisitions (PR)',
      color: 'from-violet-500 to-violet-700',
      stats: [
        { label: language === 'ar' ? 'مسودة' : 'Draft', value: prDraft, variant: 'secondary' as const },
        { label: language === 'ar' ? 'قيد الموافقة' : 'Pending', value: prSubmitted, variant: 'default' as const },
        { label: language === 'ar' ? 'معتمد' : 'Approved', value: prApproved, variant: 'default' as const },
        { label: language === 'ar' ? 'محوّل' : 'Converted', value: prConverted, variant: 'outline' as const },
      ],
      total: totalPR,
      action: () => navigate('/erp/requisitions'),
    },
    {
      icon: ShoppingCart,
      title: language === 'ar' ? 'أوامر الشراء' : 'Purchase Orders (PO)',
      color: 'from-blue-500 to-blue-700',
      stats: [
        { label: language === 'ar' ? 'مسودة' : 'Draft', value: poDraft, variant: 'secondary' as const },
        { label: language === 'ar' ? 'مرسل' : 'Sent', value: poSent, variant: 'default' as const },
        { label: language === 'ar' ? 'جزئي' : 'Partial', value: poPartial, variant: 'default' as const },
        { label: language === 'ar' ? 'مستلم' : 'Received', value: poReceived, variant: 'outline' as const },
      ],
      total: totalPO,
      action: () => navigate('/erp/purchase-orders'),
    },
    {
      icon: PackageCheck,
      title: language === 'ar' ? 'إيصالات الاستلام' : 'Goods Receipts (GRN)',
      color: 'from-emerald-500 to-emerald-700',
      stats: [
        { label: language === 'ar' ? 'مسودة' : 'Draft', value: grnDraft, variant: 'secondary' as const },
        { label: language === 'ar' ? 'مرحّل' : 'Posted', value: grnPosted, variant: 'default' as const },
      ],
      total: receipts.length,
      action: () => navigate('/erp/receipts'),
    },
    {
      icon: RotateCcw,
      title: language === 'ar' ? 'الإرجاعات' : 'Returns (RTV)',
      color: 'from-red-500 to-red-700',
      stats: [
        { label: language === 'ar' ? 'مفتوح' : 'Open', value: rtvOpen, variant: 'destructive' as const },
        { label: language === 'ar' ? 'مسترد' : 'Credited', value: rtvCredited, variant: 'outline' as const },
      ],
      total: returnOrders.length,
      action: () => navigate('/erp/return-orders'),
    },
    {
      icon: RefreshCw,
      title: language === 'ar' ? 'عقود التوريد' : 'Blanket Orders',
      color: 'from-teal-500 to-teal-700',
      stats: [
        { label: language === 'ar' ? 'نشط' : 'Active', value: blkActive, variant: 'default' as const },
      ],
      total: blanketOrders.length,
      action: () => navigate('/erp/blanket-orders'),
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {language === 'ar' ? 'لوحة المشتريات' : 'Procurement Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'نظرة شاملة على دورة المشتريات الكاملة' : 'Full procurement cycle overview'}
          </p>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {language === 'ar' ? 'إجمالي أوامر الشراء' : 'Total PO Value'}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {poTotalValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">SAR</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {language === 'ar' ? 'قيمة مفتوحة' : 'Open PO Value'}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {poOpenValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">SAR</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {language === 'ar' ? 'بانتظار الموافقة' : 'Pending Approval'}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{prSubmitted}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {language === 'ar' ? 'عقود نشطة' : 'Active Contracts'}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {blkActive}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({blkTotalValue.toLocaleString()} SAR)
                    </span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {language === 'ar' ? 'تحويل الطلبات → أوامر شراء' : 'PR → PO Conversion Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={convertedPct} className="flex-1" />
                <span className="text-lg font-bold text-foreground min-w-[48px] text-right">{convertedPct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {prConverted} / {totalPR} {language === 'ar' ? 'تم تحويلها' : 'converted'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {language === 'ar' ? 'نسبة الاستلام الكامل' : 'PO Fulfillment Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={receivedPct} className="flex-1" />
                <span className="text-lg font-bold text-foreground min-w-[48px] text-right">{receivedPct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {poReceived} / {totalPO} {language === 'ar' ? 'مستلم بالكامل' : 'fully received'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <Card key={mod.title} className="group hover:shadow-lg transition-all cursor-pointer border-border/60" onClick={mod.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-sm`}>
                      <mod.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{mod.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{mod.total} {language === 'ar' ? 'إجمالي' : 'total'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mod.stats.map(s => (
                    <Badge key={s.label} variant={s.variant} className="text-xs">
                      {s.label}: {s.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity - Pending Actions */}
        {(prSubmitted > 0 || poDraft > 0 || grnDraft > 0 || rtvOpen > 0) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {language === 'ar' ? 'إجراءات مطلوبة' : 'Actions Required'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prSubmitted > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium">
                        {prSubmitted} {language === 'ar' ? 'طلبات بانتظار الموافقة' : 'requisitions pending approval'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/erp/requisitions'); }}>
                      {language === 'ar' ? 'مراجعة' : 'Review'} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
                {poDraft > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">
                        {poDraft} {language === 'ar' ? 'أوامر شراء بحاجة إرسال' : 'purchase orders ready to send'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/erp/purchase-orders'); }}>
                      {language === 'ar' ? 'إرسال' : 'Send'} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
                {grnDraft > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium">
                        {grnDraft} {language === 'ar' ? 'إيصالات بحاجة ترحيل' : 'receipts to post'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/erp/receipts'); }}>
                      {language === 'ar' ? 'ترحيل' : 'Post'} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
                {rtvOpen > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="text-sm font-medium">
                        {rtvOpen} {language === 'ar' ? 'إرجاعات مفتوحة' : 'open returns'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/erp/return-orders'); }}>
                      {language === 'ar' ? 'متابعة' : 'Follow up'} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProcurementDashboard;
