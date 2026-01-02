import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const categoryData = [
  { slug: 'procurement', icon: ShoppingCart, nameKey: 'procurement', descKey: 'procurementDesc', color: 'bg-blue-500' },
  { slug: 'transportation', icon: Truck, nameKey: 'transportation', descKey: 'transportationDesc', color: 'bg-orange-500' },
  { slug: 'import-export', icon: Globe, nameKey: 'importExport', descKey: 'importExportDesc', color: 'bg-green-500' },
  { slug: 'warehousing', icon: Warehouse, nameKey: 'warehousing', descKey: 'warehousingDesc', color: 'bg-purple-500' },
  { slug: 'inventory-management', icon: Package, nameKey: 'inventoryManagement', descKey: 'inventoryManagementDesc', color: 'bg-cyan-500' },
  { slug: 'tqm', icon: Award, nameKey: 'tqm', descKey: 'tqmDesc', color: 'bg-yellow-500' },
  { slug: 'hr', icon: Users, nameKey: 'hr', descKey: 'hrDesc', color: 'bg-pink-500' },
  { slug: 'green-logistics', icon: Leaf, nameKey: 'greenLogistics', descKey: 'greenLogisticsDesc', color: 'bg-emerald-500' },
  { slug: 'humanitarian-logistics', icon: Heart, nameKey: 'humanitarianLogistics', descKey: 'humanitarianLogisticsDesc', color: 'bg-red-500' },
  { slug: 'business-abbreviations', icon: BookOpen, nameKey: 'businessAbbreviations', descKey: 'businessAbbreviationsDesc', color: 'bg-indigo-500' },
];

const Index = () => {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryData.map((category, index) => (
              <Link to={`/category/${category.slug}`} key={category.slug}>
                <Card className="h-full border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${category.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className={`w-7 h-7 ${category.color.replace('bg-', 'text-')}`} />
                    </div>
                    <CardTitle className="text-lg group-hover:text-accent transition-colors">
                      {t(category.nameKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {t(category.descKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
