import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';

export interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
}

export interface WebhookEndpointRow {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  secret: string;
  is_active: boolean;
  failure_count: number;
  last_delivery_at: string | null;
  created_at: string;
}

export interface WebhookDeliveryRow {
  id: string;
  endpoint_id: string;
  event_type: string;
  status: string;
  attempt: number;
  max_attempts: number;
  response_status: number | null;
  error: string | null;
  next_retry_at: string;
  delivered_at: string | null;
  created_at: string;
}

export const WEBHOOK_EVENTS = [
  'shipment.created',
  'shipment.status_changed',
  'invoice.created',
  'invoice.status_changed',
  'webhook.test',
];

function randomSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return (
    'whsec_' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function useDeveloperPlatform() {
  const { company } = useCompany();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [endpoints, setEndpoints] = useState<WebhookEndpointRow[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!company) {
      setKeys([]);
      setEndpoints([]);
      setDeliveries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [k, e, d] = await Promise.all([
        supabase
          .from('api_keys')
          .select('id,name,key_prefix,scopes,created_at,last_used_at,revoked_at,expires_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('webhook_endpoints')
          .select('id,url,description,events,secret,is_active,failure_count,last_delivery_at,created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('webhook_deliveries')
          .select(
            'id,endpoint_id,event_type,status,attempt,max_attempts,response_status,error,next_retry_at,delivered_at,created_at'
          )
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (k.error) throw k.error;
      if (e.error) throw e.error;
      if (d.error) throw d.error;
      setKeys(k.data ?? []);
      setEndpoints(e.data ?? []);
      setDeliveries(d.data ?? []);
    } catch (err) {
      console.error('Developer platform fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Returns the plaintext key ONCE — it can never be retrieved again. */
  const createKey = async (name: string, scopes: string[]): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('create_api_key', {
        _name: name,
        _scopes: scopes,
      });
      if (error) throw error;
      const payload = data as { api_key?: string } | null;
      await fetchAll();
      if (!payload?.api_key) throw new Error('No key returned');
      return payload.api_key;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create API key');
      return null;
    }
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Failed to revoke key');
      return;
    }
    toast.success('API key revoked');
    fetchAll();
  };

  const createEndpoint = async (url: string, events: string[], description: string) => {
    if (!company) return false;
    const { error } = await supabase.from('webhook_endpoints').insert({
      company_id: company.id,
      url,
      events,
      description: description || null,
      secret: randomSecret(),
    });
    if (error) {
      console.error(error);
      toast.error('Failed to add endpoint');
      return false;
    }
    toast.success('Webhook endpoint added');
    fetchAll();
    return true;
  };

  const toggleEndpoint = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('webhook_endpoints').update({ is_active }).eq('id', id);
    if (error) {
      toast.error('Failed to update endpoint');
      return;
    }
    fetchAll();
  };

  const deleteEndpoint = async (id: string) => {
    const { error } = await supabase.from('webhook_endpoints').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete endpoint');
      return;
    }
    toast.success('Endpoint deleted');
    fetchAll();
  };

  const sendTestEvent = async () => {
    if (!company) return;
    const { error } = await supabase.rpc('enqueue_webhook_event', {
      _company_id: company.id,
      _event_type: 'webhook.test',
      _payload: { message: 'Test event from the ezys dashboard', occurred_at: new Date().toISOString() },
    });
    if (error) {
      console.error(error);
      toast.error('Failed to queue test event');
      return;
    }
    toast.success('Test event queued');
    fetchAll();
  };

  return {
    company,
    keys,
    endpoints,
    deliveries,
    loading,
    createKey,
    revokeKey,
    createEndpoint,
    toggleEndpoint,
    deleteEndpoint,
    sendTestEvent,
    refetch: fetchAll,
  };
}
