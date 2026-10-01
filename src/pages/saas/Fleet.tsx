import { useCallback, useEffect, useState } from 'react';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Truck, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Driver = { id: string; full_name: string; phone: string | null; license_number: string | null; license_expiry: string | null; status: string };
type Vehicle = { id: string; plate_number: string; vehicle_type: string; make_model: string | null; capacity_kg: number | null; insurance_expiry: string | null; registration_expiry: string | null; status: string };

const soon = (d: string | null) => !!d && new Date(d).getTime() - Date.now() < 30 * 864e5;

export default function FleetPage() {
  const { company } = useCompany();
  const { user } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState<null | 'driver' | 'vehicle'>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!company) return;
    const [d, v] = await Promise.all([
      supabase.from('fleet_drivers').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('fleet_vehicles').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
    ]);
    setDrivers((d.data || []) as Driver[]);
    setVehicles((v.data || []) as Vehicle[]);
  }, [company]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!company) return;
    const base = { company_id: company.id, created_by: user?.id };
    const res = open === 'driver'
      ? (form.full_name ? await supabase.from('fleet_drivers').insert({ ...base, full_name: form.full_name, phone: form.phone || null, license_number: form.license_number || null, license_expiry: form.license_expiry || null }) : null)
      : (form.plate_number ? await supabase.from('fleet_vehicles').insert({ ...base, plate_number: form.plate_number, vehicle_type: form.vehicle_type || 'van', make_model: form.make_model || null, capacity_kg: form.capacity_kg ? Number(form.capacity_kg) : null, insurance_expiry: form.insurance_expiry || null, registration_expiry: form.registration_expiry || null }) : null);
    if (!res) return toast.error(ar ? 'املأ الحقول المطلوبة' : 'Fill the required fields');
    if (res.error) return toast.error(res.error.message);
    toast.success(ar ? 'تمت الإضافة' : 'Added');
    setOpen(null); setForm({}); load();
  };

  const remove = async (table: 'fleet_drivers' | 'fleet_vehicles', id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const setStatus = async (table: 'fleet_drivers' | 'fleet_vehicles', id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const f = (k: string, label: string, type = 'text') => (
    <div className="space-y-1"><Label>{label}</Label><Input type={type} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
  );
  const Expiry = ({ d }: { d: string | null }) => d ? <span className={soon(d) ? 'text-destructive font-medium inline-flex items-center gap-1' : ''}>{soon(d) && <AlertTriangle className="w-3 h-3" />}{d}</span> : <>—</>;
  const StatusSel = ({ table, id, value, opts }: { table: 'fleet_drivers' | 'fleet_vehicles'; id: string; value: string; opts: string[] }) => (
    <Select value={value} onValueChange={(v) => setStatus(table, id, v)}>
      <SelectTrigger className="h-7 w-32"><SelectValue /></SelectTrigger>
      <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <SaasLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="w-6 h-6 text-primary" />{ar ? 'إدارة الأسطول' : 'Fleet Management'}</h1>
        <Tabs defaultValue="drivers">
          <TabsList>
            <TabsTrigger value="drivers"><User className="w-4 h-4 me-1" />{ar ? 'السائقون' : 'Drivers'} ({drivers.length})</TabsTrigger>
            <TabsTrigger value="vehicles"><Truck className="w-4 h-4 me-1" />{ar ? 'المركبات' : 'Vehicles'} ({vehicles.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="drivers">
            <Card><CardHeader className="flex-row justify-between items-center"><CardTitle>{ar ? 'السائقون' : 'Drivers'}</CardTitle><Button size="sm" onClick={() => { setForm({}); setOpen('driver'); }}><Plus className="w-4 h-4 me-1" />{ar ? 'سائق' : 'Driver'}</Button></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>{ar ? 'الاسم' : 'Name'}</TableHead><TableHead>{ar ? 'الهاتف' : 'Phone'}</TableHead><TableHead>{ar ? 'الرخصة' : 'Licence'}</TableHead><TableHead>{ar ? 'الانتهاء' : 'Expiry'}</TableHead><TableHead>{ar ? 'الحالة' : 'Status'}</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{drivers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{ar ? 'لا يوجد سائقون بعد' : 'No drivers yet'}</TableCell></TableRow> : drivers.map((d) => (
                  <TableRow key={d.id}><TableCell className="font-medium">{d.full_name}</TableCell><TableCell>{d.phone || '—'}</TableCell><TableCell>{d.license_number || '—'}</TableCell><TableCell><Expiry d={d.license_expiry} /></TableCell>
                    <TableCell><StatusSel table="fleet_drivers" id={d.id} value={d.status} opts={['available', 'on_route', 'off_duty', 'suspended']} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => remove('fleet_drivers', d.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
          </TabsContent>
          <TabsContent value="vehicles">
            <Card><CardHeader className="flex-row justify-between items-center"><CardTitle>{ar ? 'المركبات' : 'Vehicles'}</CardTitle><Button size="sm" onClick={() => { setForm({ vehicle_type: 'van' }); setOpen('vehicle'); }}><Plus className="w-4 h-4 me-1" />{ar ? 'مركبة' : 'Vehicle'}</Button></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>{ar ? 'اللوحة' : 'Plate'}</TableHead><TableHead>{ar ? 'النوع' : 'Type'}</TableHead><TableHead>{ar ? 'الحمولة كغ' : 'Capacity kg'}</TableHead><TableHead>{ar ? 'التأمين' : 'Insurance'}</TableHead><TableHead>{ar ? 'الترخيص' : 'Registration'}</TableHead><TableHead>{ar ? 'الحالة' : 'Status'}</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{vehicles.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{ar ? 'لا توجد مركبات بعد' : 'No vehicles yet'}</TableCell></TableRow> : vehicles.map((v) => (
                  <TableRow key={v.id}><TableCell className="font-medium">{v.plate_number}<div className="text-xs text-muted-foreground">{v.make_model}</div></TableCell><TableCell><Badge variant="outline">{v.vehicle_type}</Badge></TableCell><TableCell>{v.capacity_kg ?? '—'}</TableCell><TableCell><Expiry d={v.insurance_expiry} /></TableCell><TableCell><Expiry d={v.registration_expiry} /></TableCell>
                    <TableCell><StatusSel table="fleet_vehicles" id={v.id} value={v.status} opts={['available', 'in_use', 'maintenance', 'retired']} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => remove('fleet_vehicles', v.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{open === 'driver' ? (ar ? 'إضافة سائق' : 'Add driver') : (ar ? 'إضافة مركبة' : 'Add vehicle')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {open === 'driver' ? <>{f('full_name', ar ? 'الاسم *' : 'Full name *')}{f('phone', ar ? 'الهاتف' : 'Phone')}{f('license_number', ar ? 'رقم الرخصة' : 'Licence no.')}{f('license_expiry', ar ? 'انتهاء الرخصة' : 'Licence expiry', 'date')}</>
              : <>{f('plate_number', ar ? 'رقم اللوحة *' : 'Plate *')}
                <div className="space-y-1"><Label>{ar ? 'النوع' : 'Type'}</Label><Select value={form.vehicle_type} onValueChange={(v) => setForm({ ...form, vehicle_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['motorcycle', 'sedan', 'van', 'pickup', 'truck'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                {f('make_model', ar ? 'الطراز' : 'Make / model')}{f('capacity_kg', ar ? 'الحمولة كغ' : 'Capacity kg', 'number')}{f('insurance_expiry', ar ? 'انتهاء التأمين' : 'Insurance expiry', 'date')}{f('registration_expiry', ar ? 'انتهاء الترخيص' : 'Registration expiry', 'date')}</>}
          </div>
          <DialogFooter><Button onClick={save}>{ar ? 'حفظ' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasLayout>
  );
}
