import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  ShoppingCart,
  Truck,
  Globe,
  Warehouse,
  Package,
  Award,
  Users,
  Leaf,
  Heart,
  FileText,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Truck,
  Globe,
  Warehouse,
  Package,
  Award,
  Users,
  Leaf,
  Heart,
  FileText,
};

const colorMap: Record<string, string> = {
  procurement: 'bg-blue-500',
  transportation: 'bg-orange-500',
  'import-export': 'bg-green-500',
  warehousing: 'bg-purple-500',
  'inventory-management': 'bg-cyan-500',
  tqm: 'bg-yellow-500',
  'human-resources': 'bg-pink-500',
  'green-logistics': 'bg-emerald-500',
  'humanitarian-logistics': 'bg-red-500',
  abbreviations: 'bg-indigo-500',
};

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  icon: string | null;
  sort_order: number | null;
}

const Index = () => {
  const { t, language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      setCategories(data || []);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName || !iconMap[iconName]) return FileText;
    return iconMap[iconName];
  };

  const getColor = (slug: string) => {
    return colorMap[slug] || 'bg-accent';
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-hero overflow-hidden py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
              <Package className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground">LogiPro Hub</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {t('heroTitle')}
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/categories">
                  {t('exploreCategories')}
                  <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/auth">{t('getStarted')}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('exploreCategories')}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = getIcon(category.icon);
                const color = getColor(category.slug);
                
                return (
                  <Link to={`/category/${category.slug}`} key={category.id}>
                    <Card className="h-full border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <CardHeader>
                        <div className={`w-14 h-14 rounded-xl ${color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
                        </div>
                        <CardTitle className="text-lg group-hover:text-accent transition-colors">
                          {language === 'ar' ? category.name_ar : category.name_en}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {language === 'ar' ? category.description_ar : category.description_en}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/50 rounded-2xl">
              <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">{t('noCategories')}</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;