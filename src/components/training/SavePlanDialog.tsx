import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ActionPlan, createEmptyActionPlan } from '@/types/action-plan';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';

interface SavePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: ActionPlan;
  onSave: (plan: ActionPlan) => Promise<boolean>;
}

const CATEGORIES = [
  { value: 'procurement', label_en: 'Procurement', label_ar: 'المشتريات' },
  { value: 'customs', label_en: 'Customs', label_ar: 'الجمارك' },
  { value: 'transport', label_en: 'Transportation', label_ar: 'النقل' },
  { value: 'inbound', label_en: 'Inbound Logistics', label_ar: 'اللوجستيات الواردة' },
  { value: 'outbound', label_en: 'Outbound Logistics', label_ar: 'اللوجستيات الصادرة' },
  { value: 'distribution', label_en: 'Distribution', label_ar: 'التوزيع' },
  { value: 'reverse', label_en: 'Reverse Logistics', label_ar: 'اللوجستيات العكسية' },
  { value: 'international', label_en: 'International', label_ar: 'الدولية' },
  { value: 'cold-chain', label_en: 'Cold Chain', label_ar: 'سلسلة التبريد' },
  { value: 'ecommerce', label_en: 'E-commerce', label_ar: 'التجارة الإلكترونية' },
  { value: 'supply-chain', label_en: 'Supply Chain', label_ar: 'سلسلة التوريد' },
  { value: 'warehouse', label_en: 'Warehouse', label_ar: 'المستودعات' },
  { value: 'general', label_en: 'General', label_ar: 'عام' },
];

const DIFFICULTIES = [
  { value: 'beginner', label_en: 'Beginner', label_ar: 'مبتدئ' },
  { value: 'intermediate', label_en: 'Intermediate', label_ar: 'متوسط' },
  { value: 'advanced', label_en: 'Advanced', label_ar: 'متقدم' },
];

const SavePlanDialog = ({ open, onOpenChange, currentPlan, onSave }: SavePlanDialogProps) => {
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ActionPlan>>({
    title_en: currentPlan.title_en,
    title_ar: currentPlan.title_ar,
    description_en: currentPlan.description_en,
    description_ar: currentPlan.description_ar,
    category: currentPlan.category,
    difficulty: currentPlan.difficulty,
    estimatedTime_en: currentPlan.estimatedTime_en,
    estimatedTime_ar: currentPlan.estimatedTime_ar,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const planToSave: ActionPlan = {
        ...createEmptyActionPlan(),
        ...formData,
        actions: currentPlan.actions,
      } as ActionPlan;

      const success = await onSave(planToSave);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'حفظ خطة العمل' : 'Save Action Plan'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'احفظ هذا السيناريو للتدريب لاحقاً' 
              : 'Save this scenario for later training'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
              <Input
                value={formData.title_en || ''}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
              <Input
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="أدخل العنوان..."
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en || ''}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Enter description..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Textarea
                value={formData.description_ar || ''}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="أدخل الوصف..."
                rows={2}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الفئة' : 'Category'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ActionPlan['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === 'ar' ? cat.label_ar : cat.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الصعوبة' : 'Difficulty'}</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as ActionPlan['difficulty'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {language === 'ar' ? diff.label_ar : diff.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوقت المقدر (إنجليزي)' : 'Estimated Time (English)'}</Label>
              <Input
                value={formData.estimatedTime_en || ''}
                onChange={(e) => setFormData({ ...formData, estimatedTime_en: e.target.value })}
                placeholder="e.g., 30 minutes"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوقت المقدر (عربي)' : 'Estimated Time (Arabic)'}</Label>
              <Input
                value={formData.estimatedTime_ar || ''}
                onChange={(e) => setFormData({ ...formData, estimatedTime_ar: e.target.value })}
                placeholder="مثال: 30 دقيقة"
                dir="rtl"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? `سيتم حفظ ${currentPlan.actions.length} خطوة مع هذه الخطة`
              : `${currentPlan.actions.length} action steps will be saved with this plan`}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.title_en || !formData.title_ar}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlanDialog;
