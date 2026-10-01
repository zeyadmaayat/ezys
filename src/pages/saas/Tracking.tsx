import { useCallback, useEffect, useState } from 'react';
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
import { MapPin, Radio, Link2, Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Ev = { id: string; event_type: string; status: string | null; description: string | null; location_text: string | null; is_public: boolean; created_at: string };
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
  const [ev, setEv] = useState({ description: '', location_text: '', lat: '', lng: '', is_public: true });

  const shipment = shipments.find((s) => s.id === sel);

  const load = useCallback(async () => {
    if (!sel) return;
    const [e, p, t] = await Promise.all([
      supabase.from('shipment_events').select('*').eq('shipment_id', sel).order('created_at', { ascending: false }),
      supabase.from('shipment_positions').select('*').eq('shipment_id', sel).order('recorded_at', { ascending: false }).limit(20),
      supabase.from('tracking_tokens').select('token').eq('shipment_id', sel).eq('revoked', false).order('created_at', { ascending: false }).limit(1),
    ]);
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
