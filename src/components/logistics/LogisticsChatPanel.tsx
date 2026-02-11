import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Loader2, Sparkles, FileText, Ship, Plane, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShipmentStateHook } from '@/hooks/useShipmentState';
import { ChatMessage } from './ChatMessage';
import { toast } from '@/hooks/use-toast';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistics-assistant`;

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Commercial Invoice', labelAr: 'فاتورة تجارية', prompt: 'Generate a Commercial Invoice for this shipment' },
  { icon: FileText, label: 'Packing List', labelAr: 'قائمة تعبئة', prompt: 'Generate a Packing List for this shipment' },
  { icon: FileText, label: 'Bill of Lading', labelAr: 'بوليصة شحن', prompt: 'Generate a Bill of Lading for this shipment' },
  { icon: FileText, label: 'Customs Declaration', labelAr: 'بيان جمركي', prompt: 'Generate a Customs Declaration for this shipment' },
];

const QUICK_STARTS = [
  { icon: Ship, label: 'Sea Freight', labelAr: 'شحن بحري', prompt: 'I need to ship goods by sea' },
  { icon: Plane, label: 'Air Freight', labelAr: 'شحن جوي', prompt: 'I need urgent air shipping' },
  { icon: Truck, label: 'Road Transport', labelAr: 'نقل بري', prompt: 'I need road freight within a region' },
  { icon: Package, label: 'FCL Container', labelAr: 'حاوية كاملة', prompt: 'I need to ship a full container load (FCL)' },
];

interface LogisticsChatPanelProps {
  shipmentState: ShipmentStateHook;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  shipmentId?: string;
}

export function LogisticsChatPanel({
  shipmentState,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  shipmentId,
}: LogisticsChatPanelProps) {
  const [input, setInput] = useState('');
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (userInput: string) => {
    const contextPrefix = shipmentState.state.origin_country
      ? `[Current Shipment Data]\n${shipmentState.toContextString()}\n\n[User Message]\n`
      : '';

    const userMsg: Message = { role: 'user', content: userInput };
    const msgWithContext: Message = { 
      role: 'user', 
      content: contextPrefix + userInput 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = '';

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const allMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        msgWithContext
      ];

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (resp.status === 429) {
        toast({ title: 'Rate Limited', description: 'Please wait and try again.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: 'Credits Required', description: 'Please add credits to continue.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
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
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({ title: 'Error', description: 'Failed to get a response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [messages, shipmentState, setMessages, setIsLoading]);

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

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">LogiPro AI</h3>
            <p className="text-[10px] text-muted-foreground">
              {isRTL ? 'مساعد الشحن والمستندات' : 'Shipping & Documents Assistant'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMessages([])}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="p-4 space-y-5">
            {/* Welcome */}
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-semibold text-lg">
                {isRTL ? 'مرحباً! أنا LogiPro AI' : 'Hi! I\'m LogiPro AI'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL 
                  ? 'أستطيع تخطيط شحناتك وإنشاء المستندات تلقائياً'
                  : 'I can plan shipments & generate documents for you'}
              </p>
            </div>

            {/* Quick Start */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {isRTL ? 'ابدأ بسرعة' : 'Quick Start'}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_STARTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left text-xs disabled:opacity-50"
                  >
                    <item.icon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span>{isRTL ? item.labelAr : item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Generation */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {isRTL ? 'إنشاء المستندات' : 'Generate Documents'}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-left text-xs disabled:opacity-50"
                  >
                    <item.icon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span>{isRTL ? item.labelAr : item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} shipmentId={shipmentId} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 px-4 py-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-card/80 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRTL ? 'اكتب رسالتك أو اطلب مستند...' : 'Type a message or request a document...'}
            className="min-h-[40px] max-h-24 resize-none text-sm rounded-xl border-muted-foreground/20 focus-visible:ring-blue-500/30"
            rows={1}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-10 w-10 flex-shrink-0"
          >
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
