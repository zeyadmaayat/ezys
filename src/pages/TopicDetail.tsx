import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import StructuredTopicRenderer from '@/components/topic/StructuredTopicRenderer';

interface Topic {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  category_id: string;
}

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
}

const TopicDetail = () => {
  const { categorySlug, topicSlug } = useParams<{ categorySlug: string; topicSlug: string }>();
  const { t, language, isRTL } = useLanguage();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug || !topicSlug) return;

      setLoading(true);

      // Fetch category first
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);

        // Fetch topic
        const { data: topicData } = await supabase
          .from('topics')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('slug', topicSlug)
          .maybeSingle();

        setTopic(topicData);
      }

      setLoading(false);
    };

    fetchData();
  }, [categorySlug, topicSlug]);

  const getTopicTitle = () => {
    if (!topic) return '';
    return language === 'ar' ? topic.title_ar : topic.title_en;
  };

  const getTopicSummary = () => {
    if (!topic) return '';
    return language === 'ar' ? topic.summary_ar : topic.summary_en;
  };

  const getTopicContent = () => {
    if (!topic) return null;
    // Content is now stored as JSON, same in both fields
    return topic.content_en;
  };

  const getCategoryName = () => {
    if (!category) return '';
    return language === 'ar' ? category.name_ar : category.name_en;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/category/${categorySlug}`} className="gap-2">
            <BackArrow className="w-4 h-4" />
            {t('backToCategory')} - {getCategoryName()}
          </Link>
        </Button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : topic ? (
          <article className="max-w-4xl mx-auto">
            {/* Topic Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {getTopicTitle()}
              </h1>
              {getTopicSummary() && (
                <p className="text-lg text-muted-foreground border-l-4 border-accent pl-4">
                  {getTopicSummary()}
                </p>
              )}
            </header>

            {/* Topic Content - Structured Renderer */}
            <StructuredTopicRenderer content={getTopicContent()} />
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t('error')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicDetail;
