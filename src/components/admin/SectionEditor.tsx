import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  TopicSection, 
  ContentType, 
  SectionType,
  ComparisonItem,
  SECTION_DEFAULTS 
} from '@/types/structured-content';
import { 
  GripVertical, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Plus,
  X
} from 'lucide-react';

interface SectionEditorProps {
  section: TopicSection;
  onUpdate: (section: TopicSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SectionEditor = ({ 
  section, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast
}: SectionEditorProps) => {
  const { t, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTypeChange = (type: SectionType) => {
    const defaults = SECTION_DEFAULTS[type];
    onUpdate({
      ...section,
      type,
      title_en: defaults.title_en,
      title_ar: defaults.title_ar,
      contentType: defaults.contentType,
      content_en: defaults.contentType === 'bullets' ? [] : 
                  defaults.contentType === 'comparison-table' ? [] : '',
      content_ar: defaults.contentType === 'bullets' ? [] : 
                  defaults.contentType === 'comparison-table' ? [] : ''
    });
  };

  const handleContentTypeChange = (contentType: ContentType) => {
    onUpdate({
      ...section,
      contentType,
      content_en: contentType === 'bullets' ? [] : 
                  contentType === 'comparison-table' ? [] : '',
      content_ar: contentType === 'bullets' ? [] : 
                  contentType === 'comparison-table' ? [] : ''
    });
  };

  // Bullet list handlers
  const addBullet = (lang: 'en' | 'ar') => {
    const content = section[`content_${lang}`] as string[];
    onUpdate({
      ...section,
      [`content_${lang}`]: [...content, '']
    });
  };

  const updateBullet = (lang: 'en' | 'ar', index: number, value: string) => {
    const content = [...(section[`content_${lang}`] as string[])];
    content[index] = value;
    onUpdate({
      ...section,
      [`content_${lang}`]: content
    });
  };

  const removeBullet = (lang: 'en' | 'ar', index: number) => {
    const content = [...(section[`content_${lang}`] as string[])];
    content.splice(index, 1);
    onUpdate({
      ...section,
      [`content_${lang}`]: content
    });
  };

  // Comparison table handlers
  const addComparisonRow = () => {
    const items = section.content_en as ComparisonItem[];
    const newItem: ComparisonItem = {
      left_en: '',
      left_ar: '',
      right_en: '',
      right_ar: ''
    };
    onUpdate({
      ...section,
      content_en: [...items, newItem],
      content_ar: [...items, newItem]
    });
  };

  const updateComparisonRow = (index: number, field: keyof ComparisonItem, value: string) => {
    const items = [...(section.content_en as ComparisonItem[])];
    items[index] = { ...items[index], [field]: value };
    onUpdate({
      ...section,
      content_en: items,
      content_ar: items
    });
  };

  const removeComparisonRow = (index: number) => {
    const items = [...(section.content_en as ComparisonItem[])];
    items.splice(index, 1);
    onUpdate({
      ...section,
      content_en: items,
      content_ar: items
    });
  };

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          
          <div className="flex-1 flex items-center gap-2">
            <Select value={section.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="definition">{t('sectionDefinition')}</SelectItem>
                <SelectItem value="key-concepts">{t('sectionKeyConcepts')}</SelectItem>
                <SelectItem value="comparison">{t('sectionComparison')}</SelectItem>
                <SelectItem value="advantages">{t('sectionAdvantages')}</SelectItem>
                <SelectItem value="risks">{t('sectionRisks')}</SelectItem>
                <SelectItem value="best-practices">{t('sectionBestPractices')}</SelectItem>
                <SelectItem value="example">{t('sectionExample')}</SelectItem>
                <SelectItem value="related-kpis">{t('sectionRelatedKPIs')}</SelectItem>
                <SelectItem value="custom">{t('sectionCustom')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={section.contentType} onValueChange={handleContentTypeChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t('contentTypeText')}</SelectItem>
                <SelectItem value="bullets">{t('contentTypeBullets')}</SelectItem>
                <SelectItem value="comparison-table">{t('contentTypeComparison')}</SelectItem>
                <SelectItem value="callout">{t('contentTypeCallout')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Section Titles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('titleEn')}</Label>
              <Input
                value={section.title_en}
                onChange={(e) => onUpdate({ ...section, title_en: e.target.value })}
                placeholder="Section title in English"
              />
            </div>
            <div dir="rtl">
              <Label>{t('titleAr')}</Label>
              <Input
                value={section.title_ar}
                onChange={(e) => onUpdate({ ...section, title_ar: e.target.value })}
                placeholder="عنوان القسم بالعربية"
              />
            </div>
          </div>

          {/* Content based on type */}
          {section.contentType === 'text' || section.contentType === 'callout' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('contentEn')}</Label>
                <Textarea
                  value={section.content_en as string}
                  onChange={(e) => onUpdate({ ...section, content_en: e.target.value })}
                  placeholder="Content in English..."
                  rows={4}
                />
              </div>
              <div dir="rtl">
                <Label>{t('contentAr')}</Label>
                <Textarea
                  value={section.content_ar as string}
                  onChange={(e) => onUpdate({ ...section, content_ar: e.target.value })}
                  placeholder="المحتوى بالعربية..."
                  rows={4}
                />
              </div>
            </div>
          ) : section.contentType === 'bullets' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('contentEn')}</Label>
                {(section.content_en as string[]).map((bullet, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => updateBullet('en', index, e.target.value)}
                      placeholder={`Bullet point ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBullet('en', index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBullet('en')}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addBullet')}
                </Button>
              </div>
              <div className="space-y-2" dir="rtl">
                <Label>{t('contentAr')}</Label>
                {(section.content_ar as string[]).map((bullet, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => updateBullet('ar', index, e.target.value)}
                      placeholder={`النقطة ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBullet('ar', index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBullet('ar')}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  {t('addBullet')}
                </Button>
              </div>
            </div>
          ) : section.contentType === 'comparison-table' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground">
                <div className="text-center">{t('leftColumn')}</div>
                <div className="text-center">{t('rightColumn')}</div>
              </div>
              {(section.content_en as ComparisonItem[]).map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-3 border border-border rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComparisonRow(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="space-y-2">
                    <Input
                      value={item.left_en}
                      onChange={(e) => updateComparisonRow(index, 'left_en', e.target.value)}
                      placeholder="Left (EN)"
                    />
                    <Input
                      value={item.left_ar}
                      onChange={(e) => updateComparisonRow(index, 'left_ar', e.target.value)}
                      placeholder="Left (AR)"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={item.right_en}
                      onChange={(e) => updateComparisonRow(index, 'right_en', e.target.value)}
                      placeholder="Right (EN)"
                    />
                    <Input
                      value={item.right_ar}
                      onChange={(e) => updateComparisonRow(index, 'right_ar', e.target.value)}
                      placeholder="Right (AR)"
                      dir="rtl"
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addComparisonRow}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addRow')}
              </Button>
            </div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
};

export default SectionEditor;
