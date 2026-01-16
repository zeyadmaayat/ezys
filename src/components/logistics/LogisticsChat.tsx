import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2, Ship, Plane, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogisticsChat } from '@/hooks/useLogisticsChat';
import { ChatMessage } from './ChatMessage';
import { useLanguage } from '@/contexts/LanguageContext';

const QUICK_PROMPTS = [
  { icon: Ship, label: 'Sea Freight', prompt: 'I need to ship goods by sea' },
  { icon: Plane, label: 'Air Freight', prompt: 'I need urgent air shipping' },
  { icon: Truck, label: 'Road Transport', prompt: 'I need road freight within a region' },
  { icon: Package, label: 'Full Container', prompt: 'I need to ship a full container load (FCL)' },
];

const QUICK_PROMPTS_AR = [
  { icon: Ship, label: 'شحن بحري', prompt: 'أحتاج لشحن بضائع بحراً' },
  { icon: Plane, label: 'شحن جوي', prompt: 'أحتاج شحن جوي عاجل' },
  { icon: Truck, label: 'نقل بري', prompt: 'أحتاج نقل بري داخل المنطقة' },
  { icon: Package, label: 'حاوية كاملة', prompt: 'أحتاج شحن حاوية كاملة FCL' },
];

export function LogisticsChat() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearChat } = useLogisticsChat();
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTL = language === 'ar';
  const quickPrompts = isRTL ? QUICK_PROMPTS_AR : QUICK_PROMPTS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">
              {isRTL ? 'مساعد الشحن واللوجستيات' : 'Logistics & Shipping Assistant'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'خطط شحناتك الدولية' : 'Plan your international shipments'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 me-1" />
            {isRTL ? 'مسح' : 'Clear'}
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="p-6 space-y-6">
            {/* Welcome Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {isRTL ? 'مرحباً! أنا مساعدك للشحن الدولي' : 'Hello! I\'m your International Shipping Assistant'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {isRTL 
                    ? 'أستطيع مساعدتك في التخطيط لشحناتك من أي مكان إلى أي مكان في العالم.'
                    : 'I can help you plan shipments from anywhere to anywhere in the world.'}
                </p>
                <p className="font-medium text-foreground">
                  {isRTL ? 'سأحتاج معرفة:' : 'I\'ll need to know:'}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{isRTL ? 'بلد/مدينة المصدر والوجهة' : 'Origin & destination country/city'}</li>
                  <li>{isRTL ? 'نوع الشحنة (تجارية أو شخصية)' : 'Shipment type (commercial or personal)'}</li>
                  <li>{isRTL ? 'فئة المنتج' : 'Product category'}</li>
                  <li>{isRTL ? 'الوزن والحجم' : 'Weight & volume'}</li>
                  <li>{isRTL ? 'الأولوية (أرخص / أسرع / متوازن)' : 'Priority (cheapest / fastest / balanced)'}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                {isRTL ? 'ابدأ سريعاً:' : 'Quick start:'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isLoading}
                  >
                    <item.icon className="h-4 w-4 me-2 text-primary" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'جاري التفكير...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
