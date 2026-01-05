// Structured content types for professional topic formatting
// Stored as JSON in content_en/content_ar fields

export type SectionType = 
  | 'definition'
  | 'key-concepts'
  | 'comparison'
  | 'advantages'
  | 'risks'
  | 'best-practices'
  | 'example'
  | 'related-kpis'
  | 'custom';

export type ContentType = 'text' | 'bullets' | 'comparison-table' | 'callout';

export interface ComparisonItem {
  left_en: string;
  left_ar: string;
  right_en: string;
  right_ar: string;
}

export interface TopicSection {
  id: string;
  type: SectionType;
  title_en: string;
  title_ar: string;
  contentType: ContentType;
  // Content can be: string (text/callout), string[] (bullets), or ComparisonItem[] (comparison-table)
  content_en: string | string[] | ComparisonItem[];
  content_ar: string | string[] | ComparisonItem[];
  order: number;
}

export interface StructuredContent {
  version: number;
  sections: TopicSection[];
}

// Default section titles for each type
export const SECTION_DEFAULTS: Record<SectionType, { title_en: string; title_ar: string; contentType: ContentType }> = {
  'definition': {
    title_en: 'Definition',
    title_ar: 'التعريف',
    contentType: 'text'
  },
  'key-concepts': {
    title_en: 'Key Concepts',
    title_ar: 'المفاهيم الأساسية',
    contentType: 'bullets'
  },
  'comparison': {
    title_en: 'Comparison',
    title_ar: 'المقارنة',
    contentType: 'comparison-table'
  },
  'advantages': {
    title_en: 'Advantages',
    title_ar: 'المميزات',
    contentType: 'bullets'
  },
  'risks': {
    title_en: 'Risks & Challenges',
    title_ar: 'المخاطر والتحديات',
    contentType: 'bullets'
  },
  'best-practices': {
    title_en: 'Best Practices',
    title_ar: 'أفضل الممارسات',
    contentType: 'bullets'
  },
  'example': {
    title_en: 'Practical Example',
    title_ar: 'مثال عملي',
    contentType: 'callout'
  },
  'related-kpis': {
    title_en: 'Related KPIs & Terms',
    title_ar: 'مؤشرات الأداء والمصطلحات ذات الصلة',
    contentType: 'bullets'
  },
  'custom': {
    title_en: 'Custom Section',
    title_ar: 'قسم مخصص',
    contentType: 'text'
  }
};

// Helper to generate unique IDs
export const generateSectionId = (): string => {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to create a new section with defaults
export const createSection = (type: SectionType, order: number): TopicSection => {
  const defaults = SECTION_DEFAULTS[type];
  return {
    id: generateSectionId(),
    type,
    title_en: defaults.title_en,
    title_ar: defaults.title_ar,
    contentType: defaults.contentType,
    content_en: defaults.contentType === 'bullets' ? [] : 
                defaults.contentType === 'comparison-table' ? [] : '',
    content_ar: defaults.contentType === 'bullets' ? [] : 
                defaults.contentType === 'comparison-table' ? [] : '',
    order
  };
};

// Helper to parse structured content from JSON string
export const parseStructuredContent = (jsonString: string | null): StructuredContent | null => {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.version && Array.isArray(parsed.sections)) {
      return parsed as StructuredContent;
    }
    return null;
  } catch {
    return null;
  }
};

// Helper to create empty structured content
export const createEmptyStructuredContent = (): StructuredContent => ({
  version: 1,
  sections: []
});

// Standard topic template with recommended sections
export const STANDARD_TEMPLATE: SectionType[] = [
  'definition',
  'key-concepts',
  'advantages',
  'risks',
  'best-practices',
  'example',
  'related-kpis'
];
