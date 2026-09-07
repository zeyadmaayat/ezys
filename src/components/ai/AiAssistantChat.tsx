import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Plus, Download, Trash2, Sparkles, Loader2, MessageSquare, X,
  Paperclip, Brain, ChevronDown, Database, Check, ArrowRight, AlertTriangle, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useAiAssistant, type AiAttachment, type AiProposal } from '@/hooks/useAiAssistant';
import { exportChatToPDF } from '@/lib/chat-pdf';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'page' | 'panel';
  onClose?: () => void;
}

const MAX_FILE_MB = 8;

const ACTION_LABELS: Record<AiProposal['action'], string> = {
  create_client: 'New client',
  create_shipment: 'New shipment',
  create_expense: 'New expense',
  create_lead: 'New lead',
  create_item: 'New item',
};

function ReasoningBlock({ text, live }: { text: string; live: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 rounded-lg border border-border/60 bg-muted/30">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground"
      >
        <Brain className={cn('w-3.5 h-3.5', live && 'animate-pulse text-primary')} />
        <span>{live ? 'Thinking…' : 'Thought process'}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 ml-auto transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-3 pb-2 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      )}
    </div>
  );
}

function ProposalCard({
  proposal, onConfirm, onReject,
}: { proposal: AiProposal; onConfirm: () => void; onReject: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const entries = Object.entries(proposal.payload || {}).filter(([, v]) => v !== null && v !== '' && v !== undefined);

  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
          {ACTION_LABELS[proposal.action] ?? proposal.action}
        </span>
        <span className="text-xs text-muted-foreground">Needs your confirmation</span>
      </div>
      <p className="text-sm mb-2">{proposal.summary_en}</p>
      {entries.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs mb-3">
          {entries.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</dt>
              <dd className="truncate">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}

      {proposal.state === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
            className="gap-1.5"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Confirm & save
          </Button>
          <Button size="sm" variant="ghost" onClick={onReject} disabled={busy}>Discard</Button>
        </div>
      )}

      {proposal.state === 'done' && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <Check className="w-3.5 h-3.5" />
          <span>{proposal.result || 'Saved'}</span>
          {proposal.route && (
            <button className="ml-auto inline-flex items-center gap-1 underline" onClick={() => navigate(proposal.route!)}>
              Open <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {proposal.state === 'failed' && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{proposal.result}</span>
          {proposal.route && (
            <button className="ml-auto inline-flex items-center gap-1 underline" onClick={() => navigate(proposal.route!)}>
              Fix <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {proposal.state === 'rejected' && (
        <p className="text-xs text-muted-foreground">Discarded — nothing was saved.</p>
      )}
    </div>
  );
}

export function AiAssistantChat({ variant = 'page', onClose }: Props) {
  const {
    messages, conversations, conversationId, isLoading,
    sendMessage, newConversation, loadConversation, deleteConversation,
    confirmProposal, rejectProposal,
  } = useAiAssistant();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<AiAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: AiAttachment[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: 'File too large', description: `${file.name} is over ${MAX_FILE_MB} MB.`, variant: 'destructive' });
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      next.push({ name: file.name, mime: file.type || 'application/octet-stream', data_url: dataUrl });
    }
    setPending(p => [...p, ...next].slice(0, 4));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSend = () => {
    if ((!input.trim() && pending.length === 0) || isLoading) return;
    sendMessage(input.trim(), pending);
    setInput('');
    setPending([]);
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
                  Ask about your real data, attach an invoice or a photo, or ask me to create a record — you confirm before anything is saved.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-xl mx-auto">
                  {[
                    'Analyze my recent shipments',
                    'Summarize my unpaid invoices',
                    'Add a new client called Zeyad Trading',
                    'Which items are below reorder level?',
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
                    <>
                      {m.reasoning && (
                        <ReasoningBlock
                          text={m.reasoning}
                          live={isLoading && i === messages.length - 1 && !m.content}
                        />
                      )}
                      {!!m.tools?.length && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {m.tools.map((t, k) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-background/70 border border-border text-muted-foreground"
                            >
                              {t.status === 'running'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Database className="w-3 h-3" />}
                              {t.name === 'query_erp' ? `Read ${t.module || 'data'}` : 'Prepared action'}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-pre:my-2 prose-headings:mb-2 prose-headings:mt-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || '…'}</ReactMarkdown>
                      </div>
                      {m.proposals?.map((p, k) => (
                        <ProposalCard
                          key={k}
                          proposal={p}
                          onConfirm={() => confirmProposal(i, k)}
                          onReject={() => rejectProposal(i, k)}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {!!m.attachments?.length && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {m.attachments.map((a, k) => (
                            a.mime.startsWith('image/') ? (
                              <img key={k} src={a.data_url} alt={a.name} className="h-16 w-16 object-cover rounded-md" />
                            ) : (
                              <span key={k} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-background/20">
                                <FileText className="w-3 h-3" /> {a.name}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                      {m.content && <p className="text-sm whitespace-pre-wrap">{m.content}</p>}
                    </>
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
          <div className="max-w-3xl mx-auto">
            {pending.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pending.map((a, k) => (
                  <span key={k} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-border bg-muted/40">
                    {a.mime.startsWith('image/')
                      ? <img src={a.data_url} alt="" className="h-5 w-5 object-cover rounded" />
                      : <FileText className="w-3.5 h-3.5" />}
                    <span className="max-w-[140px] truncate">{a.name}</span>
                    <button onClick={() => setPending(p => p.filter((_, x) => x !== k))} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                variant="outline" size="icon" className="h-11 w-11 shrink-0"
                onClick={() => fileRef.current?.click()}
                disabled={isLoading}
                aria-label="Attach a file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Message EzySuite AI…"
                rows={1}
                className="resize-none min-h-[44px] max-h-32"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && pending.length === 0) || isLoading}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            EzySuite AI can make mistakes. Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}
