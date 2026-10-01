import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';
import { SHIPMENT_STATUS_ORDER } from '@/types/saas-erp';

type Data = { shipment: { tracking_number: string; status: string; origin: string; destination: string; expected_delivery: string | null }; events: { description: string | null; status: string | null; location_text: string | null; created_at: string }[] };

export default function TrackShipment() {
  const { token } = useParams();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    supabase.functions.invoke('public-tracking', { body: { token } }).then(({ data, error }) => {
      if (error || !data?.shipment) setErr(true); else setData(data as Data);
    });
  }, [token]);

  const idx = data ? SHIPMENT_STATUS_ORDER.indexOf(data.shipment.status as never) : -1;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6" dir="auto">
      <Card className="w-full max-w-xl mt-10">
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />تتبع الشحنة · Track shipment</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {err ? <p className="text-destructive">الرابط غير صالح أو منتهي · This link is invalid or expired.</p>
            : !data ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <>
              <div><div className="text-xl font-bold">{data.shipment.tracking_number}</div>
                <div className="text-sm text-muted-foreground">{data.shipment.origin} → {data.shipment.destination}</div>
                {data.shipment.expected_delivery && <div className="text-sm">ETA: {new Date(data.shipment.expected_delivery).toLocaleDateString()}</div>}</div>
              <div className="flex gap-1">{SHIPMENT_STATUS_ORDER.map((s, i) => <div key={s} className={`h-2 flex-1 rounded ${i <= idx ? 'bg-primary' : 'bg-muted'}`} title={s} />)}</div>
              <Badge>{data.shipment.status.replace(/_/g, ' ')}</Badge>
              <ol className="border-s border-border ms-2 space-y-3">{data.events.map((e, i) => (
                <li key={i} className="ms-4 relative"><span className="absolute -start-[1.4rem] top-1 w-3 h-3 rounded-full bg-primary" />
                  <div className="text-sm font-medium">{e.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()} {e.location_text && `· ${e.location_text}`}</div></li>))}</ol>
            </>}
        </CardContent>
      </Card>
    </div>
  );
}
