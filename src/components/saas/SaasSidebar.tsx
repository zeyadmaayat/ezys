import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Building2, Users, Warehouse, Package, FileText, Shield,
  ScrollText, BarChart3, ChevronLeft, ChevronRight, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  icon: typeof Building2;
  labelEn: string;
  labelAr: string;
  path: string;
}

interface NavGroup {
  titleEn: string;
  titleAr: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    titleEn: 'Management',
    titleAr: 'الإدارة',
    items: [
      { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة التحكم', path: '/saas/dashboard' },
      { icon: Building2, labelEn: 'Company Setup', labelAr: 'إعداد الشركة', path: '/saas/setup' },
      { icon: Users, labelEn: 'Clients', labelAr: 'العملاء', path: '/saas/clients' },
      { icon: Warehouse, labelEn: 'Warehouses', labelAr: 'المستودعات', path: '/saas/warehouses' },
    ],
  },
  {
    titleEn: 'Operations',
    titleAr: 'العمليات',
    items: [
      { icon: Package, labelEn: 'Shipments', labelAr: 'الشحنات', path: '/saas/shipments' },
      { icon: FileText, labelEn: 'Invoices', labelAr: 'الفواتير', path: '/saas/invoices' },
    ],
  },
  {
    titleEn: 'Administration',
    titleAr: 'الإدارة',
    items: [
      { icon: Shield, labelEn: 'Roles', labelAr: 'الصلاحيات', path: '/saas/roles' },
      { icon: ScrollText, labelEn: 'Audit Log', labelAr: 'سجل المراجعة', path: '/saas/audit-log' },
    ],
  },
];

export function SaasSidebar() {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside
      className={cn(
        'h-[calc(100vh-4rem)] sticky top-16 border-r border-border bg-card/80 backdrop-blur-sm transition-all duration-200 flex flex-col',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex-1 overflow-y-auto py-3 px-1.5 space-y-4">
        {navGroups.map((group) => (
          <div key={group.titleEn}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-3 mb-1.5">
                {language === 'ar' ? group.titleAr : group.titleEn}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
                      active
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                    title={collapsed ? (language === 'ar' ? item.labelAr : item.labelEn) : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate">
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-8 text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
