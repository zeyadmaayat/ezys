import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';

interface Topic {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
}

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
}

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language, isRTL } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      setLoading(true);

      // Fetch category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);

        // Fetch topics for this category
        const { data: topicsData } = await supabase
          .from('topics')
          .select('id, slug, title_en, title_ar, summary_en, summary_ar')
          .eq('category_id', categoryData.id)
          .order('sort_order', { ascending: true });

        setTopics(topicsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const getCategoryName = () => {
    if (!category) return '';
    return language === 'ar' ? category.name_ar : category.name_en;
  };

  const getCategoryDescription = () => {
    if (!category) return '';
    return language === 'ar' ? category.description_ar : category.description_en;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/categories" className="gap-2">
            <BackArrow className="w-4 h-4" />
            {t('backToHome')}
          </Link>
        </Button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : category ? (
          <>
            {/* Category Header */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {getCategoryName()}
              </h1>
              {getCategoryDescription() && (
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {getCategoryDescription()}
                </p>
              )}
            </div>

            {/* Topics Grid */}
            {topics.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, index) => (
                  <Link to={`/category/${slug}/topic/${topic.slug}`} key={topic.id}>
                    <Card className="h-full border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 text-accent" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-accent transition-colors">
                          {language === 'ar' ? topic.title_ar : topic.title_en}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-3">
                          {language === 'ar' ? topic.summary_ar : topic.summary_en}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/50 rounded-2xl">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg">{t('noTopics')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t('error')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryDetail;
