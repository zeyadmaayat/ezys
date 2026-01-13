import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JSONStructureBuilder from '@/components/builders/JSONStructureBuilder';
import ActionPlanProcessor from '@/components/training/ActionPlanProcessor';
import { FileJson, ClipboardList, Wrench } from 'lucide-react';

const Tools = () => {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('json-builder');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'ar' ? 'أدوات التدريب' : 'Training Tools'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'أدوات عملية لبناء المحتوى والتدريب على سيناريوهات العمل الحقيقية'
                  : 'Practical tools for content building and real-world workflow training'}
              </p>
            </div>
          </div>
        </div>

        {/* Tools Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="json-builder" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'بناء الهياكل' : 'Structure Builder'}
              </span>
              <span className="sm:hidden">
                {language === 'ar' ? 'البناء' : 'Builder'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'معالج خطط العمل' : 'Action Plan Processor'}
              </span>
              <span className="sm:hidden">
                {language === 'ar' ? 'الخطط' : 'Plans'}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* JSON Structure Builder Tab */}
          <TabsContent value="json-builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'أداة بناء هياكل JSON' : 'JSON Structure Builder'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'أنشئ هياكل المحتوى والخطط العملية من خلال نماذج سهلة الاستخدام بدلاً من كتابة JSON يدوياً'
                    : 'Create content structures and action plans through easy-to-use forms instead of writing raw JSON'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JSONStructureBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Plan Processor Tab */}
          <TabsContent value="action-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'معالج خطط العمل التدريبية' : 'Action Plan Training Processor'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'قم بمعالجة خطط العمل خطوة بخطوة للتدريب والمحاكاة. راجع كل إجراء قبل تنفيذه لفهم سير العمل الحقيقي.'
                    : 'Process action plans step-by-step for training and simulation. Review each action before execution to understand real workflows.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActionPlanProcessor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Tips Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? '💡 نصيحة: بناء الهياكل' : '💡 Tip: Structure Builder'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'استخدم أداة بناء الهياكل لإنشاء أوصاف المنتجات وخطط العمل بسرعة. يمكنك نسخ الناتج JSON واستخدامه في نظام إدارة المحتوى.'
                : 'Use the structure builder to quickly create product descriptions and action plans. Copy the JSON output to use in the content management system.'}
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? '🎯 نصيحة: خطط العمل' : '🎯 Tip: Action Plans'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'استخدم معالج خطط العمل للتدريب على سيناريوهات اللوجستيات الحقيقية. راجع كل خطوة وتعلم كيفية استخدام الأدوات المختلفة في بيئة آمنة.'
                : 'Use the action plan processor to train on real logistics scenarios. Review each step and learn how to use different tools in a safe environment.'}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Tools;
