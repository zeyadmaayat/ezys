import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { SHIPMENT_STATUS_ORDER } from '@/types/saas-erp';

type Stop = { sequence: number; label: string | null; status: string; planned_arrival: string | null; actual_arrival: string | null };
type Data = {
  shipment: { tracking_number: string; status: string; origin: string; destination: string; expected_delivery: string | null };
  events: { description: string | null; status: string | null; location_text: string | null; created_at: string }[];
  stops: Stop[];
  position: { latitude: number; longitude: number; recorded_at: string } | null;
};

export default function TrackShipment() {
  const { token } = useParams();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => supabase.functions.invoke('public-tracking', { body: { token } }).then(({ data, error }) => {
      if (!alive) return;
      if (error || !data?.shipment) setErr(true); else { setErr(false); setData(data as Data); }
    });
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [token]);

  const idx = data ? SHIPMENT_STATUS_ORDER.indexOf(data.shipment.status as never) : -1;
  const p = data?.position;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6" dir="auto">
      <Card className="w-full max-w-xl mt-10">
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />تتبع الشحنة · Track shipment</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {err && !data ? <p className="text-destructive">الرابط غير صالح أو منتهي · This link is invalid or expired.</p>
            : !data ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <>
              <div><div className="text-xl font-bold">{data.shipment.tracking_number}</div>
                <div className="text-sm text-muted-foreground">{data.shipment.origin} → {data.shipment.destination}</div>
                {data.shipment.expected_delivery && <div className="text-sm">ETA: {new Date(data.shipment.expected_delivery).toLocaleDateString()}</div>}</div>
              <div className="flex gap-1">{SHIPMENT_STATUS_ORDER.map((s, i) => <div key={s} className={`h-2 flex-1 rounded ${i <= idx ? 'bg-primary' : 'bg-muted'}`} title={s} />)}</div>
              <div className="flex items-center gap-2"><Badge>{data.shipment.status.replace(/_/g, ' ')}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" />تحديث تلقائي · Auto-updating</span></div>

              {p && <div className="rounded-md border border-border overflow-hidden">
                <iframe title="map" className="w-full h-56" src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.02},${p.latitude - 0.02},${p.longitude + 0.02},${p.latitude + 0.02}&layer=mapnik&marker=${p.latitude},${p.longitude}`} />
                <div className="text-xs text-muted-foreground p-2 flex items-center gap-1"><MapPin className="w-3 h-3" />آخر موقع · Last seen {new Date(p.recorded_at).toLocaleString()}</div>
              </div>}

              {data.stops.length > 0 && <div><div className="font-medium mb-2">مسار التوقفات · Route stops</div>
                <ol className="space-y-2">{data.stops.map((s) => (
                  <li key={s.sequence} className="flex items-start gap-2 text-sm">
                    {s.status === 'arrived' ? <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" /> : <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />}
                    <div><div>{s.sequence}. {s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.actual_arrival ? `✓ ${new Date(s.actual_arrival).toLocaleString()}` : s.planned_arrival ? `ETA ${new Date(s.planned_arrival).toLocaleString()}` : ''}</div></div>
                  </li>))}</ol></div>}

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
