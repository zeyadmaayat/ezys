import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Plus, Download, Trash2, Sparkles, Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { exportChatToPDF } from '@/lib/chat-pdf';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'page' | 'panel';
  onClose?: () => void;
}

export function AiAssistantChat({ variant = 'page', onClose }: Props) {
  const {
    messages, conversations, conversationId, isLoading,
    sendMessage, newConversation, loadConversation, deleteConversation,
  } = useAiAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      'flex bg-background text-foreground',
      variant === 'page' ? 'h-[calc(100vh-3rem)]' : 'h-full'
    )}>
      {/* Sidebar with history */}
      <aside className={cn(
        'border-r border-border bg-card flex flex-col',
        variant === 'page' ? 'w-64 hidden md:flex' : 'w-56 hidden lg:flex'
      )}>
        <div className="p-3 border-b border-border">
          <Button onClick={newConversation} variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" /> New chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map(c => (
              <div
                key={c.id}
                className={cn(
                  'group flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors',
                  conversationId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'
                )}
                onClick={() => loadConversation(c.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">EzySuite AI</h2>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost" size="sm"
                onClick={() => exportChatToPDF(messages, conversations.find(c => c.id === conversationId)?.title)}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </Button>
            )}
            {variant === 'panel' && onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask anything — analyze your shipments, draft documents, calculate costs, or get logistics advice.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-xl mx-auto">
                  {[
                    'Analyze my recent shipments',
                    'Draft a commercial invoice',
                    'Compare sea vs air freight',
                    'Summarize my unpaid invoices',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-sm px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {m.role === 'user' ? 'U' : '✨'}
                </div>
                <div className={cn(
                  'rounded-2xl px-4 py-2.5 max-w-[85%]',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                )}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-pre:my-2 prose-headings:mb-2 prose-headings:mt-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || '…'}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-muted/50">
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-3 bg-card">
          <div className="max-w-3xl mx-auto flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message EzySuite AI…"
              rows={1}
              className="resize-none min-h-[44px] max-h-32"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-11 w-11 shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            EzySuite AI can make mistakes. Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}
