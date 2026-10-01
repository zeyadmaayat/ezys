import { useCallback, useEffect, useMemo, useState } from 'react';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Card_ = { id: string; name: string; currency: string; volumetric_divisor: number };
type Rule = { id: string; rate_card_id: string; service_level: string; min_weight_kg: number; max_weight_kg: number | null; base_price: number; price_per_kg: number; price_per_km: number; min_charge: number; fuel_surcharge_pct: number };

const SERVICES = ['standard', 'express', 'same_day'];

export default function FreightCalculatorPage() {
  const { company } = useCompany();
  const { user } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [cards, setCards] = useState<Card_[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [cardId, setCardId] = useState('');
  const [newCard, setNewCard] = useState('');
  const [nr, setNr] = useState({ service_level: 'standard', min_weight_kg: '0', max_weight_kg: '', base_price: '0', price_per_kg: '0', price_per_km: '0', min_charge: '0', fuel_surcharge_pct: '0' });
  const [calc, setCalc] = useState({ weight: '', l: '', w: '', h: '', distance: '', service: 'standard' });

  const load = useCallback(async () => {
    if (!company) return;
    const [c, r] = await Promise.all([
      supabase.from('rate_cards').select('*').eq('company_id', company.id).eq('is_active', true).order('created_at'),
      supabase.from('rate_rules').select('*').eq('company_id', company.id),
    ]);
    const cs = (c.data || []) as Card_[];
    setCards(cs); setRules((r.data || []) as Rule[]);
    setCardId((prev) => prev || cs[0]?.id || '');
  }, [company]);
  useEffect(() => { load(); }, [load]);

  const card = cards.find((c) => c.id === cardId);
  const cardRules = rules.filter((r) => r.rate_card_id === cardId);

  const addCard = async () => {
    if (!company || !newCard) return;
    const { data, error } = await supabase.from('rate_cards').insert({ company_id: company.id, name: newCard, currency: 'JOD', created_by: user?.id }).select().single();
    if (error) return toast.error(error.message);
    setNewCard(''); setCardId(data.id); load();
  };
  const addRule = async () => {
    if (!company || !cardId) return toast.error(ar ? 'أنشئ جدول أسعار أولاً' : 'Create a rate card first');
    const n = (v: string) => Number(v || 0);
    const { error } = await supabase.from('rate_rules').insert({
      company_id: company.id, rate_card_id: cardId, service_level: nr.service_level, min_weight_kg: n(nr.min_weight_kg),
      max_weight_kg: nr.max_weight_kg ? n(nr.max_weight_kg) : null, base_price: n(nr.base_price), price_per_kg: n(nr.price_per_kg),
      price_per_km: n(nr.price_per_km), min_charge: n(nr.min_charge), fuel_surcharge_pct: n(nr.fuel_surcharge_pct),
    });
    if (error) return toast.error(error.message);
    load();
  };
  const delRule = async (id: string) => { await supabase.from('rate_rules').delete().eq('id', id); load(); };

  const result = useMemo(() => {
    const actual = Number(calc.weight || 0);
    const vol = (Number(calc.l || 0) * Number(calc.w || 0) * Number(calc.h || 0)) / (card?.volumetric_divisor || 5000);
    const chargeable = Math.max(actual, vol);
    const dist = Number(calc.distance || 0);
    if (!chargeable) return null;
    const rule = cardRules.find((r) => r.service_level === calc.service && chargeable >= r.min_weight_kg && (r.max_weight_kg === null || chargeable <= r.max_weight_kg));
    if (!rule) return { chargeable, vol, rule: null as Rule | null, total: 0 };
    const sub = rule.base_price + rule.price_per_kg * chargeable + rule.price_per_km * dist;
    const total = Math.max(sub * (1 + rule.fuel_surcharge_pct / 100), rule.min_charge);
    return { chargeable, vol, rule, total };
  }, [calc, cardRules, card]);

  const inp = (k: keyof typeof nr, label: string) => <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type="number" value={nr[k]} onChange={(e) => setNr({ ...nr, [k]: e.target.value })} /></div>;
  const cin = (k: keyof typeof calc, label: string) => <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type="number" value={calc[k]} onChange={(e) => setCalc({ ...calc, [k]: e.target.value })} /></div>;
  const svc = (v: string, on: (v: string) => void) => <Select value={v} onValueChange={on}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>;

  return (
    <SaasLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="w-6 h-6 text-primary" />{ar ? 'حاسبة تكلفة الشحن' : 'Freight Calculator'}</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">{ar ? 'احسب السعر' : 'Get a price'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">{cin('weight', ar ? 'الوزن كغ' : 'Weight kg')}{cin('distance', ar ? 'المسافة كم' : 'Distance km')}</div>
              <div className="grid grid-cols-3 gap-2">{cin('l', ar ? 'الطول سم' : 'L cm')}{cin('w', ar ? 'العرض سم' : 'W cm')}{cin('h', ar ? 'الارتفاع سم' : 'H cm')}</div>
              <div className="space-y-1"><Label className="text-xs">{ar ? 'الخدمة' : 'Service'}</Label>{svc(calc.service, (v) => setCalc({ ...calc, service: v }))}</div>
              {result && <div className="rounded-md border border-border p-3 text-sm space-y-1">
                <div>{ar ? 'الوزن الحجمي' : 'Volumetric weight'}: {result.vol.toFixed(2)} kg</div>
                <div>{ar ? 'الوزن المحتسب' : 'Chargeable weight'}: <b>{result.chargeable.toFixed(2)} kg</b></div>
                {result.rule ? <div className="text-2xl font-bold text-primary">{result.total.toFixed(2)} {card?.currency}</div>
                  : <div className="text-destructive">{ar ? 'لا توجد قاعدة سعر لهذا الوزن والخدمة.' : 'No rate rule matches this weight and service.'}</div>}
              </div>}
            </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">{ar ? 'جدول الأسعار' : 'Rate card'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={cardId} onValueChange={setCardId}><SelectTrigger><SelectValue placeholder={ar ? 'لا يوجد جدول' : 'No rate card'} /></SelectTrigger><SelectContent>{cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                <Input placeholder={ar ? 'اسم جدول جديد' : 'New card name'} value={newCard} onChange={(e) => setNewCard(e.target.value)} /><Button size="icon" onClick={addCard}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1"><Label className="text-xs">{ar ? 'الخدمة' : 'Service'}</Label>{svc(nr.service_level, (v) => setNr({ ...nr, service_level: v }))}</div>
                {inp('min_weight_kg', ar ? 'من كغ' : 'From kg')}{inp('max_weight_kg', ar ? 'إلى كغ' : 'To kg')}{inp('base_price', ar ? 'أساسي' : 'Base')}
                {inp('price_per_kg', ar ? 'لكل كغ' : 'Per kg')}{inp('price_per_km', ar ? 'لكل كم' : 'Per km')}{inp('min_charge', ar ? 'حد أدنى' : 'Min')}{inp('fuel_surcharge_pct', ar ? 'وقود %' : 'Fuel %')}
              </div>
              <Button size="sm" onClick={addRule}><Plus className="w-4 h-4 me-1" />{ar ? 'إضافة قاعدة' : 'Add rule'}</Button>
              <Table><TableHeader><TableRow><TableHead>{ar ? 'الخدمة' : 'Service'}</TableHead><TableHead>kg</TableHead><TableHead>{ar ? 'أساسي' : 'Base'}</TableHead><TableHead>/kg</TableHead><TableHead>/km</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{cardRules.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{ar ? 'لا توجد قواعد' : 'No rules'}</TableCell></TableRow> : cardRules.map((r) => (
                  <TableRow key={r.id}><TableCell>{r.service_level}</TableCell><TableCell>{r.min_weight_kg}–{r.max_weight_kg ?? '∞'}</TableCell><TableCell>{r.base_price}</TableCell><TableCell>{r.price_per_kg}</TableCell><TableCell>{r.price_per_km}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => delRule(r.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>))}</TableBody></Table>
            </CardContent></Card>
        </div>
      </div>
    </SaasLayout>
  );
}
