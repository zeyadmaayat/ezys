import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Boxes, Warehouse, MapPin, Package, ShoppingCart, FileText,
  ClipboardList, RotateCcw, RefreshCw, PackageCheck, BarChart3,
  ChevronLeft, ChevronRight, Layers, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  icon: typeof Boxes;
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
    titleEn: 'Operations',
    titleAr: 'العمليات',
    items: [
      { icon: Boxes, labelEn: 'Inventory', labelAr: 'المخزون', path: '/erp/inventory' },
      { icon: Boxes, labelEn: 'Inventory Dashboard', labelAr: 'لوحة المخزون', path: '/erp/inventory/dashboard' },
      { icon: Boxes, labelEn: 'Transfers & Cycle Count', labelAr: 'النقل والجرد', path: '/erp/inventory/transfers' },
      { icon: Warehouse, labelEn: 'Warehouses', labelAr: 'المستودعات', path: '/saas/warehouses' },
      { icon: MapPin, labelEn: 'Locations', labelAr: 'المواقع', path: '/erp/locations' },
      { icon: Package, labelEn: 'Items', labelAr: 'المنتجات', path: '/erp/items' },
    ],
  },
  {
    titleEn: 'Procurement',
    titleAr: 'المشتريات',
    items: [
      { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة التحكم', path: '/erp/procurement' },
      { icon: ClipboardList, labelEn: 'Requisitions', labelAr: 'طلبات الشراء', path: '/erp/requisitions' },
      { icon: ShoppingCart, labelEn: 'Purchase Orders', labelAr: 'أوامر الشراء', path: '/erp/purchase-orders' },
      { icon: PackageCheck, labelEn: 'Goods Receipts', labelAr: 'إيصالات الاستلام', path: '/erp/receipts' },
      { icon: RotateCcw, labelEn: 'Returns', labelAr: 'المرتجعات', path: '/erp/return-orders' },
      { icon: RefreshCw, labelEn: 'Blanket Orders', labelAr: 'العقود الإطارية', path: '/erp/blanket-orders' },
    ],
  },
  {
    titleEn: 'Sales',
    titleAr: 'المبيعات',
    items: [
      { icon: ShoppingCart, labelEn: 'Orders', labelAr: 'الطلبات', path: '/erp/orders' },
      { icon: Layers, labelEn: 'Customers', labelAr: 'العملاء', path: '/erp/customers' },
      { icon: FileText, labelEn: 'Invoices', labelAr: 'الفواتير', path: '/erp/invoices' },
    ],
  },
];

export function ErpSidebar() {
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
