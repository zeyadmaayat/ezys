import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Search, Globe, Menu, X, User, LogOut, Settings,
  Truck, Boxes, Users, Warehouse, FileText, MapPin,
  ShoppingCart, BarChart3, Shield, ClipboardList, BookOpen,
  Bot, CreditCard, Building2, Layers, RotateCcw, RefreshCw,
  PackageCheck, ScanBarcode, DollarSign, Target, TrendingUp,
  Handshake, PieChart as PieIcon, Package, PlayCircle, GraduationCap,
  History, AlertTriangle, Grid3X3,
} from 'lucide-react';
import EzyLogo from '@/components/EzyLogo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

// Odoo-style module definition
interface ModuleItem {
  icon: typeof Truck;
  labelEn: string;
  labelAr: string;
  path: string;
  description?: string;
}

interface ModuleGroup {
  titleEn: string;
  titleAr: string;
  items: ModuleItem[];
}

interface TopNavModule {
  key: string;
  labelEn: string;
  labelAr: string;
  icon: typeof Truck;
  pathPrefix: string[];
  groups: ModuleGroup[];
}

// Define all modules
const modules: TopNavModule[] = [
  {
    key: 'operations',
    labelEn: 'Operations',
    labelAr: 'العمليات',
    icon: Truck,
    pathPrefix: ['/saas/shipments', '/erp/orders', '/saas/dashboard', '/dashboard'],
    groups: [
      {
        titleEn: 'Shipments',
        titleAr: 'الشحنات',
        items: [
          { icon: Truck, labelEn: 'Shipments', labelAr: 'الشحنات', path: '/saas/shipments' },
          { icon: ShoppingCart, labelEn: 'Orders', labelAr: 'الطلبات', path: '/erp/orders' },
        ],
      },
      {
        titleEn: 'Dashboards',
        titleAr: 'لوحات التحكم',
        items: [
          { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة القيادة', path: '/saas/dashboard' },
          { icon: ClipboardList, labelEn: 'Ops Center', labelAr: 'مركز العمليات', path: '/dashboard' },
        ],
      },
    ],
  },
  {
    key: 'dp',
    labelEn: 'Domestic Pro',
    labelAr: 'التوصيل المحلي',
    icon: Package,
    pathPrefix: ['/dp'],
    groups: [
      {
        titleEn: 'Shipments',
        titleAr: 'الشحنات',
        items: [
          { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة القيادة', path: '/dp' },
          { icon: Truck, labelEn: 'Shipments', labelAr: 'الشحنات', path: '/dp/shipments' },
          { icon: Users, labelEn: 'Drivers', labelAr: 'السائقين', path: '/dp/drivers' },
        ],
      },
      {
        titleEn: 'Warehouse & Finance',
        titleAr: 'المستودع والمالية',
        items: [
          { icon: Warehouse, labelEn: 'Warehouse', labelAr: 'المستودع', path: '/dp/warehouse' },
          { icon: ScanBarcode, labelEn: 'Inventory Audit', labelAr: 'الجرد', path: '/dp/inventory' },
          { icon: DollarSign, labelEn: 'COD Settlements', labelAr: 'تسويات COD', path: '/dp/cod' },
        ],
      },
      {
        titleEn: 'Governance',
        titleAr: 'الحوكمة',
        items: [
          { icon: Shield, labelEn: 'Risk & Governance', labelAr: 'المخاطر', path: '/dp/risk' },
        ],
      },
    ],
  },
  {
    key: 'procurement',
    labelEn: 'Procurement',
    labelAr: 'المشتريات',
    icon: ShoppingCart,
    pathPrefix: ['/erp/procurement', '/erp/requisitions', '/erp/purchase-orders', '/erp/return-orders', '/erp/blanket-orders', '/erp/receipts'],
    groups: [
      {
        titleEn: 'Overview',
        titleAr: 'نظرة عامة',
        items: [
          { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة المشتريات', path: '/erp/procurement' },
        ],
      },
      {
        titleEn: 'Purchase Cycle',
        titleAr: 'دورة الشراء',
        items: [
          { icon: FileText, labelEn: 'Requisitions (PR)', labelAr: 'طلبات الشراء', path: '/erp/requisitions' },
          { icon: ShoppingCart, labelEn: 'Purchase Orders (PO)', labelAr: 'أوامر الشراء', path: '/erp/purchase-orders' },
          { icon: PackageCheck, labelEn: 'Receiving (GRN)', labelAr: 'استلام البضائع', path: '/erp/receipts' },
        ],
      },
      {
        titleEn: 'Returns & Contracts',
        titleAr: 'الإرجاعات والعقود',
        items: [
          { icon: RotateCcw, labelEn: 'Return to Vendor', labelAr: 'إرجاع للمورد', path: '/erp/return-orders' },
          { icon: RefreshCw, labelEn: 'Blanket Orders', labelAr: 'عقود التوريد', path: '/erp/blanket-orders' },
        ],
      },
    ],
  },
  {
    key: 'data',
    labelEn: 'Inventory',
    labelAr: 'المخزون',
    icon: Layers,
    pathPrefix: ['/saas/clients', '/saas/warehouses', '/erp/locations', '/erp/items', '/erp/inventory', '/erp/customers'],
    groups: [
      {
        titleEn: 'Clients & Vendors',
        titleAr: 'العملاء والموردين',
        items: [
          { icon: Users, labelEn: 'Clients', labelAr: 'العملاء', path: '/saas/clients' },
        ],
      },
      {
        titleEn: 'Inventory & Items',
        titleAr: 'المخزون والمنتجات',
        items: [
          { icon: Building2, labelEn: 'Warehouses', labelAr: 'المستودعات', path: '/saas/warehouses' },
          { icon: MapPin, labelEn: 'Locations', labelAr: 'المواقع', path: '/erp/locations' },
          { icon: Boxes, labelEn: 'Items/SKUs', labelAr: 'المنتجات', path: '/erp/items' },
          { icon: Package, labelEn: 'Inventory', labelAr: 'المخزون', path: '/erp/inventory' },
        ],
      },
    ],
  },
  {
    key: 'finance',
    labelEn: 'Finance',
    labelAr: 'المالية',
    icon: CreditCard,
    pathPrefix: ['/saas/invoices', '/finance'],
    groups: [
      {
        titleEn: 'Invoices & Payments',
        titleAr: 'الفواتير والمدفوعات',
        items: [
          { icon: FileText, labelEn: 'Invoices', labelAr: 'الفواتير', path: '/saas/invoices' },
          { icon: CreditCard, labelEn: 'Expenses', labelAr: 'المصاريف', path: '/finance/expenses' },
        ],
      },
      {
        titleEn: 'Reports',
        titleAr: 'التقارير',
        items: [
          { icon: BarChart3, labelEn: 'Financial Reports', labelAr: 'التقارير المالية', path: '/finance/reports' },
          { icon: Users, labelEn: 'Statements', labelAr: 'كشف الحساب', path: '/finance/statements' },
          { icon: Layers, labelEn: 'Three-Way Match', labelAr: 'المطابقة الثلاثية', path: '/finance/three-way-match' },
        ],
      },
    ],
  },
  {
    key: 'sales',
    labelEn: 'Sales',
    labelAr: 'المبيعات',
    icon: Handshake,
    pathPrefix: ['/sales'],
    groups: [
      {
        titleEn: 'Overview',
        titleAr: 'نظرة عامة',
        items: [
          { icon: BarChart3, labelEn: 'Dashboard', labelAr: 'لوحة المبيعات', path: '/sales/dashboard' },
        ],
      },
      {
        titleEn: 'CRM',
        titleAr: 'إدارة العملاء',
        items: [
          { icon: Target, labelEn: 'Leads', labelAr: 'العملاء المحتملين', path: '/sales/leads' },
          { icon: TrendingUp, labelEn: 'Pipeline', labelAr: 'خط الأنابيب', path: '/sales/pipeline' },
          { icon: Users, labelEn: 'Customers', labelAr: 'العملاء', path: '/sales/customers' },
        ],
      },
      {
        titleEn: 'Catalog & Documents',
        titleAr: 'الكتالوج والمستندات',
        items: [
          { icon: Package, labelEn: 'Products', labelAr: 'المنتجات', path: '/sales/products' },
          { icon: FileText, labelEn: 'Quotations', labelAr: 'عروض الأسعار', path: '/sales/quotations' },
          { icon: ShoppingCart, labelEn: 'Sales Orders', labelAr: 'أوامر البيع', path: '/sales/orders' },
        ],
      },
      {
        titleEn: 'Analytics',
        titleAr: 'التحليلات',
        items: [
          { icon: PieIcon, labelEn: 'Reports', labelAr: 'التقارير', path: '/sales/reports' },
        ],
      },
    ],
  },
  {
    key: 'training',
    labelEn: 'Training',
    labelAr: 'التدريب',
    icon: GraduationCap,
    pathPrefix: ['/categories', '/tools', '/logistics-assistant', '/shipments'],
    groups: [
      {
        titleEn: 'Learning',
        titleAr: 'التعلم',
        items: [
          { icon: BookOpen, labelEn: 'Categories', labelAr: 'الفئات', path: '/categories' },
          { icon: PlayCircle, labelEn: 'Training Tools', labelAr: 'أدوات التدريب', path: '/tools' },
        ],
      },
      {
        titleEn: 'AI Assistant',
        titleAr: 'المساعد الذكي',
        items: [
          { icon: Bot, labelEn: 'Logistics Assistant', labelAr: 'المساعد اللوجستي', path: '/logistics-assistant' },
          { icon: Truck, labelEn: 'My Shipments', labelAr: 'شحناتي', path: '/shipments' },
        ],
      },
    ],
  },
];

const MainLayout = ({ children }: MainLayoutProps) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const isModuleActive = (mod: TopNavModule) =>
    mod.pathPrefix.some((p) => isActivePath(p));

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Odoo-style Top Bar */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--navy))] text-white shadow-lg">
        <div className="flex items-center h-12 px-3 lg:px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-1">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-white">
              ezy<span className="text-[hsl(var(--ezy-green))]">Logistic</span>
            </span>
          </Link>

          {/* Desktop Navigation - Odoo style flat text */}
          <nav className="hidden md:flex items-center gap-0 ml-2">
            {/* Home */}
            <Link
              to="/"
              className={cn(
                'px-3 py-1.5 rounded text-[13px] font-medium transition-colors',
                location.pathname === '/'
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {t('home')}
            </Link>

            {/* Module Dropdowns */}
            {modules.map((mod) => (
              <DropdownMenu key={mod.key}>
                <DropdownMenuTrigger
                  className={cn(
                    'px-3 py-1.5 rounded text-[13px] font-medium transition-colors outline-none flex items-center gap-1',
                    isModuleActive(mod)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  {language === 'ar' ? mod.labelAr : mod.labelEn}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? 'end' : 'start'}
                  className="w-64 p-1.5 rounded-lg shadow-xl"
                >
                  {mod.groups.map((group, gi) => (
                    <div key={group.titleEn}>
                      {gi > 0 && <DropdownMenuSeparator className="my-1" />}
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold px-2 py-1">
                        {language === 'ar' ? group.titleAr : group.titleEn}
                      </DropdownMenuLabel>
                      {group.items.map((item) => (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={cn(
                            'rounded-md py-2 gap-2.5 cursor-pointer',
                            isActivePath(item.path) && 'bg-primary/10 text-primary'
                          )}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium">
                            {language === 'ar' ? item.labelAr : item.labelEn}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Admin Menu */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    'px-3 py-1.5 rounded text-[13px] font-medium transition-colors outline-none flex items-center gap-1',
                    isActivePath('/saas/roles') || isActivePath('/saas/audit-log') || isActivePath('/saas/setup') || isActivePath('/admin')
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  {language === 'ar' ? 'الإدارة' : 'Admin'}
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56 p-1.5 rounded-lg">
                  <DropdownMenuItem onClick={() => navigate('/saas/setup')} className="rounded-md py-2 gap-2.5 cursor-pointer">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saas/roles')} className="rounded-md py-2 gap-2.5 cursor-pointer">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saas/audit-log')} className="rounded-md py-2 gap-2.5 cursor-pointer">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-md py-2 gap-2.5 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side: Search, Lang, Notifications, User */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50', isRTL ? 'right-2.5' : 'left-2.5')} />
                <Input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-40 lg:w-52 h-8 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30',
                    isRTL ? 'pr-8' : 'pl-8'
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </form>

            {/* Language */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={language === 'en' ? 'العربية' : 'English'}
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* User */}
            {loading ? (
              <div className="w-7 h-7 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors">
                    <User className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56 rounded-lg">
                  <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/saas/setup')} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    {language === 'ar' ? 'إعدادات الشركة' : 'Company Settings'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-8 text-xs bg-white/15 hover:bg-white/25 text-white border-0"
              >
                {t('login')}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[hsl(var(--navy-light))] border-t border-white/10 max-h-[80vh] overflow-y-auto">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="p-3">
              <div className="relative">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/50', isRTL ? 'right-3' : 'left-3')} />
                <Input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9',
                    isRTL ? 'pr-9' : 'pl-9'
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </form>

            <nav className="px-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-white/80 hover:bg-white/10"
              >
                {t('home')}
              </Link>

              {modules.map((mod) => (
                <div key={mod.key}>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/40 font-bold mt-2">
                    {language === 'ar' ? mod.labelAr : mod.labelEn}
                  </div>
                  {mod.groups.flatMap((g) => g.items).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                        isActivePath(item.path)
                          ? 'bg-white/15 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {language === 'ar' ? item.labelAr : item.labelEn}
                    </Link>
                  ))}
                </div>
              ))}

              {isAdmin && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/40 font-bold mt-2">
                    {language === 'ar' ? 'الإدارة' : 'Administration'}
                  </div>
                  <Link to="/saas/setup" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/70 hover:bg-white/10 hover:text-white">
                    <Building2 className="w-4 h-4" />{language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}
                  </Link>
                  <Link to="/saas/roles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/70 hover:bg-white/10 hover:text-white">
                    <Shield className="w-4 h-4" />{language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}
                  </Link>
                  <Link to="/saas/audit-log" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/70 hover:bg-white/10 hover:text-white">
                    <History className="w-4 h-4" />{language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}
                  </Link>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/70 hover:bg-white/10 hover:text-white">
                    <Settings className="w-4 h-4" />{language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Minimal Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[hsl(var(--navy))] rounded flex items-center justify-center">
                <Truck className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground">ezy<span className="text-primary">Logistic</span></span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ezy Logistic HUB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
