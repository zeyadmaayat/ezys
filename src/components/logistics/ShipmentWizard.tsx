import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShipmentStateHook } from '@/hooks/useShipmentState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MapPin, Navigation, Package, Box, Scale, Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShipmentWizardProps {
  shipmentState: ShipmentStateHook;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

const STEPS = [
  { id: 1, title: 'Origin', titleAr: 'المصدر', icon: MapPin },
  { id: 2, title: 'Destination', titleAr: 'الوجهة', icon: Navigation },
  { id: 3, title: 'Shipment Basics', titleAr: 'أساسيات الشحنة', icon: Package },
  { id: 4, title: 'Cargo Details', titleAr: 'تفاصيل البضاعة', icon: Box },
  { id: 5, title: 'Size', titleAr: 'الحجم', icon: Scale },
  { id: 6, title: 'Preference', titleAr: 'التفضيلات', icon: Target },
];

export function ShipmentWizard({ shipmentState, onGeneratePlan, isGenerating }: ShipmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { state, updateField, isComplete } = shipmentState;

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return !!state.origin_country;
      case 2:
        return !!state.destination_country;
      case 3:
        return !!state.shipment_type && !!state.delivery_type;
      case 4:
        return !!state.product_category || !!state.hs_code;
      case 5:
        return !!state.weight_kg && (!!state.volume_cbm || !!state.cartons_count);
      case 6:
        return !!state.priority;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 6 && canProceed(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="origin_country" className="text-sm font-medium">
                {isRTL ? 'بلد المصدر' : 'Origin Country'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="origin_country"
                value={state.origin_country}
                onChange={(e) => updateField('origin_country', e.target.value)}
                placeholder={isRTL ? 'مثال: السعودية' : 'e.g., Saudi Arabia'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="origin_city" className="text-sm font-medium">
                {isRTL ? 'المدينة / الميناء (اختياري)' : 'City / Port (optional)'}
              </Label>
              <Input
                id="origin_city"
                value={state.origin_city_or_port}
                onChange={(e) => updateField('origin_city_or_port', e.target.value)}
                placeholder={isRTL ? 'مثال: جدة' : 'e.g., Jeddah'}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="destination_country" className="text-sm font-medium">
                {isRTL ? 'بلد الوجهة' : 'Destination Country'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="destination_country"
                value={state.destination_country}
                onChange={(e) => updateField('destination_country', e.target.value)}
                placeholder={isRTL ? 'مثال: الإمارات' : 'e.g., United Arab Emirates'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="destination_city" className="text-sm font-medium">
                {isRTL ? 'المدينة / الميناء (اختياري)' : 'City / Port (optional)'}
              </Label>
              <Input
                id="destination_city"
                value={state.destination_city_or_port}
                onChange={(e) => updateField('destination_city_or_port', e.target.value)}
                placeholder={isRTL ? 'مثال: دبي' : 'e.g., Dubai'}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {isRTL ? 'نوع الشحنة' : 'Shipment Type'} <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={state.shipment_type}
                onValueChange={(v) => updateField('shipment_type', v as 'Commercial' | 'Personal')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="Commercial" id="commercial" />
                  <Label htmlFor="commercial">{isRTL ? 'تجارية' : 'Commercial'}</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="Personal" id="personal" />
                  <Label htmlFor="personal">{isRTL ? 'شخصية' : 'Personal'}</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {isRTL ? 'نوع التوصيل' : 'Delivery Type'} <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={state.delivery_type}
                onValueChange={(v) => updateField('delivery_type', v as 'Door-to-Door' | 'Port-to-Port')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="Door-to-Door" id="door" />
                  <Label htmlFor="door">{isRTL ? 'باب لباب' : 'Door-to-Door'}</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="Port-to-Port" id="port" />
                  <Label htmlFor="port">{isRTL ? 'ميناء لميناء' : 'Port-to-Port'}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_category" className="text-sm font-medium">
                {isRTL ? 'فئة المنتج' : 'Product Category'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product_category"
                value={state.product_category}
                onChange={(e) => updateField('product_category', e.target.value)}
                placeholder={isRTL ? 'مثال: إلكترونيات، ملابس، مواد غذائية' : 'e.g., Electronics, Textiles, Food items'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hs_code" className="text-sm font-medium">
                {isRTL ? 'رمز HS (اختياري)' : 'HS Code (optional)'}
              </Label>
              <Input
                id="hs_code"
                value={state.hs_code}
                onChange={(e) => updateField('hs_code', e.target.value)}
                placeholder={isRTL ? 'مثال: 8471.30' : 'e.g., 8471.30'}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="dangerous" className="text-sm font-medium cursor-pointer">
                {isRTL ? 'بضائع خطرة؟' : 'Dangerous Goods?'}
              </Label>
              <Switch
                id="dangerous"
                checked={state.dangerous_goods}
                onCheckedChange={(v) => updateField('dangerous_goods', v)}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight_kg" className="text-sm font-medium">
                {isRTL ? 'الوزن (كجم)' : 'Weight (kg)'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="weight_kg"
                type="number"
                value={state.weight_kg}
                onChange={(e) => updateField('weight_kg', e.target.value)}
                placeholder={isRTL ? 'مثال: 500' : 'e.g., 500'}
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                {isRTL ? 'أدخل الحجم أو عدد الكراتين (أحدهما مطلوب)' : 'Enter volume OR carton count (one required)'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="volume_cbm" className="text-sm font-medium">
                    {isRTL ? 'الحجم (CBM)' : 'Volume (CBM)'}
                  </Label>
                  <Input
                    id="volume_cbm"
                    type="number"
                    step="0.01"
                    value={state.volume_cbm}
                    onChange={(e) => updateField('volume_cbm', e.target.value)}
                    placeholder="e.g., 2.5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cartons_count" className="text-sm font-medium">
                    {isRTL ? 'عدد الكراتين' : 'Cartons Count'}
                  </Label>
                  <Input
                    id="cartons_count"
                    type="number"
                    value={state.cartons_count}
                    onChange={(e) => updateField('cartons_count', e.target.value)}
                    placeholder="e.g., 20"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {isRTL ? 'الأولوية' : 'Priority'} <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={state.priority}
                onValueChange={(v) => updateField('priority', v as 'Cheapest' | 'Fastest' | 'Balanced')}
                className="grid grid-cols-3 gap-2"
              >
                {['Cheapest', 'Fastest', 'Balanced'].map((p) => (
                  <div key={p} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value={p} id={p.toLowerCase()} />
                    <Label htmlFor={p.toLowerCase()}>
                      {isRTL 
                        ? p === 'Cheapest' ? 'الأرخص' : p === 'Fastest' ? 'الأسرع' : 'متوازن'
                        : p}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="urgency_notes" className="text-sm font-medium">
                {isRTL ? 'ملاحظات إضافية (اختياري)' : 'Urgency Notes (optional)'}
              </Label>
              <Textarea
                id="urgency_notes"
                value={state.urgency_notes}
                onChange={(e) => updateField('urgency_notes', e.target.value)}
                placeholder={isRTL ? 'أي متطلبات خاصة أو ملاحظات عن الاستعجال' : 'Any special requirements or urgency notes'}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <h2 className="font-semibold text-lg">
          {isRTL ? 'معالج الشحنة' : 'Shipment Wizard'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRTL ? 'أكمل البيانات للحصول على خطة شحن' : 'Complete the details to get a shipping plan'}
        </p>
      </div>

      {/* Step Indicators */}
      <div className="p-3 border-b overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id || (currentStep === step.id && canProceed(step.id));
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  !isActive && isCompleted && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span>{isRTL ? step.titleAr : step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-2 mb-4">
          {(() => {
            const StepIcon = STEPS[currentStep - 1].icon;
            return <StepIcon className="h-5 w-5 text-primary" />;
          })()}
          <h3 className="font-semibold text-lg">
            {isRTL ? STEPS[currentStep - 1].titleAr : STEPS[currentStep - 1].title}
          </h3>
          <Badge variant="outline" className="ms-auto text-sm px-3 py-1">
            {currentStep} / 6
          </Badge>
        </div>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t bg-card flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-1"
        >
          {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {isRTL ? 'السابق' : 'Previous'}
        </Button>

        {currentStep < 6 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed(currentStep)}
            className="gap-1"
          >
            {isRTL ? 'التالي' : 'Next'}
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button
            onClick={onGeneratePlan}
            disabled={!isComplete || isGenerating}
            className="gap-1"
          >
            {isGenerating 
              ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') 
              : (isRTL ? 'إنشاء الخطة' : 'Generate Plan')}
          </Button>
        )}
      </div>
    </div>
  );
}
