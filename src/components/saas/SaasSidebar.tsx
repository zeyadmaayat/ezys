import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Building2, Users, Warehouse, Package, FileText, Shield,
  ScrollText, BarChart3, ChevronLeft, ChevronRight, Settings, Sparkles,
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
    titleEn: 'AI',
    titleAr: 'الذكاء الاصطناعي',
    items: [
      { icon: Sparkles, labelEn: 'AI Assistant', labelAr: 'المساعد الذكي', path: '/ai' },
    ],
  },
  {
    titleEn: 'Management',
    titleAr: 'الإدارة',
    items: [
      { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة التحكم', path: '/saas/dashboard' },
      { icon: Building2, labelEn: 'Company Setup', labelAr: 'إعداد الشركة', path: '/saas/setup' },
      { icon: Users, labelEn: 'Clients', labelAr: 'العملاء', path: '/saas/clients' },
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
        'h-[calc(100vh-3rem)] sticky top-12 border-r border-border bg-card transition-all duration-200 flex flex-col',
        collapsed ? 'w-12' : 'w-52'
      )}
    >
      <div className="flex-1 overflow-y-auto py-2 px-1 space-y-3">
        {navGroups.map((group) => (
          <div key={group.titleEn}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold px-2.5 mb-1">
                {language === 'ar' ? group.titleAr : group.titleEn}
              </p>
            )}
            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-2 rounded text-[13px] font-medium transition-all',
                      collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-1.5',
                      active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
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

      <div className="border-t border-border p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-7 text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </aside>
  );
}
