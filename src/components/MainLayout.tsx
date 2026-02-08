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
} from '@/components/ui/dropdown-menu';
import { 
  Package, Search, Globe, Menu, X, User, LogOut, Settings, 
  Ship, ChevronDown, Boxes, PlayCircle, Users, Warehouse, 
  Truck, FileText, MapPin, ShoppingCart, BarChart3, Shield,
  ClipboardList, BookOpen, Bot, History
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

  const iconClass = isRTL ? 'ml-2' : 'mr-2';

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
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                {t('home')}
              </Link>
              
              {/* Operations Menu - الشحن والعمليات */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  {language === 'ar' ? 'العمليات' : 'Operations'}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56">
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'إدارة الشحنات' : 'Shipment Management'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/saas/shipments')}>
                    <Truck className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'الشحنات' : 'Shipments'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/erp/orders')}>
                    <ShoppingCart className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'الطلبات' : 'Orders'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'لوحة التحكم' : 'Command Center'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/saas/dashboard')}>
                    <BarChart3 className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'لوحة القيادة' : 'Dashboard'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <ClipboardList className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'مركز العمليات' : 'Ops Center'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Master Data Menu - البيانات الأساسية */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'البيانات' : 'Master Data'}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56">
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'العملاء والموردين' : 'Clients & Vendors'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/saas/clients')}>
                    <Users className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'العملاء' : 'Clients'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'المخازن والمنتجات' : 'Inventory & Items'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/saas/warehouses')}>
                    <Warehouse className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'المستودعات' : 'Warehouses'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/erp/locations')}>
                    <MapPin className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'المواقع' : 'Locations'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/erp/items')}>
                    <Boxes className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'المنتجات' : 'Items/SKUs'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/erp/inventory')}>
                    <Package className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'المخزون' : 'Inventory'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Finance Menu - المالية */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {language === 'ar' ? 'المالية' : 'Finance'}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/saas/invoices')}>
                    <FileText className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'الفواتير' : 'Invoices'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tools & Training Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {language === 'ar' ? 'التدريب' : 'Training'}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56">
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'المحتوى التعليمي' : 'Learning Content'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/categories')}>
                    <BookOpen className={`w-4 h-4 ${iconClass}`} />
                    {t('categories')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/tools')}>
                    <PlayCircle className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'أدوات التدريب' : 'Training Tools'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/logistics-assistant')}>
                    <Bot className={`w-4 h-4 ${iconClass}`} />
                    {t('logisticsAssistant')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/shipments')}>
                    <Ship className={`w-4 h-4 ${iconClass}`} />
                    {t('myShipments')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    {language === 'ar' ? 'اختبار النظام' : 'System Testing'}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/erp/workflow-check')}>
                    <PlayCircle className={`w-4 h-4 ${iconClass}`} />
                    {language === 'ar' ? 'فحص سير العمل' : 'Workflow Check'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Menu */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {language === 'ar' ? 'الإدارة' : 'Admin'}
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/saas/setup')}>
                      <Settings className={`w-4 h-4 ${iconClass}`} />
                      {language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saas/roles')}>
                      <Shield className={`w-4 h-4 ${iconClass}`} />
                      {language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saas/audit-log')}>
                      <History className={`w-4 h-4 ${iconClass}`} />
                      {language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className={`w-4 h-4 ${iconClass}`} />
                      {language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}
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
