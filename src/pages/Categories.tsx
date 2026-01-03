import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
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

const Categories = () => {
  const { t, language } = useLanguage();
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
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('categories')}
          </h1>
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
    </MainLayout>
  );
};

export default Categories;