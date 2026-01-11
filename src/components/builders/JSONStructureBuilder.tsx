import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ActionPlan, 
  ActionStep, 
  LOGISTICS_TOOLS, 
  LogisticsTool,
  createEmptyActionPlan,
  createActionStep 
} from '@/types/action-plan';
import { ProductDescriptionContent } from '@/types/structured-content';
import { 
  Plus, 
  X, 
  Copy, 
  Download, 
  Trash2,
  GripVertical,
  FileJson,
  Package,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

type BuilderType = 'product-description' | 'action-plan';

// Product Description Builder
const ProductDescriptionBuilder = () => {
  const { language } = useLanguage();
  const [product, setProduct] = useState<ProductDescriptionContent>({
    title_en: '',
    title_ar: '',
    bullets_en: [''],
    bullets_ar: [''],
    tone: 'professional',
    useCase_en: '',
    useCase_ar: ''
  });

  const addBullet = (lang: 'en' | 'ar') => {
    setProduct(prev => ({
      ...prev,
      [`bullets_${lang}`]: [...prev[`bullets_${lang}`], '']
    }));
  };

  const updateBullet = (lang: 'en' | 'ar', index: number, value: string) => {
    setProduct(prev => {
      const bullets = [...prev[`bullets_${lang}`]];
      bullets[index] = value;
      return { ...prev, [`bullets_${lang}`]: bullets };
    });
  };

  const removeBullet = (lang: 'en' | 'ar', index: number) => {
    setProduct(prev => ({
      ...prev,
      [`bullets_${lang}`]: prev[`bullets_${lang}`].filter((_, i) => i !== index)
    }));
  };

  const generateJSON = () => {
    return JSON.stringify({
      type: 'product_description',
      language: language,
      tone: product.tone,
      inputs: {
        title: language === 'ar' ? product.title_ar : product.title_en,
        bullets: language === 'ar' ? product.bullets_ar : product.bullets_en,
        useCase: language === 'ar' ? product.useCase_ar : product.useCase_en
      },
      bilingual: {
        title_en: product.title_en,
        title_ar: product.title_ar,
        bullets_en: product.bullets_en,
        bullets_ar: product.bullets_ar,
        useCase_en: product.useCase_en,
        useCase_ar: product.useCase_ar
      }
    }, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJSON());
    toast.success(language === 'ar' ? 'تم النسخ!' : 'Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
          <Input
            value={product.title_en}
            onChange={(e) => setProduct({ ...product, title_en: e.target.value })}
            placeholder="Product or service title"
          />
        </div>
        <div dir="rtl">
          <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
          <Input
            value={product.title_ar}
            onChange={(e) => setProduct({ ...product, title_ar: e.target.value })}
            placeholder="عنوان المنتج أو الخدمة"
          />
        </div>
      </div>

      <div>
        <Label>{language === 'ar' ? 'النغمة' : 'Tone'}</Label>
        <Select value={product.tone} onValueChange={(v: ProductDescriptionContent['tone']) => setProduct({ ...product, tone: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">{language === 'ar' ? 'مهني' : 'Professional'}</SelectItem>
            <SelectItem value="marketing">{language === 'ar' ? 'تسويقي' : 'Marketing'}</SelectItem>
            <SelectItem value="technical">{language === 'ar' ? 'تقني' : 'Technical'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'النقاط الرئيسية (إنجليزي)' : 'Key Points (English)'}</Label>
          {product.bullets_en.map((bullet, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={bullet}
                onChange={(e) => updateBullet('en', index, e.target.value)}
                placeholder={`Point ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBullet('en', index)}
                disabled={product.bullets_en.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addBullet('en')}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إضافة نقطة' : 'Add Point'}
          </Button>
        </div>
        
        <div className="space-y-2" dir="rtl">
          <Label>{language === 'ar' ? 'النقاط الرئيسية (عربي)' : 'Key Points (Arabic)'}</Label>
          {product.bullets_ar.map((bullet, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={bullet}
                onChange={(e) => updateBullet('ar', index, e.target.value)}
                placeholder={`النقطة ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBullet('ar', index)}
                disabled={product.bullets_ar.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addBullet('ar')}>
            <Plus className="w-4 h-4 ml-2" />
            {language === 'ar' ? 'إضافة نقطة' : 'Add Point'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'ar' ? 'حالة الاستخدام (إنجليزي)' : 'Use Case (English)'}</Label>
          <Textarea
            value={product.useCase_en}
            onChange={(e) => setProduct({ ...product, useCase_en: e.target.value })}
            placeholder="Describe a practical use case..."
            rows={3}
          />
        </div>
        <div dir="rtl">
          <Label>{language === 'ar' ? 'حالة الاستخدام (عربي)' : 'Use Case (Arabic)'}</Label>
          <Textarea
            value={product.useCase_ar}
            onChange={(e) => setProduct({ ...product, useCase_ar: e.target.value })}
            placeholder="صف حالة استخدام عملية..."
            rows={3}
          />
        </div>
      </div>

      {/* JSON Preview */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {language === 'ar' ? 'معاينة JSON' : 'JSON Preview'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'نسخ' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-60">
            {generateJSON()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

// Action Plan Builder
const ActionPlanBuilder = () => {
  const { language } = useLanguage();
  const [plan, setPlan] = useState<ActionPlan>(createEmptyActionPlan());

  const addAction = (tool: LogisticsTool) => {
    const newStep = createActionStep(tool, plan.actions.length);
    setPlan({ ...plan, actions: [...plan.actions, newStep] });
  };

  const removeAction = (id: string) => {
    setPlan({
      ...plan,
      actions: plan.actions.filter(a => a.id !== id).map((a, i) => ({ ...a, order: i }))
    });
  };

  const updateActionArgs = (id: string, args: Record<string, unknown>) => {
    setPlan({
      ...plan,
      actions: plan.actions.map(a => a.id === id ? { ...a, args } : a)
    });
  };

  const generateJSON = () => {
    return JSON.stringify({
      plan: language === 'ar' ? plan.description_ar : plan.description_en,
      title: language === 'ar' ? plan.title_ar : plan.title_en,
      category: plan.category,
      difficulty: plan.difficulty,
      actions: plan.actions.map(a => ({
        tool: a.tool,
        args: a.args
      }))
    }, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJSON());
    toast.success(language === 'ar' ? 'تم النسخ!' : 'Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
          <Input
            value={plan.title_en}
            onChange={(e) => setPlan({ ...plan, title_en: e.target.value })}
            placeholder="Action plan title"
          />
        </div>
        <div dir="rtl">
          <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
          <Input
            value={plan.title_ar}
            onChange={(e) => setPlan({ ...plan, title_ar: e.target.value })}
            placeholder="عنوان خطة العمل"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
          <Textarea
            value={plan.description_en}
            onChange={(e) => setPlan({ ...plan, description_en: e.target.value })}
            placeholder="Describe the action plan..."
            rows={2}
          />
        </div>
        <div dir="rtl">
          <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
          <Textarea
            value={plan.description_ar}
            onChange={(e) => setPlan({ ...plan, description_ar: e.target.value })}
            placeholder="صف خطة العمل..."
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{language === 'ar' ? 'الفئة' : 'Category'}</Label>
          <Select 
            value={plan.category} 
            onValueChange={(v: ActionPlan['category']) => setPlan({ ...plan, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="procurement">{language === 'ar' ? 'المشتريات' : 'Procurement'}</SelectItem>
              <SelectItem value="logistics">{language === 'ar' ? 'اللوجستيات' : 'Logistics'}</SelectItem>
              <SelectItem value="warehouse">{language === 'ar' ? 'المستودع' : 'Warehouse'}</SelectItem>
              <SelectItem value="transport">{language === 'ar' ? 'النقل' : 'Transport'}</SelectItem>
              <SelectItem value="customs">{language === 'ar' ? 'الجمارك' : 'Customs'}</SelectItem>
              <SelectItem value="general">{language === 'ar' ? 'عام' : 'General'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{language === 'ar' ? 'المستوى' : 'Difficulty'}</Label>
          <Select 
            value={plan.difficulty} 
            onValueChange={(v: ActionPlan['difficulty']) => setPlan({ ...plan, difficulty: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{language === 'ar' ? 'مبتدئ' : 'Beginner'}</SelectItem>
              <SelectItem value="intermediate">{language === 'ar' ? 'متوسط' : 'Intermediate'}</SelectItem>
              <SelectItem value="advanced">{language === 'ar' ? 'متقدم' : 'Advanced'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{language === 'ar' ? 'الإجراءات' : 'Actions'}</Label>
          <Select onValueChange={(v: LogisticsTool) => addAction(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={language === 'ar' ? 'إضافة إجراء' : 'Add Action'} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOGISTICS_TOOLS).map(([key, tool]) => (
                <SelectItem key={key} value={key}>
                  {language === 'ar' ? tool.name_ar : tool.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {plan.actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {language === 'ar' ? 'لم تتم إضافة إجراءات بعد' : 'No actions added yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {plan.actions.map((action, index) => {
              const toolInfo = LOGISTICS_TOOLS[action.tool as LogisticsTool];
              return (
                <Card key={action.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="flex-1 font-medium">
                        {language === 'ar' ? toolInfo.name_ar : toolInfo.name_en}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(action.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    {/* Args inputs */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {toolInfo.args.map((arg) => (
                        <div key={arg}>
                          <Label className="text-xs">{arg}</Label>
                          <Input
                            size={1}
                            value={(action.args[arg] as string) || ''}
                            onChange={(e) => updateActionArgs(action.id, { ...action.args, [arg]: e.target.value })}
                            placeholder={arg}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* JSON Preview */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {language === 'ar' ? 'معاينة JSON' : 'JSON Preview'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'نسخ' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-60">
            {generateJSON()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
const JSONStructureBuilder = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<BuilderType>('product-description');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          {language === 'ar' ? 'منشئ الهياكل' : 'Structure Builder'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'قم ببناء هياكل JSON بصريًا للتدريب والمحاكاة'
            : 'Build JSON structures visually for training and simulation'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BuilderType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product-description" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {language === 'ar' ? 'وصف المنتج' : 'Product Description'}
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {language === 'ar' ? 'خطة العمل' : 'Action Plan'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="product-description" className="mt-6">
            <ProductDescriptionBuilder />
          </TabsContent>
          
          <TabsContent value="action-plan" className="mt-6">
            <ActionPlanBuilder />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JSONStructureBuilder;
