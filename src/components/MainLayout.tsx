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
  Building2, Layers, GraduationCap, RotateCcw, RefreshCw, PackageCheck
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

            {/* Desktop Navigation - Pill Container */}
            <nav className="hidden md:flex items-center gap-0.5 bg-muted/30 rounded-xl p-1 border border-border/50">
              <Link 
                to="/" 
                className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                  location.pathname === '/' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                {t('home')}
              </Link>
              
              {/* Operations Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                  isActivePath('/saas/shipments') || isActivePath('/erp/orders') || isActivePath('/saas/dashboard') || isActivePath('/dashboard')
                    ? 'bg-card text-orange-600 shadow-sm ring-1 ring-orange-200/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}>
                  <Truck className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'العمليات' : 'Operations'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'إدارة الشحنات' : 'Shipment Management'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/shipments')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/shipments') ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mr-3 shadow-sm">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'الشحنات' : 'Shipments'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'تتبع وإدارة الشحنات' : 'Track & manage shipments'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/orders')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/orders') ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-sm">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'الطلبات' : 'Orders'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إنشاء وتتبع الطلبات' : 'Create & track orders'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'لوحة التحكم' : 'Command Center'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/dashboard')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/dashboard') ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3 shadow-sm">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'لوحة القيادة' : 'Dashboard'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'نظرة عامة على الأعمال' : 'Business overview'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/dashboard') ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-3 shadow-sm">
                        <ClipboardList className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'مركز العمليات' : 'Ops Center'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إدارة المهام والتنبيهات' : 'Tasks & alerts'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Procurement Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                  isActivePath('/erp/requisitions') || isActivePath('/erp/purchase-orders') || isActivePath('/erp/return-orders') || isActivePath('/erp/blanket-orders') || isActivePath('/erp/receipts')
                    ? 'bg-card text-violet-600 shadow-sm ring-1 ring-violet-200/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'المشتريات' : 'Procurement'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'دورة الشراء' : 'Purchase Cycle'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/requisitions')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/requisitions') ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mr-3 shadow-sm">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'طلبات الشراء (PR)' : 'Requisitions (PR)'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'طلبات شراء داخلية' : 'Internal purchase requests'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/purchase-orders')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/purchase-orders') ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-sm">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'أوامر الشراء (PO)' : 'Purchase Orders (PO)'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'أوامر الشراء للموردين' : 'Vendor purchase orders'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/receipts')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/receipts') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3 shadow-sm">
                        <PackageCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'استلام البضائع (GRN)' : 'Receiving (GRN)'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'استلام وفحص البضائع' : 'Receive & inspect goods'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'الإرجاعات والعقود' : 'Returns & Contracts'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/return-orders')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/return-orders') ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mr-3 shadow-sm">
                        <RotateCcw className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'إرجاع للمورد (RTV)' : 'Return to Vendor (RTV)'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إرجاع البضائع المرفوضة' : 'Return rejected materials'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/blanket-orders')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/blanket-orders') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mr-3 shadow-sm">
                        <RefreshCw className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'عقود التوريد' : 'Blanket Orders'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'عقود توريد متكررة' : 'Recurring supply contracts'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Master Data Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                  isActivePath('/saas/clients') || isActivePath('/saas/warehouses') || isActivePath('/erp/')
                    ? 'bg-card text-blue-600 shadow-sm ring-1 ring-blue-200/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}>
                  <Layers className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'البيانات' : 'Data'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'العملاء والموردين' : 'Clients & Vendors'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/clients')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/clients') ? 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mr-3 shadow-sm">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'العملاء' : 'Clients'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إدارة العملاء والموردين' : 'Manage clients & vendors'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'المخازن والمنتجات' : 'Inventory & Items'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/warehouses')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/warehouses') ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'المستودعات' : 'Warehouses'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إدارة المستودعات' : 'Manage warehouses'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/locations')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/locations') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mr-3 shadow-sm">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'المواقع' : 'Locations'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'مواقع التحميل والتفريغ' : 'Pickup & delivery sites'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/items')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/items') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                        <Boxes className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'المنتجات' : 'Items/SKUs'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'كتالوج المنتجات' : 'Product catalog'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/erp/inventory')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/inventory') ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mr-3 shadow-sm">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'المخزون' : 'Inventory'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'مستويات المخزون' : 'Stock levels'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Finance Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                  isActivePath('/saas/invoices')
                    ? 'bg-card text-emerald-600 shadow-sm ring-1 ring-emerald-200/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}>
                  <CreditCard className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'المالية' : 'Finance'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                  <DropdownMenuItem 
                    onClick={() => navigate('/saas/invoices')}
                    className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/invoices') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3 shadow-sm">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{language === 'ar' ? 'الفواتير' : 'Invoices'}</div>
                      <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إنشاء وإدارة الفواتير' : 'Create & manage invoices'}</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Training Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                  isActivePath('/categories') || isActivePath('/tools') || isActivePath('/logistics-assistant') || isActivePath('/shipments')
                    ? 'bg-card text-indigo-600 shadow-sm ring-1 ring-indigo-200/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'التدريب' : 'Training'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'المحتوى التعليمي' : 'Learning Content'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/categories')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/categories') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t('categories')}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'فئات المحتوى' : 'Content categories'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/tools')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/tools') ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-3 shadow-sm">
                        <PlayCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'أدوات التدريب' : 'Training Tools'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'محاكاة وتدريب' : 'Simulations & exercises'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold px-2 mb-1">
                      {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => navigate('/logistics-assistant')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/logistics-assistant') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3 shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t('logisticsAssistant')}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'مساعد ذكي' : 'AI-powered help'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/shipments')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/shipments') ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mr-3 shadow-sm">
                        <Ship className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t('myShipments')}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'خطط الشحن المحفوظة' : 'Saved shipment plans'}</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/erp/workflow-check')}
                    className={`rounded-lg mx-1 py-2.5 ${isActivePath('/erp/workflow-check') ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mr-3 shadow-sm">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{language === 'ar' ? 'فحص سير العمل' : 'Workflow Check'}</div>
                      <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'اختبار النظام' : 'Test ERP workflow'}</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Menu */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger className={`px-3.5 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-1.5 outline-none ${
                    isActivePath('/saas/setup') || isActivePath('/saas/roles') || isActivePath('/admin')
                      ? 'bg-card text-red-600 shadow-sm ring-1 ring-red-200/60' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'الإدارة' : 'Admin'}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-72 p-2 rounded-xl shadow-xl border-border/60 backdrop-blur-xl bg-card">
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/setup')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/setup') ? 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center mr-3 shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'إعداد الشركة' : 'Company Setup'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إعدادات المؤسسة' : 'Organization settings'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/roles')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/roles') ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mr-3 shadow-sm">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'صلاحيات المستخدمين' : 'User permissions'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/saas/audit-log')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/saas/audit-log') ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 shadow-sm">
                        <History className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'تتبع الإجراءات' : 'Activity tracking'}</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-border/40" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin')}
                      className={`rounded-lg mx-1 py-2.5 ${isActivePath('/admin') ? 'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mr-3 shadow-sm">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{language === 'ar' ? 'إدارة المحتوى' : 'Content Admin'}</div>
                        <div className="text-[11px] text-muted-foreground/70">{language === 'ar' ? 'إدارة الفئات والمواضيع' : 'Categories & topics'}</div>
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

                {/* Procurement Section */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {language === 'ar' ? 'المشتريات' : 'Procurement'}
                </div>
                <Link to="/erp/requisitions" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <FileText className="w-4 h-4" />
                  {language === 'ar' ? 'طلبات الشراء' : 'Requisitions'}
                </Link>
                <Link to="/erp/purchase-orders" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="w-4 h-4" />
                  {language === 'ar' ? 'أوامر الشراء' : 'Purchase Orders'}
                </Link>
                <Link to="/erp/receipts" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <PackageCheck className="w-4 h-4" />
                  {language === 'ar' ? 'استلام البضائع' : 'Receiving (GRN)'}
                </Link>
                <Link to="/erp/return-orders" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <RotateCcw className="w-4 h-4" />
                  {language === 'ar' ? 'إرجاع للمورد' : 'Return to Vendor'}
                </Link>
                <Link to="/erp/blanket-orders" className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <RefreshCw className="w-4 h-4" />
                  {language === 'ar' ? 'عقود التوريد' : 'Blanket Orders'}
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
