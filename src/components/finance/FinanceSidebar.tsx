import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Receipt, BarChart3, FileCheck, FileText,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  icon: typeof Receipt;
  labelEn: string;
  labelAr: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Receipt, labelEn: 'Expenses', labelAr: 'المصاريف', path: '/finance/expenses' },
  { icon: BarChart3, labelEn: 'Reports', labelAr: 'التقارير', path: '/finance/reports' },
  { icon: FileCheck, labelEn: 'Three-Way Match', labelAr: 'المطابقة الثلاثية', path: '/finance/three-way-match' },
  { icon: FileText, labelEn: 'Statements', labelAr: 'كشوف الحساب', path: '/finance/statements' },
];

export function FinanceSidebar() {
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
        <div>
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-3 mb-1.5">
              {language === 'ar' ? 'المالية' : 'Finance'}
            </p>
          )}
          <div className="space-y-0.5">
            {navItems.map((item) => {
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
