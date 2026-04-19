import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type AiMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

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

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: AiMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const convId = await ensureConversation(input);
    if (convId) await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: input });

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
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
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (resp.status === 429) {
        toast({ title: 'Rate limited', description: 'Wait a moment.', variant: 'destructive' });
        setIsLoading(false); return;
      }
      if (resp.status === 402) {
        toast({ title: 'AI credits required', variant: 'destructive' });
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
          if (line.startsWith(':') || !line.trim() || !line.startsWith('data: ')) continue;
          const j = line.slice(6).trim();
          if (j === '[DONE]') { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }

      if (convId && assistantSoFar) {
        await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: assistantSoFar });
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

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('ai_conversations').delete().eq('id', id);
    if (conversationId === id) newConversation();
    loadConversations();
  }, [conversationId, newConversation, loadConversations]);

  return {
    messages, conversations, conversationId, isLoading,
    sendMessage, newConversation, loadConversation, deleteConversation, loadConversations,
  };
}
