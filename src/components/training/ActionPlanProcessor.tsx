import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ActionPlan, 
  ActionStep, 
  LOGISTICS_TOOLS, 
  LogisticsTool 
} from '@/types/action-plan';
import { SAMPLE_ACTION_PLANS } from '@/data/sample-action-plans';
import { useActionPlans } from '@/hooks/useActionPlans';
import SavedPlansList from './SavedPlansList';
import SavePlanDialog from './SavePlanDialog';
import TrainingRatingDialog from './TrainingRatingDialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  SkipForward,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Truck,
  Package,
  Mail,
  ClipboardCheck,
  RotateCcw,
  Save,
  FolderOpen,
  Download
} from 'lucide-react';

interface ActionPlanProcessorProps {
  plan?: ActionPlan;
  onActionUpdate?: (actionId: string, status: ActionStep['status'], notes?: string) => void;
  onComplete?: () => void;
}

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'create_ticket': FileText,
  'send_email': Mail,
  'update_inventory': Package,
  'create_po': ClipboardCheck,
  'schedule_shipment': Truck,
  'approve_document': CheckCircle,
  'log_inspection': ClipboardCheck,
  'notify_stakeholder': Mail,
  'generate_report': FileText,
  'escalate_issue': AlertTriangle
};

const STATUS_COLORS: Record<ActionStep['status'], string> = {
  'pending': 'bg-muted text-muted-foreground',
  'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'skipped': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
};

const DIFFICULTY_COLORS: Record<ActionPlan['difficulty'], string> = {
  'beginner': 'bg-green-500',
  'intermediate': 'bg-yellow-500',
  'advanced': 'bg-red-500'
};

const ActionStepCard = ({ 
  step, 
  index, 
  isActive,
  onApprove, 
  onReject, 
  onSkip,
  onNotesChange 
}: { 
  step: ActionStep; 
  index: number;
  isActive: boolean;
  onApprove: () => void; 
  onReject: () => void; 
  onSkip: () => void;
  onNotesChange: (notes: string) => void;
}) => {
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = useState(isActive);
  const [notes, setNotes] = useState(step.notes || '');
  
  const Icon = TOOL_ICONS[step.tool] || FileText;
  const toolInfo = LOGISTICS_TOOLS[step.tool as LogisticsTool];
  const toolName = language === 'ar' ? toolInfo?.name_ar : toolInfo?.name_en;
  const description = language === 'ar' ? step.description_ar : step.description_en;

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onNotesChange(value);
  };

  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''} ${step.status !== 'pending' ? 'opacity-75' : ''}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
            {index + 1}
          </div>
          <Icon className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1">
            <CardTitle className="text-base">{toolName}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <Badge className={STATUS_COLORS[step.status]}>
            {step.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {step.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
            {step.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
            {step.status === 'completed' && <Play className="w-3 h-3 mr-1" />}
            {step.status === 'skipped' && <SkipForward className="w-3 h-3 mr-1" />}
            {step.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Args Preview */}
          {Object.keys(step.args).length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {language === 'ar' ? 'المعلمات' : 'Parameters'}
              </p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <label className="text-sm font-medium">
              {language === 'ar' ? 'ملاحظات التدريب' : 'Training Notes'}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={language === 'ar' ? 'أضف ملاحظاتك هنا...' : 'Add your notes here...'}
              className="mt-1"
              rows={2}
            />
          </div>
          
          {/* Actions */}
          {step.status === 'pending' && (
            <div className="flex gap-2">
              <Button onClick={onApprove} className="flex-1" variant="default">
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'موافقة' : 'Approve'}
              </Button>
              <Button onClick={onReject} className="flex-1" variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رفض' : 'Reject'}
              </Button>
              <Button onClick={onSkip} variant="outline">
                <SkipForward className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تخطي' : 'Skip'}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const ActionPlanProcessor = ({ plan: externalPlan, onActionUpdate: externalOnActionUpdate, onComplete: externalOnComplete }: ActionPlanProcessorProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedScenarioId, setSelectedScenarioId] = useState(SAMPLE_ACTION_PLANS[0].id);
  const [internalPlan, setInternalPlan] = useState<ActionPlan>(SAMPLE_ACTION_PLANS[0]);
  const [activeTab, setActiveTab] = useState<'samples' | 'saved'>('samples');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | ActionPlan['difficulty']>('all');
  
  const { plans: savedPlans, loading: loadingPlans, savePlan, deletePlan } = useActionPlans();
  
  // Use external plan if provided, otherwise use internal demo plan
  const plan = externalPlan || internalPlan;
  
  const title = language === 'ar' ? plan.title_ar : plan.title_en;
  const description = language === 'ar' ? plan.description_ar : plan.description_en;
  const estimatedTime = language === 'ar' ? plan.estimatedTime_ar : plan.estimatedTime_en;
  
  const sortedActions = [...plan.actions].sort((a, b) => a.order - b.order);
  const completedCount = sortedActions.filter(a => a.status !== 'pending').length;
  const progress = (completedCount / sortedActions.length) * 100;

  const handleScenarioChange = (scenarioId: string) => {
    const selectedPlan = SAMPLE_ACTION_PLANS.find(p => p.id === scenarioId);
    if (selectedPlan) {
      setSelectedScenarioId(scenarioId);
      setInternalPlan({
        ...selectedPlan,
        actions: selectedPlan.actions.map(a => ({ ...a, status: 'pending', notes: undefined }))
      });
      setCurrentStepIndex(0);
    }
  };

  const handleActionUpdate = (actionId: string, status: ActionStep['status'], notes?: string) => {
    if (externalOnActionUpdate) {
      externalOnActionUpdate(actionId, status, notes);
    } else {
      // Internal state management for demo mode
      setInternalPlan(prev => ({
        ...prev,
        actions: prev.actions.map(action => 
          action.id === actionId ? { ...action, status, notes } : action
        )
      }));
    }
  };

  const handleStepAction = (actionId: string, status: ActionStep['status'], notes?: string) => {
    handleActionUpdate(actionId, status, notes);
    // Only advance step when user takes an action (approve/reject/skip), not on notes change
    if (currentStepIndex < sortedActions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleNotesUpdate = (actionId: string, notes: string) => {
    // Update notes without advancing step
    if (externalOnActionUpdate) {
      const step = sortedActions.find(s => s.id === actionId);
      if (step) externalOnActionUpdate(actionId, step.status, notes);
    } else {
      setInternalPlan(prev => ({
        ...prev,
        actions: prev.actions.map(action => 
          action.id === actionId ? { ...action, notes } : action
        )
      }));
    }
  };

  const handleReset = () => {
    const basePlan = SAMPLE_ACTION_PLANS.find(p => p.id === selectedScenarioId) || SAMPLE_ACTION_PLANS[0];
    setInternalPlan({
      ...basePlan,
      actions: basePlan.actions.map(a => ({ ...a, status: 'pending', notes: undefined }))
    });
    setCurrentStepIndex(0);
  };

  const handleComplete = () => {
    setRatingDialogOpen(true);
    if (externalOnComplete) {
      externalOnComplete();
    }
  };

  const handleLoadSavedPlan = (savedPlan: ActionPlan) => {
    setInternalPlan({
      ...savedPlan,
      actions: savedPlan.actions.map(a => ({ ...a, status: 'pending', notes: undefined }))
    });
    setCurrentStepIndex(0);
    setActiveTab('samples');
  };

  const allCompleted = sortedActions.every(a => a.status !== 'pending');
  const hasAnyProgress = sortedActions.some(a => a.status !== 'pending');

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleText = language === 'ar' ? plan.title_ar : plan.title_en;
    doc.text(titleText, margin, y);
    y += 10;

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const descText = language === 'ar' ? plan.description_ar : plan.description_en;
    const descLines = doc.splitTextToSize(descText, maxWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 5;

    // Meta info
    doc.setFontSize(9);
    const diffLabel = language === 'ar' ? 'الصعوبة' : 'Difficulty';
    const timeLabel = language === 'ar' ? 'الوقت المقدر' : 'Est. Time';
    const estTime = language === 'ar' ? plan.estimatedTime_ar : plan.estimatedTime_en;
    doc.text(`${diffLabel}: ${plan.difficulty}  |  ${timeLabel}: ${estTime}`, margin, y);
    y += 8;

    // Progress summary
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const progressLabel = language === 'ar' ? 'ملخص التقدم' : 'Progress Summary';
    doc.text(progressLabel, margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const approved = sortedActions.filter(a => a.status === 'approved').length;
    const rejected = sortedActions.filter(a => a.status === 'rejected').length;
    const skipped = sortedActions.filter(a => a.status === 'skipped').length;
    const pending = sortedActions.filter(a => a.status === 'pending').length;

    const summaryText = language === 'ar'
      ? `الإجمالي: ${sortedActions.length} | موافقة: ${approved} | مرفوضة: ${rejected} | تم تخطيها: ${skipped} | معلقة: ${pending}`
      : `Total: ${sortedActions.length} | Approved: ${approved} | Rejected: ${rejected} | Skipped: ${skipped} | Pending: ${pending}`;
    doc.text(summaryText, margin, y);
    y += 10;

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Steps
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    const stepsLabel = language === 'ar' ? 'تفاصيل الخطوات' : 'Step Details';
    doc.text(stepsLabel, margin, y);
    y += 8;

    sortedActions.forEach((step, index) => {
      checkPage(35);

      const toolInfo = LOGISTICS_TOOLS[step.tool as LogisticsTool];
      const toolName = language === 'ar' ? toolInfo?.name_ar : toolInfo?.name_en;
      const stepDesc = language === 'ar' ? step.description_ar : step.description_en;

      // Step header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);

      const statusMap: Record<string, string> = {
        pending: '⏳', approved: '✅', rejected: '❌', completed: '✔', skipped: '⏭'
      };
      const statusIcon = statusMap[step.status] || '';

      doc.text(`${index + 1}. ${toolName} ${statusIcon} [${step.status.toUpperCase()}]`, margin, y);
      y += 5;

      // Step description
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      const stepLines = doc.splitTextToSize(stepDesc, maxWidth - 5);
      doc.text(stepLines, margin + 5, y);
      y += stepLines.length * 4 + 3;

      // Notes
      if (step.notes && step.notes.trim()) {
        checkPage(15);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80);
        const notesLabel = language === 'ar' ? 'ملاحظات:' : 'Notes:';
        const notesLines = doc.splitTextToSize(`${notesLabel} ${step.notes}`, maxWidth - 10);
        doc.text(notesLines, margin + 10, y);
        y += notesLines.length * 4 + 3;
      }

      y += 4;
    });

    // Footer
    checkPage(15);
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130);
    const dateStr = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const footerText = language === 'ar' ? `تم التصدير في: ${dateStr}` : `Exported on: ${dateStr}`;
    doc.text(footerText, margin, y);

    const fileName = `training-report-${plan.id}-${Date.now()}.pdf`;
    doc.save(fileName);
  }, [plan, sortedActions, language]);

  // Filter scenarios by difficulty
  const filteredScenarios = difficultyFilter === 'all' 
    ? SAMPLE_ACTION_PLANS 
    : SAMPLE_ACTION_PLANS.filter(p => p.difficulty === difficultyFilter);

  // Group scenarios by category for better organization
  const scenariosByCategory = filteredScenarios.reduce((acc, plan) => {
    if (!acc[plan.category]) {
      acc[plan.category] = [];
    }
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<string, ActionPlan[]>);

  const categoryLabels: Record<string, { en: string; ar: string }> = {
    'procurement': { en: 'Procurement', ar: 'المشتريات' },
    'customs': { en: 'Customs', ar: 'الجمارك' },
    'transport': { en: 'Transportation', ar: 'النقل' },
    'inbound': { en: 'Inbound Logistics', ar: 'اللوجستيات الواردة' },
    'outbound': { en: 'Outbound Logistics', ar: 'اللوجستيات الصادرة' },
    'distribution': { en: 'Distribution & Fulfillment', ar: 'التوزيع والتنفيذ' },
    'reverse': { en: 'Reverse Logistics', ar: 'اللوجستيات العكسية' },
    'international': { en: 'International Logistics', ar: 'اللوجستيات الدولية' },
    'cold-chain': { en: 'Cold Chain Logistics', ar: 'لوجستيات سلسلة التبريد' },
    'ecommerce': { en: 'E-commerce Logistics', ar: 'لوجستيات التجارة الإلكترونية' },
    'supply-chain': { en: 'End-to-End Supply Chain', ar: 'سلسلة التوريد الشاملة' },
    'lsp-models': { en: '1PL – 5PL Models', ar: 'نماذج 1PL – 5PL' },
    'acronyms': { en: 'Acronyms & Real Ops Terms', ar: 'المختصرات والمصطلحات' },
    'decision-framework': { en: 'Decision Framework', ar: 'إطار اتخاذ القرار' },
    'logistics': { en: 'General Logistics', ar: 'اللوجستيات العامة' },
    'warehouse': { en: 'Warehouse', ar: 'المستودعات' },
    'general': { en: 'General', ar: 'عام' }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector - Only show in demo mode */}
      {!externalPlan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === 'ar' ? 'اختر سيناريو التدريب' : 'Select Training Scenario'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'اختر من السيناريوهات المتاحة أو المحفوظة لبدء التدريب' 
                : 'Choose from sample scenarios or your saved plans'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'samples' | 'saved')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="samples" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {language === 'ar' ? 'السيناريوهات' : 'Sample Scenarios'}
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {language === 'ar' ? 'المحفوظة' : 'My Saved Plans'}
                  {savedPlans.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{savedPlans.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="samples" className="mt-0 space-y-3">
                {/* Difficulty Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الصعوبة:' : 'Difficulty:'}
                  </span>
                  <div className="flex gap-1">
                    {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={difficultyFilter === level ? 'default' : 'outline'}
                        onClick={() => setDifficultyFilter(level)}
                        className="text-xs h-7 px-2"
                      >
                        {level === 'all' 
                          ? (language === 'ar' ? 'الكل' : 'All')
                          : level === 'beginner'
                          ? (language === 'ar' ? 'مبتدئ' : 'Beginner')
                          : level === 'intermediate'
                          ? (language === 'ar' ? 'متوسط' : 'Intermediate')
                          : (language === 'ar' ? 'متقدم' : 'Advanced')}
                      </Button>
                    ))}
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {filteredScenarios.length} {language === 'ar' ? 'سيناريو' : 'scenarios'}
                  </Badge>
                </div>

                <Select value={selectedScenarioId} onValueChange={handleScenarioChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={language === 'ar' ? 'اختر سيناريو...' : 'Select a scenario...'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(scenariosByCategory).map(([category, plans]) => (
                      <div key={category} role="group">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                          {language === 'ar' ? categoryLabels[category]?.ar : categoryLabels[category]?.en}
                        </div>
                        {plans.map((scenarioPlan) => (
                          <SelectItem key={scenarioPlan.id} value={scenarioPlan.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[scenarioPlan.difficulty]} bg-opacity-20`}>
                                {scenarioPlan.difficulty}
                              </Badge>
                              <span>{language === 'ar' ? scenarioPlan.title_ar : scenarioPlan.title_en}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                {user ? (
                  <SavedPlansList
                    plans={savedPlans}
                    loading={loadingPlans}
                    onSelect={handleLoadSavedPlan}
                    onDelete={deletePlan}
                  />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {language === 'ar' 
                          ? 'سجل الدخول لحفظ وتحميل خطط العمل' 
                          : 'Sign in to save and load action plans'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={DIFFICULTY_COLORS[plan.difficulty]}>
                {plan.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimatedTime}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
              <span>{completedCount} / {sortedActions.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Steps */}
      <div className="space-y-4">
        {sortedActions.map((step, index) => (
          <ActionStepCard
            key={step.id}
            step={step}
            index={index}
            isActive={index === currentStepIndex}
            onApprove={() => handleStepAction(step.id, 'approved', step.notes)}
            onReject={() => handleStepAction(step.id, 'rejected', step.notes)}
            onSkip={() => handleStepAction(step.id, 'skipped', step.notes)}
            onNotesChange={(notes) => handleNotesUpdate(step.id, notes)}
          />
        ))}
      </div>

      {/* Complete / Reset / Save Buttons */}
      <div className="flex gap-4">
        {!externalPlan && (
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إعادة التعيين' : 'Reset'}
          </Button>
        )}
        {!externalPlan && user && (
          <Button onClick={() => setSaveDialogOpen(true)} variant="secondary" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'حفظ الخطة' : 'Save Plan'}
          </Button>
        )}
        {hasAnyProgress && (
          <Button onClick={exportToPDF} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        )}
        {allCompleted && (
          <Button onClick={handleComplete} className="flex-1" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'إكمال خطة العمل' : 'Complete Action Plan'}
          </Button>
        )}
      </div>

      {/* Save Plan Dialog */}
      <SavePlanDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        currentPlan={internalPlan}
        onSave={savePlan}
      />

      {/* Rating Dialog */}
      <TrainingRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        planId={plan.id}
        planTitle={language === 'ar' ? plan.title_ar : plan.title_en}
        completedSteps={completedCount}
        totalSteps={sortedActions.length}
      />
    </div>
  );
};

export default ActionPlanProcessor;
