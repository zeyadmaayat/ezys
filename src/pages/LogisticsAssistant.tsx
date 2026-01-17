import { useState, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useShipmentState } from '@/hooks/useShipmentState';
import { ShipmentWizard } from '@/components/logistics/ShipmentWizard';
import { LogisticsChatPanel, Message } from '@/components/logistics/LogisticsChatPanel';
import { ShipmentPlanRenderer } from '@/components/logistics/ShipmentPlanRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistics-assistant`;

export default function LogisticsAssistant() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const shipmentState = useShipmentState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

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
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ship className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isRTL ? 'مساعد الشحن واللوجستيات' : 'Logistics & Shipping AI Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'خطط شحناتك الدولية بسهولة' : 'Plan your international shipments with ease'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </Button>
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
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  {isRTL ? 'خطة الشحن المُنشأة' : 'Generated Shipment Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShipmentPlanRenderer content={generatedPlan} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
