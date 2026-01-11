import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  StructuredContent, 
  TopicSection, 
  ComparisonItem,
  parseStructuredContent 
} from '@/types/structured-content';
import { 
  BookOpen, 
  Lightbulb, 
  GitCompare, 
  ThumbsUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  BarChart3 
} from 'lucide-react';

interface StructuredTopicRendererProps {
  content: string | null;
}

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'definition': BookOpen,
  'key-concepts': Lightbulb,
  'comparison': GitCompare,
  'advantages': ThumbsUp,
  'risks': AlertTriangle,
  'best-practices': CheckCircle,
  'example': FileText,
  'related-kpis': BarChart3,
  'custom': BookOpen
};

const SECTION_COLORS: Record<string, string> = {
  'definition': 'border-l-blue-500 bg-blue-500/5',
  'key-concepts': 'border-l-amber-500 bg-amber-500/5',
  'comparison': 'border-l-purple-500 bg-purple-500/5',
  'advantages': 'border-l-green-500 bg-green-500/5',
  'risks': 'border-l-red-500 bg-red-500/5',
  'best-practices': 'border-l-teal-500 bg-teal-500/5',
  'example': 'border-l-indigo-500 bg-indigo-500/5',
  'related-kpis': 'border-l-orange-500 bg-orange-500/5',
  'custom': 'border-l-gray-500 bg-gray-500/5'
};

const ICON_COLORS: Record<string, string> = {
  'definition': 'text-blue-500',
  'key-concepts': 'text-amber-500',
  'comparison': 'text-purple-500',
  'advantages': 'text-green-500',
  'risks': 'text-red-500',
  'best-practices': 'text-teal-500',
  'example': 'text-indigo-500',
  'related-kpis': 'text-orange-500',
  'custom': 'text-gray-500'
};

const SectionRenderer = ({ section }: { section: TopicSection }) => {
  const { language, isRTL } = useLanguage();
  
  const Icon = SECTION_ICONS[section.type] || BookOpen;
  const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.custom;
  const iconColor = ICON_COLORS[section.type] || ICON_COLORS.custom;
  
  const title = language === 'ar' ? section.title_ar : section.title_en;
  const content = language === 'ar' ? section.content_ar : section.content_en;

  const renderContent = () => {
    switch (section.contentType) {
      case 'text':
        return (
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {content as string}
          </p>
        );

      case 'bullets':
        const bullets = content as string[];
        if (!bullets || bullets.length === 0) return null;
        return (
          <ul className="space-y-2">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
                <span className="text-foreground/90">{bullet}</span>
              </li>
            ))}
          </ul>
        );

      case 'callout':
        return (
          <div className={`rounded-lg p-4 ${colorClass} border-l-4`}>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap italic">
              {content as string}
            </p>
          </div>
        );

      case 'comparison-table':
        const items = content as ComparisonItem[];
        if (!items || items.length === 0) return null;
        
        // Get column headers from first item or use defaults
        const leftHeader = language === 'ar' ? 'الخيار أ' : 'Option A';
        const rightHeader = language === 'ar' ? 'الخيار ب' : 'Option B';
        
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-foreground bg-muted/50`}>
                    {leftHeader}
                  </th>
                  <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-foreground bg-muted/50`}>
                    {rightHeader}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground/90">
                      {language === 'ar' ? item.left_ar : item.left_en}
                    </td>
                    <td className="py-3 px-4 text-foreground/90">
                      {language === 'ar' ? item.right_ar : item.right_en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if section has content
  const hasContent = () => {
    if (!content) return false;
    if (typeof content === 'string') return content.trim().length > 0;
    if (Array.isArray(content)) return content.length > 0;
    return false;
  };

  if (!hasContent()) return null;

  return (
    <section className={`rounded-xl border-l-4 p-6 ${colorClass}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {renderContent()}
    </section>
  );
};

const StructuredTopicRenderer = ({ content }: StructuredTopicRendererProps) => {
  const { t } = useLanguage();
  
  const structured = parseStructuredContent(content);
  
  if (!structured || structured.sections.length === 0) {
    // Fallback: render as plain text if not structured JSON
    if (content && !content.startsWith('{')) {
      const sanitizedContent = DOMPurify.sanitize(
        content.replace(/\n/g, '<br />'),
        {
          ALLOWED_TAGS: ['br', 'p', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
        }
      );
      return (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div 
            className="whitespace-pre-wrap text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      );
    }
    
    return (
      <p className="text-muted-foreground italic">{t('noContent')}</p>
    );
  }

  // Sort sections by order
  const sortedSections = [...structured.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};

export default StructuredTopicRenderer;
