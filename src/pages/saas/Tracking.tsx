import { useCallback, useEffect, useRef, useState } from 'react';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { supabase } from '@/integrations/supabase/client';
import { useShipmentsV2 } from '@/hooks/useShipmentsV2';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Radio, Link2, Copy, Plus, Navigation, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

type Ev = { id: string; event_type: string; status: string | null; description: string | null; location_text: string | null; is_public: boolean; created_at: string };
type Stop = { id: string; route_id: string; sequence: number; label: string | null; status: string; actual_arrival: string | null };
type Pos = { id: string; latitude: number; longitude: number; speed_kmh: number | null; recorded_at: string; source: string };

export default function TrackingPage() {
  const { shipments } = useShipmentsV2();
  const { company } = useCompany();
  const { user } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [sel, setSel] = useState<string>('');
  const [events, setEvents] = useState<Ev[]>([]);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [link, setLink] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopLabel, setStopLabel] = useState('');
  const [sharing, setSharing] = useState(false);
  const watchRef = useRef<number | null>(null);
  const lastSent = useRef(0);
  const [ev, setEv] = useState({ description: '', location_text: '', lat: '', lng: '', is_public: true });

  const shipment = shipments.find((s) => s.id === sel);

  const load = useCallback(async () => {
    if (!sel) return;
    const [e, p, t, st] = await Promise.all([
      supabase.from('shipment_events').select('*').eq('shipment_id', sel).order('created_at', { ascending: false }),
      supabase.from('shipment_positions').select('*').eq('shipment_id', sel).order('recorded_at', { ascending: false }).limit(20),
      supabase.from('tracking_tokens').select('token').eq('shipment_id', sel).eq('revoked', false).order('created_at', { ascending: false }).limit(1),
      supabase.from('route_stops').select('id, route_id, sequence, label, status, actual_arrival').eq('shipment_id', sel).order('sequence'),
    ]);
    setStops((st.data || []) as Stop[]);
    setEvents((e.data || []) as Ev[]);
    setPositions((p.data || []) as Pos[]);
    setLink(t.data?.[0] ? `${window.location.origin}/track/${t.data[0].token}` : '');
  }, [sel]);

  useEffect(() => {
    load();
    if (!sel) return;
    const ch = supabase.channel(`track-${sel}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipment_events', filter: `shipment_id=eq.${sel}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipment_positions', filter: `shipment_id=eq.${sel}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'route_stops', filter: `shipment_id=eq.${sel}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sel, load]);

  const addEvent = async () => {
    if (!company || !sel || !ev.description) return toast.error(ar ? 'اكتب وصف الحدث' : 'Enter a description');
    const lat = ev.lat ? Number(ev.lat) : null, lng = ev.lng ? Number(ev.lng) : null;
    const { error } = await supabase.from('shipment_events').insert({
      company_id: company.id, shipment_id: sel, event_type: 'note', status: shipment?.status ?? null,
      description: ev.description, location_text: ev.location_text || null, latitude: lat, longitude: lng, is_public: ev.is_public, created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    if (lat !== null && lng !== null) {
      await supabase.from('shipment_positions').insert({ company_id: company.id, shipment_id: sel, latitude: lat, longitude: lng, source: 'manual' });
    }
    setEv({ description: '', location_text: '', lat: '', lng: '', is_public: true });
    load();
  };

  const stopSharing = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null; setSharing(false);
  }, []);
  useEffect(() => stopSharing, [sel, stopSharing]);

  const startSharing = () => {
    if (!company || !sel) return;
    if (!navigator.geolocation) return toast.error(ar ? 'الجهاز لا يدعم تحديد الموقع' : 'Location not supported on this device');
    watchRef.current = navigator.geolocation.watchPosition(async (pos) => {
      if (Date.now() - lastSent.current < 30000) return;
      lastSent.current = Date.now();
      await supabase.from('shipment_positions').insert({ company_id: company.id, shipment_id: sel, latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        speed_kmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : null, source: 'device' });
    }, () => { toast.error(ar ? 'لم يتم السماح بالوصول للموقع' : 'Location permission denied'); stopSharing(); }, { enableHighAccuracy: true });
    lastSent.current = 0; setSharing(true);
  };

  const addStop = async () => {
    if (!company || !shipment || !stopLabel.trim()) return toast.error(ar ? 'اكتب اسم التوقف' : 'Enter a stop name');
    let routeId = stops[0]?.route_id;
    if (!routeId) {
      const { data, error } = await supabase.from('routes').insert({ company_id: company.id, name: shipment.tracking_number, created_by: user?.id }).select('id').single();
      if (error) return toast.error(error.message);
      routeId = data.id;
    }
    const { error } = await supabase.from('route_stops').insert({ company_id: company.id, route_id: routeId, shipment_id: sel, label: stopLabel.trim(),
      sequence: (stops[stops.length - 1]?.sequence ?? 0) + 1, status: 'pending' });
    if (error) return toast.error(error.message);
    setStopLabel(''); load();
  };

  const markArrived = async (s: Stop) => {
    const { error } = await supabase.from('route_stops').update({ status: 'arrived', actual_arrival: new Date().toISOString() }).eq('id', s.id);
    if (error) return toast.error(error.message);
    if (company) await supabase.from('shipment_events').insert({ company_id: company.id, shipment_id: sel, event_type: 'stop_arrived', status: shipment?.status ?? null,
      description: (ar ? 'وصل إلى: ' : 'Arrived at: ') + (s.label ?? ''), location_text: s.label, is_public: true, created_by: user?.id });
    load();
  };

  const makeLink = async () => {
    if (!company || !sel) return;
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const { error } = await supabase.from('tracking_tokens').insert({ company_id: company.id, shipment_id: sel, token, created_by: user?.id });
    if (error) return toast.error(error.message);
    load();
  };

  const last = positions[0];

  return (
    <SaasLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="w-6 h-6 text-primary" />{ar ? 'متابعة الشحنات' : 'Shipment Tracking'}</h1>
        <Select value={sel} onValueChange={setSel}>
          <SelectTrigger className="max-w-md"><SelectValue placeholder={ar ? 'اختر شحنة' : 'Select a shipment'} /></SelectTrigger>
          <SelectContent>{shipments.map((s) => <SelectItem key={s.id} value={s.id}>{s.tracking_number} — {s.origin} → {s.destination}</SelectItem>)}</SelectContent>
        </Select>
        {!shipment ? <p className="text-muted-foreground">{shipments.length ? (ar ? 'اختر شحنة لعرض مسارها.' : 'Pick a shipment to see its timeline.') : (ar ? 'لا توجد شحنات بعد.' : 'No shipments yet.')}</p> : (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2">{shipment.tracking_number}<Badge>{shipment.status}</Badge><span className="text-xs text-muted-foreground font-normal flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{ar ? 'مباشر' : 'Live'}</span></CardTitle></CardHeader>
              <CardContent>
                {events.length === 0 ? <p className="text-muted-foreground text-sm">{ar ? 'لا توجد أحداث بعد.' : 'No events yet.'}</p> : (
                  <ol className="border-s border-border ms-2 space-y-4">{events.map((e) => (
                    <li key={e.id} className="ms-4 relative"><span className="absolute -start-[1.4rem] top-1 w-3 h-3 rounded-full bg-primary" />
                      <div className="text-sm font-medium">{e.description || e.event_type}{e.status && <Badge variant="outline" className="ms-2">{e.status}</Badge>}{!e.is_public && <Badge variant="secondary" className="ms-1">{ar ? 'داخلي' : 'internal'}</Badge>}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()} {e.location_text && `· ${e.location_text}`}</div></li>))}</ol>)}
              </CardContent></Card>
            <div className="space-y-4">
              <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" />{ar ? 'آخر موقع' : 'Last position'}</CardTitle></CardHeader>
                <CardContent className="text-sm">{last ? <><div>{last.latitude.toFixed(5)}, {last.longitude.toFixed(5)}</div><div className="text-xs text-muted-foreground">{new Date(last.recorded_at).toLocaleString()}</div>
                  <a className="text-primary text-xs underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${last.latitude}&mlon=${last.longitude}#map=14/${last.latitude}/${last.longitude}`}>{ar ? 'فتح على الخريطة' : 'Open on map'}</a></> : <span className="text-muted-foreground">{ar ? 'لا يوجد موقع' : 'No position yet'}</span>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Navigation className="w-4 h-4" />{ar ? 'مشاركة الموقع تلقائياً' : 'Auto location sharing'}</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm"><p className="text-muted-foreground text-xs">{ar ? 'افتح هذه الصفحة على جوال السائق، وسيُرسل موقعه كل 30 ثانية.' : "Open this page on the driver's phone; it sends the location every 30 seconds."}</p>
                  {sharing ? <Button variant="destructive" className="w-full" onClick={stopSharing}>{ar ? 'إيقاف المشاركة' : 'Stop sharing'}</Button>
                    : <Button className="w-full" onClick={startSharing}>{ar ? 'بدء المشاركة' : 'Start sharing'}</Button>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">{ar ? 'مسار التوقفات' : 'Route stops'}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {stops.map((s) => <div key={s.id} className="flex items-center gap-2 text-sm">
                    {s.status === 'arrived' ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                    <span className="flex-1">{s.sequence}. {s.label}</span>
                    {s.status !== 'arrived' && <Button size="sm" variant="outline" onClick={() => markArrived(s)}>{ar ? 'وصل' : 'Arrived'}</Button>}</div>)}
                  <div className="flex gap-2"><Input placeholder={ar ? 'اسم التوقف' : 'Stop name'} value={stopLabel} onChange={(e) => setStopLabel(e.target.value)} /><Button onClick={addStop}><Plus className="w-4 h-4" /></Button></div>
                </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">{ar ? 'إضافة تحديث' : 'Add update'}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Input placeholder={ar ? 'الوصف *' : 'Description *'} value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} />
                  <Input placeholder={ar ? 'المكان' : 'Location'} value={ev.location_text} onChange={(e) => setEv({ ...ev, location_text: e.target.value })} />
                  <div className="flex gap-2"><Input placeholder="lat" value={ev.lat} onChange={(e) => setEv({ ...ev, lat: e.target.value })} /><Input placeholder="lng" value={ev.lng} onChange={(e) => setEv({ ...ev, lng: e.target.value })} /></div>
                  <div className="flex items-center gap-2"><Switch checked={ev.is_public} onCheckedChange={(v) => setEv({ ...ev, is_public: v })} /><Label>{ar ? 'ظاهر للعميل' : 'Visible to customer'}</Label></div>
                  <Button className="w-full" onClick={addEvent}><Plus className="w-4 h-4 me-1" />{ar ? 'إضافة' : 'Add'}</Button>
                </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4" />{ar ? 'رابط تتبع للعميل' : 'Customer tracking link'}</CardTitle></CardHeader>
                <CardContent className="space-y-2">{link ? <><Input readOnly value={link} /><Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(link); toast.success(ar ? 'تم النسخ' : 'Copied'); }}><Copy className="w-4 h-4 me-1" />{ar ? 'نسخ' : 'Copy'}</Button></>
                  : <Button className="w-full" onClick={makeLink}>{ar ? 'إنشاء رابط' : 'Create link'}</Button>}</CardContent></Card>
            </div>
          </div>)}
      </div>
    </SaasLayout>
  );
}
