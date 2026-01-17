import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Loader2, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShipmentStateHook } from '@/hooks/useShipmentState';
import { ChatMessage } from './ChatMessage';
import { toast } from '@/hooks/use-toast';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistics-assistant`;

interface LogisticsChatPanelProps {
  shipmentState: ShipmentStateHook;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LogisticsChatPanel({
  shipmentState,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
}: LogisticsChatPanelProps) {
  const [input, setInput] = useState('');
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (userInput: string, includeContext: boolean = true) => {
    // Build context from shipment state
    const contextPrefix = includeContext && shipmentState.state.origin_country
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
      // Build messages array - include context with current user message
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
        toast({
          title: isRTL ? 'تم تجاوز الحد' : 'Rate Limited',
          description: isRTL ? 'الرجاء الانتظار والمحاولة مرة أخرى.' : 'Too many requests. Please wait and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast({
          title: isRTL ? 'مطلوب رصيد' : 'Credits Required',
          description: isRTL ? 'يرجى إضافة رصيد للمتابعة.' : 'Please add credits to continue.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

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
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

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
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل الاتصال. يرجى المحاولة مرة أخرى.' : 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, shipmentState, isRTL, setMessages, setIsLoading]);

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

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Ship className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">
              {isRTL ? 'المساعد الذكي' : 'AI Assistant'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'اسأل أي سؤال' : 'Ask any question'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="p-4 space-y-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4 text-sm text-muted-foreground">
                <p>
                  {isRTL
                    ? 'يمكنك طرح الأسئلة أو تقديم معلومات إضافية هنا. سأساعدك في التخطيط لشحنتك.'
                    : 'You can ask questions or provide additional info here. I\'ll help you plan your shipment.'}
                </p>
                <p className="mt-2 text-xs">
                  {isRTL
                    ? '💡 نصيحة: أكمل النموذج على اليسار للحصول على خطة شحن كاملة.'
                    : '💡 Tip: Complete the form on the left to get a full shipping plan.'}
                </p>
              </CardContent>
            </Card>
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
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
            className="min-h-[40px] max-h-24 resize-none text-sm"
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
