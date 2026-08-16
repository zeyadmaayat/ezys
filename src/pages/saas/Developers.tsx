import { useState } from 'react';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { Seo } from '@/components/Seo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDeveloperPlatform, WEBHOOK_EVENTS } from '@/hooks/useDeveloperPlatform';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Code2, Copy, KeyRound, Plus, Send, Trash2, Webhook, Loader2 } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-v1`;

const CODE_CURL = `curl "${API_BASE}/shipments?limit=10" \\
  -H "Authorization: Bearer ezys_live_..."`;

const CODE_VERIFY = `// Node.js — verify the X-Ezys-Signature header
import crypto from "node:crypto";

export function verifyEzysWebhook(rawBody, headers, secret) {
  const timestamp = headers["x-ezys-timestamp"];
  const signature = headers["x-ezys-signature"]; // "sha256=<hex>"
  if (!timestamp || !signature) return false;

  // reject anything older than 5 minutes (replay protection)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(\`\${timestamp}.\${rawBody}\`)
      .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}`;

const CODE_PAYLOAD = `{
  "event_type": "shipment.status_changed",
  "delivery_id": "8f2c...",
  "occurred_at": "2026-08-16T12:00:00.000Z",
  "data": {
    "id": "3a11...",
    "tracking_number": "SHP-000128",
    "status": "OUT_FOR_DELIVERY",
    "previous_status": "IN_WAREHOUSE"
  }
}`;

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto text-foreground/90">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition"
        onClick={() => {
          navigator.clipboard.writeText(code);
          toast.success('Copied');
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function Developers() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const {
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
  } = useDeveloperPlatform();

  const [keyDialog, setKeyDialog] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState<string[]>(['read']);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [epDialog, setEpDialog] = useState(false);
  const [epUrl, setEpUrl] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epEvents, setEpEvents] = useState<string[]>(['shipment.status_changed']);

  const toggleInList = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error(ar ? 'أدخل اسماً للمفتاح' : 'Enter a key name');
      return;
    }
    setCreating(true);
    const key = await createKey(keyName.trim(), keyScopes.length ? keyScopes : ['read']);
    setCreating(false);
    if (key) {
      setNewKey(key);
      setKeyDialog(false);
      setKeyName('');
      setKeyScopes(['read']);
    }
  };

  const handleCreateEndpoint = async () => {
    if (!/^https:\/\/.+/.test(epUrl)) {
      toast.error(ar ? 'يجب أن يبدأ الرابط بـ https://' : 'URL must start with https://');
      return;
    }
    const ok = await createEndpoint(epUrl.trim(), epEvents, epDesc.trim());
    if (ok) {
      setEpDialog(false);
      setEpUrl('');
      setEpDesc('');
      setEpEvents(['shipment.status_changed']);
    }
  };

  const statusVariant = (status: string) =>
    status === 'delivered' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';

  return (
    <SaasLayout>
      <Seo
        title="Developer Platform — ezys Logistic HUB"
        description="REST API keys, webhooks with HMAC signatures and automatic retries for the ezys logistics platform."
        path="/saas/developers"
      />
      <div className="p-4 md:p-6 space-y-5 max-w-6xl">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            {ar ? 'منصة المطورين' : 'Developer Platform'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ar
              ? 'واجهة REST API، مفاتيح المصادقة، وWebhooks موقّعة بـ HMAC مع إعادة محاولات تلقائية.'
              : 'REST API, authentication keys, and HMAC-signed webhooks with automatic retries.'}
          </p>
        </header>

        {!company && !loading && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              {ar
                ? 'يجب إعداد الشركة أولاً قبل إنشاء مفاتيح API.'
                : 'Set up your company before creating API keys.'}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="docs">
          <TabsList>
            <TabsTrigger value="docs">{ar ? 'التوثيق' : 'Docs'}</TabsTrigger>
            <TabsTrigger value="keys">{ar ? 'مفاتيح API' : 'API Keys'}</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="deliveries">{ar ? 'سجل التوصيل' : 'Deliveries'}</TabsTrigger>
          </TabsList>

          {/* ---------------- DOCS ---------------- */}
          <TabsContent value="docs" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{ar ? 'البداية السريعة' : 'Quick start'}</CardTitle>
                <CardDescription>
                  {ar
                    ? 'كل الطلبات تحتاج ترويسة Authorization بمفتاح API. الحد: 120 طلب/دقيقة لكل مفتاح.'
                    : 'Every request needs an Authorization header with your API key. Limit: 120 requests/minute per key.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Base URL</Label>
                  <CodeBlock code={API_BASE} />
                </div>
                <CodeBlock code={CODE_CURL} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{ar ? 'نقاط النهاية' : 'Endpoints'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>{ar ? 'الوصف' : 'Description'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {[
                      ['GET', '/ping', 'read', ar ? 'فحص المفتاح والصلاحيات' : 'Verify key and scopes'],
                      ['GET', '/shipments', 'read', ar ? 'قائمة الشحنات' : 'List shipments'],
                      ['GET', '/shipments/{id}', 'read', ar ? 'شحنة واحدة' : 'Single shipment'],
                      ['GET', '/invoices', 'read', ar ? 'قائمة الفواتير' : 'List invoices'],
                      ['GET', '/items', 'read', ar ? 'قائمة المواد' : 'List items'],
                      ['GET', '/clients', 'read', ar ? 'العملاء والموردون' : 'Clients and vendors'],
                      ['POST', '/webhooks/test', 'write', ar ? 'إرسال حدث تجريبي' : 'Emit a test event'],
                    ].map(([m, p, s, d]) => (
                      <TableRow key={p}>
                        <TableCell>
                          <Badge variant="outline">{m}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{p}</TableCell>
                        <TableCell>{s}</TableCell>
                        <TableCell className="text-muted-foreground">{d}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-3">
                  {ar
                    ? 'معاملات القائمة: limit (حتى 200)، offset، status.'
                    : 'List parameters: limit (max 200), offset, status.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{ar ? 'شكل حدث Webhook' : 'Webhook payload'}</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={CODE_PAYLOAD} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {ar ? 'التحقق من التوقيع (HMAC)' : 'Verifying signatures (HMAC)'}
                </CardTitle>
                <CardDescription>
                  {ar
                    ? 'التوقيع = sha256=HMAC(secret, "timestamp.body"). أعد المحاولات: 30s → 2m → 10m → 1h → 6h (5 محاولات).'
                    : 'Signature = sha256=HMAC(secret, "timestamp.body"). Retries: 30s → 2m → 10m → 1h → 6h (5 attempts).'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={CODE_VERIFY} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- KEYS ---------------- */}
          <TabsContent value="keys" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {ar ? 'المفتاح يظهر مرة واحدة فقط عند الإنشاء.' : 'Keys are shown only once at creation.'}
              </p>
              <Button size="sm" onClick={() => setKeyDialog(true)} disabled={!company}>
                <Plus className="h-4 w-4 mr-1" />
                {ar ? 'مفتاح جديد' : 'New key'}
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="py-10 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : keys.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {ar ? 'لا مفاتيح بعد' : 'No API keys yet'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{ar ? 'الاسم' : 'Name'}</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead>{ar ? 'آخر استخدام' : 'Last used'}</TableHead>
                        <TableHead>{ar ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                      {keys.map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="font-medium">{k.name}</TableCell>
                          <TableCell className="font-mono text-xs">{k.key_prefix}…</TableCell>
                          <TableCell className="space-x-1">
                            {k.scopes.map((s) => (
                              <Badge key={s} variant="outline">
                                {s}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>
                            {k.revoked_at ? (
                              <Badge variant="destructive">{ar ? 'ملغى' : 'Revoked'}</Badge>
                            ) : (
                              <Badge>{ar ? 'نشط' : 'Active'}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!k.revoked_at && (
                              <Button size="sm" variant="ghost" onClick={() => revokeKey(k.id)}>
                                {ar ? 'إلغاء' : 'Revoke'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- WEBHOOKS ---------------- */}
          <TabsContent value="webhooks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {ar ? 'روابط HTTPS فقط.' : 'HTTPS endpoints only.'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={sendTestEvent} disabled={!company}>
                  <Send className="h-4 w-4 mr-1" />
                  {ar ? 'حدث تجريبي' : 'Test event'}
                </Button>
                <Button size="sm" onClick={() => setEpDialog(true)} disabled={!company}>
                  <Plus className="h-4 w-4 mr-1" />
                  {ar ? 'إضافة' : 'Add endpoint'}
                </Button>
              </div>
            </div>
            {endpoints.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  <Webhook className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  {ar ? 'لا توجد نقاط استقبال' : 'No endpoints configured'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {endpoints.map((ep) => (
                  <Card key={ep.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm truncate">{ep.url}</p>
                          {ep.description && (
                            <p className="text-xs text-muted-foreground">{ep.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={ep.is_active}
                            onCheckedChange={(v) => toggleEndpoint(ep.id, v)}
                          />
                          <Button size="icon" variant="ghost" onClick={() => deleteEndpoint(ep.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ep.events.map((e) => (
                          <Badge key={e} variant="secondary" className="text-[10px]">
                            {e}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <KeyRound className="h-3.5 w-3.5" />
                        <span className="font-mono truncate">{ep.secret}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(ep.secret);
                            toast.success('Secret copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {ep.failure_count > 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {ep.failure_count} {ar ? 'فشل' : 'failures'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---------------- DELIVERIES ---------------- */}
          <TabsContent value="deliveries" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {deliveries.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {ar ? 'لا توصيلات بعد' : 'No deliveries yet'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{ar ? 'الحدث' : 'Event'}</TableHead>
                        <TableHead>{ar ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{ar ? 'المحاولة' : 'Attempt'}</TableHead>
                        <TableHead>HTTP</TableHead>
                        <TableHead>{ar ? 'الوقت' : 'Time'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {deliveries.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono">{d.event_type}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {d.attempt}/{d.max_attempts}
                          </TableCell>
                          <TableCell>{d.response_status ?? (d.error ? 'ERR' : '—')}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(d.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create key dialog */}
      <Dialog open={keyDialog} onOpenChange={setKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'إنشاء مفتاح API' : 'Create API key'}</DialogTitle>
            <DialogDescription>
              {ar ? 'اختر الصلاحيات المطلوبة فقط.' : 'Grant only the scopes you need.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{ar ? 'اسم المفتاح' : 'Key name'}</Label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Production integration"
              />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              {['read', 'write', 'admin'].map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={keyScopes.includes(s)}
                    onCheckedChange={() => toggleInList(keyScopes, s, setKeyScopes)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyDialog(false)}>
              {ar ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateKey} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {ar ? 'إنشاء' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show new key once */}
      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'انسخ المفتاح الآن' : 'Copy your key now'}</DialogTitle>
            <DialogDescription>
              {ar
                ? 'لن يظهر هذا المفتاح مرة أخرى. احفظه في مكان آمن.'
                : 'This key will not be shown again. Store it somewhere safe.'}
            </DialogDescription>
          </DialogHeader>
          {newKey && <CodeBlock code={newKey} />}
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>{ar ? 'تم' : 'Done'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add endpoint dialog */}
      <Dialog open={epDialog} onOpenChange={setEpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'إضافة نقطة استقبال' : 'Add webhook endpoint'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input
                value={epUrl}
                onChange={(e) => setEpUrl(e.target.value)}
                placeholder="https://example.com/webhooks/ezys"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{ar ? 'الوصف' : 'Description'}</Label>
              <Input value={epDesc} onChange={(e) => setEpDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'الأحداث' : 'Events'}</Label>
              {WEBHOOK_EVENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 text-sm font-mono">
                  <Checkbox
                    checked={epEvents.includes(e)}
                    onCheckedChange={() => toggleInList(epEvents, e, setEpEvents)}
                  />
                  {e}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEpDialog(false)}>
              {ar ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateEndpoint}>{ar ? 'إضافة' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasLayout>
  );
}
