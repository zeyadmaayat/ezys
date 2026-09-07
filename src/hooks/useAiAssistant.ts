import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type AiAttachment = {
  name: string;
  mime: string;
  data_url: string;
};

export type AiProposal = {
  action: 'create_client' | 'create_shipment' | 'create_expense' | 'create_lead' | 'create_item';
  summary_en: string;
  summary_ar: string;
  payload: Record<string, unknown>;
  state?: 'pending' | 'done' | 'rejected' | 'failed';
  result?: string;
  route?: string;
};

export type AiToolCall = {
  name: string;
  status: 'running' | 'done';
  module?: string;
};

export type AiMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  tools?: AiToolCall[];
  proposals?: AiProposal[];
  attachments?: AiAttachment[];
};

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
const ACTION_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-action`;

export function useAiAssistant() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('ai_conversations')
      .select('id,title,updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);
    setConversations(data || []);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('ai_messages')
      .select('id,role,content')
      .eq('conversation_id', id)
      .order('created_at');
    setMessages((data || []).map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })));
    setConversationId(id);
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const ensureConversation = async (firstMsg: string): Promise<string | null> => {
    if (conversationId) return conversationId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle();
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? '…' : '');
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, company_id: profile?.company_id || null, title })
      .select('id')
      .single();
    if (error || !data) return null;
    setConversationId(data.id);
    return data.id;
  };

  const sendMessage = useCallback(async (input: string, attachments: AiAttachment[] = []) => {
    if (!input.trim() && attachments.length === 0) return;
    const userMsg: AiMessage = { role: 'user', content: input, attachments };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const convId = await ensureConversation(input || attachments[0]?.name || 'Attachment');
    if (convId) await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: input });

    let textSoFar = '';
    let reasoningSoFar = '';
    const tools: AiToolCall[] = [];
    const proposals: AiProposal[] = [];

    const patchAssistant = (patch: Partial<AiMessage>) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, ...patch } : m));
        }
        return [...prev, { role: 'assistant', content: '', ...patch }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: 'Login required', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          attachments,
        }),
      });

      if (resp.status === 429) {
        toast({ title: 'Rate limited', description: 'Wait a moment and try again.', variant: 'destructive' });
        setIsLoading(false); return;
      }
      if (resp.status === 402) {
        toast({ title: 'AI credits required', description: 'Add credits to continue.', variant: 'destructive' });
        setIsLoading(false); return;
      }
      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const j = line.slice(6).trim();
          if (!j) continue;
          if (j === '[DONE]') { done = true; break; }
          let ev: any;
          try { ev = JSON.parse(j); } catch { buf = line + '\n' + buf; break; }

          if (ev.type === 'text' && ev.delta) {
            textSoFar += ev.delta;
            patchAssistant({ content: textSoFar });
          } else if (ev.type === 'reasoning' && ev.delta) {
            reasoningSoFar += ev.delta;
            patchAssistant({ reasoning: reasoningSoFar });
          } else if (ev.type === 'tool') {
            const existing = tools.find(t => t.name === ev.name && t.module === ev.module);
            if (ev.status === 'done' && existing) existing.status = 'done';
            else if (ev.status === 'done') tools.push({ name: ev.name, status: 'done', module: ev.module });
            else if (!tools.some(t => t.name === ev.name && t.status === 'running')) tools.push({ name: ev.name, status: 'running', module: ev.module });
            patchAssistant({ tools: [...tools] });
          } else if (ev.type === 'proposal' && ev.proposal) {
            proposals.push({ ...ev.proposal, state: 'pending' });
            patchAssistant({ proposals: [...proposals] });
          } else if (ev.type === 'error') {
            const msg = ev.message === 'rate_limited'
              ? 'Too many requests. Wait a moment.'
              : ev.message === 'credits_required'
                ? 'AI credits required.'
                : 'The AI service returned an error.';
            toast({ title: 'AI error', description: msg, variant: 'destructive' });
          }
        }
      }

      if (convId && textSoFar) {
        await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: textSoFar });
        await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
        loadConversations();
      }
    } catch (e) {
      console.error('AI error:', e);
      toast({ title: 'Error', description: 'Failed to get a response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, loadConversations]);

  const updateProposal = (msgIndex: number, propIndex: number, patch: Partial<AiProposal>) => {
    setMessages(prev => prev.map((m, i) => i !== msgIndex ? m : {
      ...m,
      proposals: (m.proposals || []).map((p, k) => (k === propIndex ? { ...p, ...patch } : p)),
    }));
  };

  const rejectProposal = useCallback((msgIndex: number, propIndex: number) => {
    updateProposal(msgIndex, propIndex, { state: 'rejected' });
  }, []);

  const confirmProposal = useCallback(async (msgIndex: number, propIndex: number) => {
    const proposal = messages[msgIndex]?.proposals?.[propIndex];
    if (!proposal || proposal.state !== 'pending') return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: 'Login required', variant: 'destructive' });
      return;
    }

    try {
      const resp = await fetch(ACTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: proposal.action, payload: proposal.payload }),
      });
      const body = await resp.json().catch(() => ({}));

      if (!resp.ok || !body?.ok) {
        const reason = typeof body?.message === 'string' ? body.message : 'Could not complete this action.';
        updateProposal(msgIndex, propIndex, { state: 'failed', result: reason, route: body?.route });
        toast({ title: 'Not completed', description: reason, variant: 'destructive' });
        return;
      }

      const label = body.label_en || 'Done';
      const ref = body.record?.tracking_number || body.record?.expense_number || body.record?.name || body.record?.sku || '';
      updateProposal(msgIndex, propIndex, {
        state: 'done',
        result: ref ? `${label}: ${ref}` : label,
        route: body.route,
      });
      toast({ title: label, description: ref || undefined });
    } catch (e) {
      console.error('AI action error:', e);
      updateProposal(msgIndex, propIndex, { state: 'failed', result: 'Network error.' });
      toast({ title: 'Error', description: 'Failed to run the action.', variant: 'destructive' });
    }
  }, [messages]);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('ai_conversations').delete().eq('id', id);
    if (conversationId === id) newConversation();
    loadConversations();
  }, [conversationId, newConversation, loadConversations]);

  return {
    messages, conversations, conversationId, isLoading,
    sendMessage, newConversation, loadConversation, deleteConversation, loadConversations,
    confirmProposal, rejectProposal,
  };
}
