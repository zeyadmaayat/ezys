import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
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

const Categories = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('categories')}
          </h1>
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
    </MainLayout>
  );
};

export default Categories;
