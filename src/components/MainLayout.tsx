import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, Search, Globe, Menu, X, User, LogOut, Settings, Wrench } from 'lucide-react';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
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
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                {t('home')}
              </Link>
              <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                {t('categories')}
              </Link>
              <Link to="/tools" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                <Wrench className="w-4 h-4" />
                {t('tools')}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {t('admin')}
                </Link>
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
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('admin')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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

              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('home')}
                </Link>
                <Link
                  to="/categories"
                  className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('categories')}
                </Link>
                <Link
                  to="/tools"
                  className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-medium flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Wrench className="w-4 h-4" />
                  {t('tools')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('admin')}
                  </Link>
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
