import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Package, Search, Globe, Menu, X, User, LogOut, Settings, 
  Ship, ChevronDown, Boxes, PlayCircle, Users, Warehouse, 
  Truck, FileText, MapPin, ShoppingCart, BarChart3, Shield,
  ClipboardList, BookOpen, Bot, History, CreditCard, 
  Building2, Layers, GraduationCap
} from 'lucide-react';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

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

  const iconClass = `w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`;
  
  // Check if current path matches
  const isActivePath = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent-gradient rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">LogiPro Hub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg transition-all font-medium ${
                  location.pathname === '/' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {t('home')}
              </Link>
              
              {/* Operations Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  isActivePath('/saas/shipments') || isActivePath('/erp/orders') || isActivePath('/saas/dashboard') || isActivePath('/dashboard')
                    ? 'bg-orange-500/10 text-orange-600' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <Truck className="w-4 h-4" />
                  {language === 'ar' ? 'العمليات' : 'Operations'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-64 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'إدارة الشحنات' : 'Shipment Management'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/shipments')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/shipments') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mr-3">
                        <Truck className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'الشحنات' : 'Shipments'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'تتبع وإدارة الشحنات' : 'Track & manage shipments'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/orders')}
                      className={`rounded-lg mx-1 ${isActivePath('/erp/orders') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'الطلبات' : 'Orders'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إنشاء وتتبع الطلبات' : 'Create & track orders'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'لوحة التحكم' : 'Command Center'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/dashboard')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/dashboard') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'لوحة القيادة' : 'Dashboard'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'نظرة عامة على الأعمال' : 'Business overview'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className={`rounded-lg mx-1 ${isActivePath('/dashboard') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                        <ClipboardList className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'مركز العمليات' : 'Ops Center'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إدارة المهام والتنبيهات' : 'Tasks & alerts'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Master Data Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  isActivePath('/saas/clients') || isActivePath('/saas/warehouses') || isActivePath('/erp/')
                    ? 'bg-blue-500/10 text-blue-600' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <Layers className="w-4 h-4" />
                  {language === 'ar' ? 'البيانات' : 'Data'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-64 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'العملاء والموردين' : 'Clients & Vendors'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/clients')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/clients') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'العملاء' : 'Clients'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إدارة العملاء والموردين' : 'Manage clients & vendors'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'المخازن والمنتجات' : 'Inventory & Items'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/warehouses')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/warehouses') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'المستودعات' : 'Warehouses'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إدارة المستودعات' : 'Manage warehouses'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/locations')}
                      className={`rounded-lg mx-1 ${isActivePath('/erp/locations') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center mr-3">
                        <MapPin className="w-4 h-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'المواقع' : 'Locations'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'مواقع التحميل والتفريغ' : 'Pickup & delivery sites'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/items')}
                      className={`rounded-lg mx-1 ${isActivePath('/erp/items') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3">
                        <Boxes className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'المنتجات' : 'Items/SKUs'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'كتالوج المنتجات' : 'Product catalog'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/inventory')}
                      className={`rounded-lg mx-1 ${isActivePath('/erp/inventory') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-cyan-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'المخزون' : 'Inventory'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'مستويات المخزون' : 'Stock levels'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Finance Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  isActivePath('/saas/invoices')
                    ? 'bg-green-500/10 text-green-600' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <CreditCard className="w-4 h-4" />
                  {language === 'ar' ? 'المالية' : 'Finance'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-64 p-2">
                  <DropdownMenuItem 
                    onClick={() => navigate('/saas/invoices')}
                    className={`rounded-lg mx-1 ${isActivePath('/saas/invoices') ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium">{language === 'ar' ? 'الفواتير' : 'Invoices'}</div>
                      <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إنشاء وإدارة الفواتير' : 'Create & manage invoices'}</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Training Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  isActivePath('/categories') || isActivePath('/tools') || isActivePath('/logistics-assistant') || isActivePath('/shipments')
                    ? 'bg-indigo-500/10 text-indigo-600' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <GraduationCap className="w-4 h-4" />
                  {language === 'ar' ? 'التدريب' : 'Training'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-64 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'المحتوى التعليمي' : 'Learning Content'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/categories')}
                      className={`rounded-lg mx-1 ${isActivePath('/categories') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-medium">{t('categories')}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'فئات المحتوى' : 'Content categories'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className={`rounded-lg mx-1 ${isActivePath('/tools') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                        <PlayCircle className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'أدوات التدريب' : 'Training Tools'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'محاكاة وتدريب' : 'Simulations & exercises'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold px-2">
                      {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/logistics-assistant')}
                      className={`rounded-lg mx-1 ${isActivePath('/logistics-assistant') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                        <Bot className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-medium">{t('logisticsAssistant')}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'مساعد ذكي' : 'AI-powered help'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/shipments')}
                      className={`rounded-lg mx-1 ${isActivePath('/shipments') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center mr-3">
                        <Ship className="w-4 h-4 text-sky-500" />
                      </div>
                      <div>
                        <div className="font-medium">{t('myShipments')}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'خطط الشحن المحفوظة' : 'Saved shipment plans'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/erp/workflow-check')}
                    className={`rounded-lg mx-1 ${isActivePath('/erp/workflow-check') ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mr-3">
                      <PlayCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <div className="font-medium">{language === 'ar' ? 'فحص سير العمل' : 'Workflow Check'}</div>
                      <div className="text-xs text-muted-foreground">{language === 'ar' ? 'اختبار النظام' : 'Test ERP workflow'}</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Menu */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className={`px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                    isActivePath('/saas/setup') || isActivePath('/saas/roles') || isActivePath('/admin')
                      ? 'bg-red-500/10 text-red-600' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}>
                    <Shield className="w-4 h-4" />
                    {language === 'ar' ? 'الإدارة' : 'Admin'}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-64 p-2">
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/setup')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/setup') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إعدادات المؤسسة' : 'Organization settings'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/roles')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/roles') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                        <Shield className="w-4 h-4 text-violet-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'صلاحيات المستخدمين' : 'User permissions'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/audit-log')}
                      className={`rounded-lg mx-1 ${isActivePath('/saas/audit-log') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                        <History className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'تتبع الإجراءات' : 'Activity tracking'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin')}
                      className={`rounded-lg mx-1 ${isActivePath('/admin') ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center mr-3">
                        <Settings className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}</div>
                        <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إدارة الفئات والمواضيع' : 'Categories & topics'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Search, Language, Auth */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-48 lg:w-64 ${isRTL ? 'pr-9' : 'pl-9'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </form>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                title={language === 'en' ? 'العربية' : 'English'}
              >
                <Globe className="w-5 h-5" />
              </Button>

              {/* Auth */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                    <DropdownMenuItem className="text-muted-foreground" disabled>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/saas/setup')}>
                      <Settings className={`w-4 h-4 ${iconClass}`} />
                      {language === 'ar' ? 'إعدادات الشركة' : 'Company Settings'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className={`w-4 h-4 ${iconClass}`} />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="accent" size="sm" onClick={() => navigate('/auth')}>
                  {t('login')}
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRTL ? 'pr-9' : 'pl-9'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </form>

              <nav className="flex flex-col gap-1">
                {/* Operations Section */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {language === 'ar' ? 'العمليات' : 'Operations'}
                </div>
                <Link to="/saas/shipments" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Truck className="w-4 h-4" />
                  {language === 'ar' ? 'الشحنات' : 'Shipments'}
                </Link>
                <Link to="/erp/orders" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="w-4 h-4" />
                  {language === 'ar' ? 'الطلبات' : 'Orders'}
                </Link>
                <Link to="/saas/dashboard" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <BarChart3 className="w-4 h-4" />
                  {language === 'ar' ? 'لوحة القيادة' : 'Dashboard'}
                </Link>

                {/* Master Data Section */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {language === 'ar' ? 'البيانات' : 'Master Data'}
                </div>
                <Link to="/saas/clients" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'العملاء' : 'Clients'}
                </Link>
                <Link to="/saas/warehouses" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Warehouse className="w-4 h-4" />
                  {language === 'ar' ? 'المستودعات' : 'Warehouses'}
                </Link>
                <Link to="/erp/inventory" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Package className="w-4 h-4" />
                  {language === 'ar' ? 'المخزون' : 'Inventory'}
                </Link>

                {/* Finance Section */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {language === 'ar' ? 'المالية' : 'Finance'}
                </div>
                <Link to="/saas/invoices" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <FileText className="w-4 h-4" />
                  {language === 'ar' ? 'الفواتير' : 'Invoices'}
                </Link>

                {/* Training Section */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {language === 'ar' ? 'التدريب' : 'Training'}
                </div>
                <Link to="/categories" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <BookOpen className="w-4 h-4" />
                  {t('categories')}
                </Link>
                <Link to="/logistics-assistant" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Bot className="w-4 h-4" />
                  {t('logisticsAssistant')}
                </Link>
                <Link to="/tools" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <PlayCircle className="w-4 h-4" />
                  {language === 'ar' ? 'أدوات التدريب' : 'Training Tools'}
                </Link>

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                      {language === 'ar' ? 'الإدارة' : 'Admin'}
                    </div>
                    <Link to="/saas/setup" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="w-4 h-4" />
                      {language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}
                    </Link>
                    <Link to="/saas/roles" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Shield className="w-4 h-4" />
                      {language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}
                    </Link>
                    <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="w-4 h-4" />
                      {language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-gradient rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground">LogiPro Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LogiPro Hub. {t('allRightsReserved')}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
