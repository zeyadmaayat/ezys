import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Shield, Eye, Pencil, Lock, Search } from 'lucide-react';
import { FIELD_POLICIES } from '@/lib/field-permissions';
import type { AppRole } from '@/types/erp';

const ROLES: AppRole[] = ['admin', 'operations', 'warehouse', 'finance', 'viewer', 'user'];

const entityLabels: Record<string, { en: string; ar: string }> = {
  invoices: { en: 'Invoices', ar: 'الفواتير' },
  payments: { en: 'Payments', ar: 'المدفوعات' },
  expenses: { en: 'Expenses', ar: 'المصاريف' },
  shipment_costs: { en: 'Shipment costs', ar: 'كلف الشحنات' },
  shipments: { en: 'Shipments', ar: 'الشحنات' },
  customers: { en: 'Customers', ar: 'العملاء' },
  items: { en: 'Items', ar: 'الأصناف' },
  dp_drivers: { en: 'Drivers', ar: 'السائقون' },
  profiles: { en: 'User profiles', ar: 'ملفات المستخدمين' },
};

export default function FieldPermissions() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const list: { entity: string; field: string; policy: (typeof FIELD_POLICIES)[string][string] }[] = [];
    for (const [entity, fields] of Object.entries(FIELD_POLICIES)) {
      for (const [field, policy] of Object.entries(fields)) list.push({ entity, field, policy });
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.entity.includes(q) ||
        r.field.includes(q) ||
        r.policy.labelEn.toLowerCase().includes(q) ||
        r.policy.labelAr.includes(query.trim()),
    );
  }, [query]);

  if (!isAdmin) {
    return (
      <SaasLayout>
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{ar ? 'غير مخوّل' : 'Access denied'}</h2>
          <p className="text-muted-foreground">
            {ar ? 'تحتاج صلاحية مدير للوصول لهذه الصفحة.' : 'You need admin privileges to view this page.'}
          </p>
        </div>
      </SaasLayout>
    );
  }

  const grouped = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    acc[row.entity] = acc[row.entity] || [];
    acc[row.entity].push(row);
    return acc;
  }, {});

  return (
    <SaasLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/roles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {ar ? 'صلاحيات على مستوى الحقول' : 'Field-level permissions'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ar
                ? 'مصفوفة الحقول الحساسة: من يستطيع القراءة ومن يستطيع التعديل.'
                : 'Matrix of sensitive fields: who can read them and who can edit them.'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">{ar ? 'البحث' : 'Search'}</CardTitle>
              <CardDescription>
                {ar ? `${rows.length} حقل محمي` : `${rows.length} protected fields`}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={ar ? 'ابحث عن حقل...' : 'Search a field...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardHeader>
        </Card>

        {Object.entries(grouped).map(([entity, entityRows]) => (
          <Card key={entity}>
            <CardHeader>
              <CardTitle className="text-base">
                {ar ? entityLabels[entity]?.ar ?? entity : entityLabels[entity]?.en ?? entity}
              </CardTitle>
              <CardDescription className="font-mono text-xs">{entity}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar ? 'الحقل' : 'Field'}</TableHead>
                    {ROLES.map((role) => (
                      <TableHead key={role} className="text-center capitalize">{role}</TableHead>
                    ))}
                    <TableHead className="text-center">{ar ? 'الإخفاء' : 'Mask'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entityRows.map(({ field, policy }) => (
                    <TableRow key={field}>
                      <TableCell>
                        <div className="font-medium">{ar ? policy.labelAr : policy.labelEn}</div>
                        <div className="font-mono text-xs text-muted-foreground">{field}</div>
                      </TableCell>
                      {ROLES.map((role) => {
                        const isAdminRole = role === 'admin';
                        const canRead = isAdminRole || policy.read.includes(role);
                        const canWrite = isAdminRole || policy.write.includes(role);
                        return (
                          <TableCell key={role} className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canWrite ? (
                                <Pencil className="h-4 w-4 text-primary" />
                              ) : canRead ? (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Lock className="h-4 w-4 text-destructive/70" />
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge variant="outline">{policy.mask ?? 'dots'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="flex flex-wrap gap-6 py-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Pencil className="h-4 w-4 text-primary" /> {ar ? 'قراءة وتعديل' : 'Read & edit'}</span>
            <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> {ar ? 'قراءة فقط' : 'Read only'}</span>
            <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-destructive/70" /> {ar ? 'مخفي' : 'Hidden'}</span>
          </CardContent>
        </Card>
      </div>
    </SaasLayout>
  );
}
