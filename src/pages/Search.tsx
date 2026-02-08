import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FileText, BookOpen, Search as SearchIcon } from 'lucide-react';

interface TopicResult {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  category_slug: string;
}

interface AbbreviationResult {
  id: string;
  abbreviation: string;
  full_form_en: string;
  full_form_ar: string;
  definition_en: string | null;
  definition_ar: string | null;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t, language } = useLanguage();
  const [topics, setTopics] = useState<TopicResult[]>([]);
  const [abbreviations, setAbbreviations] = useState<AbbreviationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchData = async () => {
      // Input validation: limit query length and reject empty queries
      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length > 200) {
        setTopics([]);
        setAbbreviations([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Escape special ILIKE characters for safety
      const sanitizedQuery = trimmedQuery.replace(/[%_]/g, '\\$&');
      const searchTerm = `%${sanitizedQuery}%`;

      // Search topics
      const { data: topicsData } = await supabase
        .from('topics')
        .select(`
          id, slug, title_en, title_ar, summary_en, summary_ar,
          categories!inner(slug)
        `)
        .or(`title_en.ilike.${searchTerm},title_ar.ilike.${searchTerm},content_en.ilike.${searchTerm},content_ar.ilike.${searchTerm}`)
        .limit(20);

      const formattedTopics = (topicsData || []).map((topic: any) => ({
        ...topic,
        category_slug: topic.categories?.slug || '',
      }));

      setTopics(formattedTopics);

      // Search abbreviations
      const { data: abbreviationsData } = await supabase
        .from('abbreviations')
        .select('id, abbreviation, full_form_en, full_form_ar, definition_en, definition_ar')
        .or(`abbreviation.ilike.${searchTerm},full_form_en.ilike.${searchTerm},full_form_ar.ilike.${searchTerm}`)
        .limit(20);

      setAbbreviations(abbreviationsData || []);

      setLoading(false);
    };

    searchData();
  }, [query]);

  const hasResults = topics.length > 0 || abbreviations.length > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('searchResults')}
          </h1>
          <p className="text-muted-foreground">
            {query && `"${query}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : hasResults ? (
          <div className="space-y-12">
            {/* Topics Results */}
            {topics.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  {t('topics')} ({topics.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <Link to={`/category/${topic.category_slug}/topic/${topic.slug}`} key={topic.id}>
                      <Card className="h-full hover:border-accent/50 hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {language === 'ar' ? topic.title_ar : topic.title_en}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-2">
                            {language === 'ar' ? topic.summary_ar : topic.summary_en}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Abbreviations Results */}
            {abbreviations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  {t('businessAbbreviations')} ({abbreviations.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {abbreviations.map((abbr) => (
                    <Card key={abbr.id} className="hover:border-accent/50 hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-accent">{abbr.abbreviation}</CardTitle>
                        <CardDescription className="font-medium text-foreground">
                          {language === 'ar' ? abbr.full_form_ar : abbr.full_form_en}
                        </CardDescription>
                      </CardHeader>
                      {(abbr.definition_en || abbr.definition_ar) && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {language === 'ar' ? abbr.definition_ar : abbr.definition_en}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/50 rounded-2xl">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">{t('noResults')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
