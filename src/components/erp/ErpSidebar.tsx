import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Boxes, Warehouse, MapPin, Package, ShoppingCart, FileText,
  ClipboardList, RotateCcw, RefreshCw, PackageCheck, BarChart3,
  ChevronLeft, ChevronRight, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  icon: typeof Boxes;
  labelEn: string;
  labelAr: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  titleEn: string;
  titleAr: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    titleEn: 'Operations',
    titleAr: 'العمليات',
    items: [
      { icon: Boxes, labelEn: 'Inventory', labelAr: 'المخزون', path: '/erp/inventory' },
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
                    {!collapsed && item.badge && (
                      <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                        {item.badge}
                      </Badge>
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
