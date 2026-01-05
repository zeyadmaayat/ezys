import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SectionEditor from './SectionEditor';
import { 
  StructuredContent,
  TopicSection,
  SectionType,
  createSection,
  createEmptyStructuredContent,
  parseStructuredContent,
  STANDARD_TEMPLATE
} from '@/types/structured-content';
import { Plus, FileText, ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
}

interface Topic {
  id: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  slug: string;
  category_id: string;
  sort_order: number | null;
}

interface TopicEditorProps {
  topicId?: string;
  onBack: () => void;
  onSaved: () => void;
}

const TopicEditor = ({ topicId, onBack, onSaved }: TopicEditorProps) => {
  const { t, language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Basic topic info
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [summaryAr, setSummaryAr] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  
  // Structured content
  const [structuredContent, setStructuredContent] = useState<StructuredContent>(createEmptyStructuredContent());

  useEffect(() => {
    fetchCategories();
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name_en, name_ar, slug')
      .order('sort_order');
    if (data) setCategories(data);
  };

  const fetchTopic = async () => {
    if (!topicId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (data) {
      setTitleEn(data.title_en);
      setTitleAr(data.title_ar);
      setSummaryEn(data.summary_en || '');
      setSummaryAr(data.summary_ar || '');
      setSlug(data.slug);
      setCategoryId(data.category_id);
      setSortOrder(data.sort_order || 0);
      
      // Parse structured content
      const parsed = parseStructuredContent(data.content_en);
      if (parsed) {
        setStructuredContent(parsed);
      }
    }
    
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleEnChange = (value: string) => {
    setTitleEn(value);
    if (!topicId && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const addSection = (type: SectionType) => {
    const newSection = createSection(type, structuredContent.sections.length);
    setStructuredContent({
      ...structuredContent,
      sections: [...structuredContent.sections, newSection]
    });
  };

  const updateSection = (index: number, updatedSection: TopicSection) => {
    const sections = [...structuredContent.sections];
    sections[index] = updatedSection;
    setStructuredContent({ ...structuredContent, sections });
  };

  const deleteSection = (index: number) => {
    const sections = structuredContent.sections.filter((_, i) => i !== index);
    // Reorder remaining sections
    sections.forEach((s, i) => s.order = i);
    setStructuredContent({ ...structuredContent, sections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...structuredContent.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    sections.forEach((s, i) => s.order = i);
    setStructuredContent({ ...structuredContent, sections });
  };

  const applyTemplate = () => {
    const newSections = STANDARD_TEMPLATE.map((type, index) => 
      createSection(type, index)
    );
    setStructuredContent({
      version: 1,
      sections: newSections
    });
  };

  const handleSave = async () => {
    if (!titleEn || !titleAr || !slug || !categoryId) {
      toast.error(t('fillRequired'));
      return;
    }

    setSaving(true);

    const contentJson = JSON.stringify(structuredContent);
    
    const topicData = {
      title_en: titleEn,
      title_ar: titleAr,
      summary_en: summaryEn || null,
      summary_ar: summaryAr || null,
      content_en: contentJson,
      content_ar: contentJson, // Same JSON, content has both languages
      slug,
      category_id: categoryId,
      sort_order: sortOrder
    };

    let error;
    if (topicId) {
      const result = await supabase
        .from('topics')
        .update(topicData)
        .eq('id', topicId);
      error = result.error;
    } else {
      const result = await supabase
        .from('topics')
        .insert(topicData);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('savedSuccess'));
      onSaved();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('save')}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('titleEn')} *</Label>
              <Input
                value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                placeholder="Topic title in English"
              />
            </div>
            <div dir="rtl">
              <Label>{t('titleAr')} *</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان الموضوع بالعربية"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('summaryEn')}</Label>
              <Textarea
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Brief summary in English"
                rows={2}
              />
            </div>
            <div dir="rtl">
              <Label>{t('summaryAr')}</Label>
              <Textarea
                value={summaryAr}
                onChange={(e) => setSummaryAr(e.target.value)}
                placeholder="ملخص موجز بالعربية"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('selectCategory')} *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.name_ar : cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('slug')} *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="topic-url-slug"
              />
            </div>
            <div>
              <Label>{t('sortOrder')}</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('structuredContent')}</CardTitle>
            {structuredContent.sections.length === 0 && (
              <Button variant="outline" onClick={applyTemplate} className="gap-2">
                <FileText className="w-4 h-4" />
                {t('useTemplate')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {structuredContent.sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">{t('noSections')}</p>
              <Button variant="outline" onClick={applyTemplate}>
                {t('useTemplate')}
              </Button>
            </div>
          ) : (
            structuredContent.sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={(updated) => updateSection(index, updated)}
                onDelete={() => deleteSection(index)}
                onMoveUp={() => moveSection(index, 'up')}
                onMoveDown={() => moveSection(index, 'down')}
                isFirst={index === 0}
                isLast={index === structuredContent.sections.length - 1}
              />
            ))
          )}

          {/* Add Section Dropdown */}
          <div className="flex gap-2 flex-wrap pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground self-center mr-2">
              {t('addSection')}:
            </span>
            {(['definition', 'key-concepts', 'comparison', 'advantages', 'risks', 'best-practices', 'example', 'related-kpis', 'custom'] as SectionType[]).map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addSection(type)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t(`section${type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicEditor;
