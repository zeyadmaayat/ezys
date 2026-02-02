import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AuditLogEntry } from '@/types/erp';
import type { Json } from '@/integrations/supabase/types';

export function useAuditLog(entityType?: string, entityId?: string) {
  const { user, isAdmin } = useAuth();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLog = useCallback(async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries((data || []) as AuditLogEntry[]);
    } catch (error: unknown) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, entityType, entityId]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  return { entries, loading, refetch: fetchAuditLog };
}

// Helper to log an audit event from the client
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.rpc('log_audit_event', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_old_values: (oldValues as Json) || null,
      p_new_values: (newValues as Json) || null,
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
