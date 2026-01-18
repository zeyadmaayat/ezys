import { useState, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useShipmentState, ShipmentState } from '@/hooks/useShipmentState';
import { useShipmentPlans } from '@/hooks/useShipmentPlans';
import { ShipmentWizard } from '@/components/logistics/ShipmentWizard';
import { LogisticsChatPanel, Message } from '@/components/logistics/LogisticsChatPanel';
import { ShipmentPlanRenderer } from '@/components/logistics/ShipmentPlanRenderer';
import { SavedPlansDialog } from '@/components/logistics/SavedPlansDialog';
import { SavePlanDialog } from '@/components/logistics/SavePlanDialog';
import { CreateShipmentButton } from '@/components/logistics/CreateShipmentButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, RotateCcw, Save, FolderOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistics-assistant`;

export default function LogisticsAssistant() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const shipmentState = useShipmentState();
  const { savedPlans, isLoading: plansLoading, fetchPlans, savePlan, deletePlan } = useShipmentPlans();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentPlanTitle, setCurrentPlanTitle] = useState<string>('');
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const generatePlan = useCallback(async () => {
    if (!shipmentState.isComplete) {
      toast({
        title: isRTL ? 'بيانات ناقصة' : 'Missing Data',
        description: isRTL ? 'يرجى إكمال جميع الحقول المطلوبة.' : 'Please complete all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedPlan(null);

    const prompt = `Please generate a complete shipping plan based on the following shipment details:

${shipmentState.toContextString()}

Generate the final JSON plan now.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (resp.status === 429) {
        toast({
          title: isRTL ? 'تم تجاوز الحد' : 'Rate Limited',
          description: isRTL ? 'الرجاء الانتظار.' : 'Please wait and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast({
          title: isRTL ? 'مطلوب رصيد' : 'Credits Required',
          description: isRTL ? 'يرجى إضافة رصيد.' : 'Please add credits.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to generate plan');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setGeneratedPlan(fullResponse);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Add the plan to chat history
      setMessages(prev => [
        ...prev,
        { role: 'user', content: isRTL ? 'أنشئ خطة الشحن' : 'Generate shipping plan' },
        { role: 'assistant', content: fullResponse }
      ]);

    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل إنشاء الخطة.' : 'Failed to generate plan.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [shipmentState, isRTL]);

  const resetAll = () => {
    shipmentState.reset();
    setMessages([]);
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentPlanTitle('');
  };

  const handleSavePlan = async (title: string) => {
    const id = await savePlan(title, shipmentState.state, generatedPlan, currentPlanId || undefined);
    if (id) {
      setCurrentPlanId(id);
      setCurrentPlanTitle(title);
      setShowSaveDialog(false);
    }
  };

  const handleLoadPlan = (state: ShipmentState, plan: string | null, planId: string) => {
    shipmentState.updateMultiple(state);
    setGeneratedPlan(plan);
    setCurrentPlanId(planId);
    // Find the plan title
    const loadedPlan = savedPlans.find(p => p.id === planId);
    if (loadedPlan) {
      setCurrentPlanTitle(loadedPlan.title);
    }
    setMessages([]);
    toast({
      title: isRTL ? 'تم التحميل' : 'Loaded',
      description: isRTL ? 'تم تحميل الخطة بنجاح.' : 'Plan loaded successfully.',
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ship className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isRTL ? 'مساعد الشحن واللوجستيات' : 'Logistics & Shipping AI Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentPlanTitle 
                  ? `${isRTL ? 'الخطة: ' : 'Plan: '}${currentPlanTitle}`
                  : (isRTL ? 'خطط شحناتك الدولية بسهولة' : 'Plan your international shipments with ease')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowLoadDialog(true)} className="gap-2">
              <FolderOpen className="h-4 w-4" />
              {isRTL ? 'تحميل' : 'Load'}
            </Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)} className="gap-2">
              <Save className="h-4 w-4" />
              {currentPlanId ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {isRTL ? 'جديد' : 'New'}
            </Button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-220px)]">
          {/* Left Column - Wizard (60%) */}
          <div className="lg:col-span-3 bg-card rounded-xl border shadow-sm overflow-hidden">
            <ShipmentWizard
              shipmentState={shipmentState}
              onGeneratePlan={generatePlan}
              isGenerating={isLoading}
            />
          </div>

          {/* Right Column - Chat (40%) */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden">
            <LogisticsChatPanel
              shipmentState={shipmentState}
              messages={messages}
              setMessages={setMessages}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>

        {/* Generated Plan Results */}
        {generatedPlan && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    {isRTL ? 'خطة الشحن المُنشأة' : 'Generated Shipment Plan'}
                  </CardTitle>
                  {currentPlanId && (
                    <CreateShipmentButton planId={currentPlanId} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ShipmentPlanRenderer content={generatedPlan} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SavePlanDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSavePlan}
        isLoading={plansLoading}
        defaultTitle={currentPlanTitle || `${shipmentState.state.origin_country} → ${shipmentState.state.destination_country}`}
      />

      <SavedPlansDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        plans={savedPlans}
        isLoading={plansLoading}
        onLoad={handleLoadPlan}
        onDelete={deletePlan}
        onFetch={fetchPlans}
      />
    </MainLayout>
  );
}
