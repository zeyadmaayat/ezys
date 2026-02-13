import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';
import type { InternalMessage } from '@/types/procurement';

export function useInternalMessages(entityType: string, entityId: string) {
  const { user } = useAuth();
  const { company } = useCompany();
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !company || !entityId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data || []) as unknown as InternalMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally { setLoading(false); }
  }, [user, company, entityType, entityId]);

  const sendMessage = async (message: string) => {
    if (!user || !company || !entityId) return null;
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .insert({
          company_id: company.id,
          entity_type: entityType,
          entity_id: entityId,
          sender_id: user.id,
          sender_name: user.email?.split('@')[0] || 'User',
          message,
        } as any)
        .select()
        .single();
      if (error) throw error;
      await fetchMessages();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  };

  return { messages, loading, fetchMessages, sendMessage };
}
