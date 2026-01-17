import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية' },
  categories: { en: 'Categories', ar: 'الفئات' },
  search: { en: 'Search', ar: 'بحث' },
  admin: { en: 'Admin', ar: 'لوحة الإدارة' },
  tools: { en: 'Tools', ar: 'الأدوات' },
  trainingTools: { en: 'Training Tools', ar: 'أدوات التدريب' },
  logisticsAssistant: { en: 'Logistics & Shipping AI', ar: 'مساعد الشحن واللوجستيات' },
  login: { en: 'Login', ar: 'تسجيل الدخول' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  signUp: { en: 'Sign Up', ar: 'إنشاء حساب' },
  
  // Auth
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  displayName: { en: 'Display Name', ar: 'الاسم المعروض' },
  welcomeBack: { en: 'Welcome Back', ar: 'مرحباً بعودتك' },
  createAccount: { en: 'Create Account', ar: 'إنشاء حساب جديد' },
  dontHaveAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  alreadyHaveAccount: { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  signInSuccess: { en: 'Signed in successfully', ar: 'تم تسجيل الدخول بنجاح' },
  signUpSuccess: { en: 'Account created successfully', ar: 'تم إنشاء الحساب بنجاح' },
  signOutSuccess: { en: 'Signed out successfully', ar: 'تم تسجيل الخروج بنجاح' },
  invalidCredentials: { en: 'Invalid email or password', ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة' },
  emailAlreadyUsed: { en: 'Email already registered', ar: 'البريد الإلكتروني مسجل بالفعل' },
  passwordMismatch: { en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' },
  passwordTooShort: { en: 'Password must be at least 6 characters', ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
  invalidEmail: { en: 'Please enter a valid email', ar: 'الرجاء إدخال بريد إلكتروني صحيح' },
  enterCredentials: { en: 'Enter your credentials to continue', ar: 'أدخل بيانات الاعتماد الخاصة بك للمتابعة' },
  fillDetails: { en: 'Fill in your details to get started', ar: 'أدخل بياناتك للبدء' },

  // Home
  heroTitle: { en: 'Your Professional Logistics Hub', ar: 'مركزك المهني للخدمات اللوجستية' },
  heroSubtitle: { en: 'Comprehensive resources for logistics and business professionals', ar: 'موارد شاملة للمحترفين في مجال اللوجستيات والأعمال' },
  exploreCategories: { en: 'Explore Categories', ar: 'استكشف الفئات' },
  getStarted: { en: 'Get Started', ar: 'ابدأ الآن' },
  
  // Categories
  procurement: { en: 'Procurement', ar: 'المشتريات' },
  transportation: { en: 'Transportation', ar: 'النقل' },
  importExport: { en: 'Import & Export', ar: 'الاستيراد والتصدير' },
  warehousing: { en: 'Warehousing', ar: 'التخزين' },
  inventoryManagement: { en: 'Inventory Management', ar: 'إدارة المخزون' },
  tqm: { en: 'TQM', ar: 'إدارة الجودة الشاملة' },
  hr: { en: 'HR', ar: 'الموارد البشرية' },
  greenLogistics: { en: 'Green Logistics', ar: 'اللوجستيات الخضراء' },
  humanitarianLogistics: { en: 'Humanitarian Logistics', ar: 'اللوجستيات الإنسانية' },
  businessAbbreviations: { en: 'Business Abbreviations', ar: 'الاختصارات التجارية' },

  // Category descriptions
  procurementDesc: { en: 'Strategic sourcing, vendor management, and purchasing processes', ar: 'التوريد الاستراتيجي وإدارة الموردين وعمليات الشراء' },
  transportationDesc: { en: 'Freight, shipping, fleet management, and logistics networks', ar: 'الشحن والنقل البحري وإدارة الأسطول وشبكات الخدمات اللوجستية' },
  importExportDesc: { en: 'International trade, customs, and regulatory compliance', ar: 'التجارة الدولية والجمارك والامتثال التنظيمي' },
  warehousingDesc: { en: 'Storage solutions, distribution centers, and facility management', ar: 'حلول التخزين ومراكز التوزيع وإدارة المرافق' },
  inventoryManagementDesc: { en: 'Stock control, demand forecasting, and supply planning', ar: 'مراقبة المخزون والتنبؤ بالطلب وتخطيط التوريد' },
  tqmDesc: { en: 'Quality control, continuous improvement, and process optimization', ar: 'مراقبة الجودة والتحسين المستمر وتحسين العمليات' },
  hrDesc: { en: 'Workforce management, training, and organizational development', ar: 'إدارة القوى العاملة والتدريب والتطوير التنظيمي' },
  greenLogisticsDesc: { en: 'Sustainable practices, carbon footprint, and eco-friendly solutions', ar: 'الممارسات المستدامة والبصمة الكربونية والحلول الصديقة للبيئة' },
  humanitarianLogisticsDesc: { en: 'Emergency response, disaster relief, and aid distribution', ar: 'الاستجابة للطوارئ والإغاثة من الكوارث وتوزيع المساعدات' },
  businessAbbreviationsDesc: { en: 'Common industry acronyms and terminology', ar: 'الاختصارات والمصطلحات الشائعة في الصناعة' },

  // General
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  topics: { en: 'Topics', ar: 'المواضيع' },
  noTopics: { en: 'No topics available yet', ar: 'لا توجد مواضيع متاحة حتى الآن' },
  backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
  backToCategory: { en: 'Back to Category', ar: 'العودة للفئة' },
  readMore: { en: 'Read More', ar: 'اقرأ المزيد' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  error: { en: 'Error', ar: 'خطأ' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  add: { en: 'Add', ar: 'إضافة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  back: { en: 'Back', ar: 'رجوع' },
  comingSoon: { en: 'Coming soon', ar: 'قريباً' },
  allCategories: { en: 'All Categories', ar: 'جميع الفئات' },

  // Search
  searchPlaceholder: { en: 'Search topics and abbreviations...', ar: 'البحث في المواضيع والاختصارات...' },
  searchResults: { en: 'Search Results', ar: 'نتائج البحث' },
  noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج' },
  noContent: { en: 'No content available yet', ar: 'لا يوجد محتوى متاح حتى الآن' },
  noCategories: { en: 'No categories available yet', ar: 'لا توجد فئات متاحة حتى الآن' },

  // Admin
  adminPanel: { en: 'Admin Panel', ar: 'لوحة الإدارة' },
  manageCategories: { en: 'Manage Categories', ar: 'إدارة الفئات' },
  manageTopics: { en: 'Manage Topics', ar: 'إدارة المواضيع' },
  manageAbbreviations: { en: 'Manage Abbreviations', ar: 'إدارة الاختصارات' },
  addCategory: { en: 'Add Category', ar: 'إضافة فئة' },
  addTopic: { en: 'Add Topic', ar: 'إضافة موضوع' },
  addAbbreviation: { en: 'Add Abbreviation', ar: 'إضافة اختصار' },
  editCategory: { en: 'Edit Category', ar: 'تعديل الفئة' },
  editTopic: { en: 'Edit Topic', ar: 'تعديل الموضوع' },
  editAbbreviation: { en: 'Edit Abbreviation', ar: 'تعديل الاختصار' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  titleEn: { en: 'Title (English)', ar: 'العنوان (إنجليزي)' },
  titleAr: { en: 'Title (Arabic)', ar: 'العنوان (عربي)' },
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  contentEn: { en: 'Content (English)', ar: 'المحتوى (إنجليزي)' },
  contentAr: { en: 'Content (Arabic)', ar: 'المحتوى (عربي)' },
  summaryEn: { en: 'Summary (English)', ar: 'الملخص (إنجليزي)' },
  summaryAr: { en: 'Summary (Arabic)', ar: 'الملخص (عربي)' },
  abbreviation: { en: 'Abbreviation', ar: 'الاختصار' },
  fullFormEn: { en: 'Full Form (English)', ar: 'الشكل الكامل (إنجليزي)' },
  fullFormAr: { en: 'Full Form (Arabic)', ar: 'الشكل الكامل (عربي)' },
  definitionEn: { en: 'Definition (English)', ar: 'التعريف (إنجليزي)' },
  definitionAr: { en: 'Definition (Arabic)', ar: 'التعريف (عربي)' },
  selectCategory: { en: 'Select Category', ar: 'اختر الفئة' },
  slug: { en: 'Slug (URL)', ar: 'الرابط المختصر' },
  icon: { en: 'Icon', ar: 'الأيقونة' },
  sortOrder: { en: 'Sort Order', ar: 'ترتيب العرض' },
  savedSuccess: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  deletedSuccess: { en: 'Deleted successfully', ar: 'تم الحذف بنجاح' },
  confirmDelete: { en: 'Are you sure you want to delete this?', ar: 'هل أنت متأكد من حذف هذا؟' },
  accessDenied: { en: 'Access Denied', ar: 'الوصول مرفوض' },
  adminOnly: { en: 'This area is for administrators only', ar: 'هذه المنطقة للمسؤولين فقط' },

  // Topic Editor
  basicInfo: { en: 'Basic Information', ar: 'المعلومات الأساسية' },
  structuredContent: { en: 'Structured Content', ar: 'المحتوى المنظم' },
  useTemplate: { en: 'Use Standard Template', ar: 'استخدام القالب القياسي' },
  noSections: { en: 'No sections added yet. Add sections or use the standard template.', ar: 'لم تتم إضافة أقسام بعد. أضف أقسامًا أو استخدم القالب القياسي.' },
  addSection: { en: 'Add Section', ar: 'إضافة قسم' },
  fillRequired: { en: 'Please fill all required fields', ar: 'يرجى ملء جميع الحقول المطلوبة' },
  deleteTopicWarning: { en: 'This action cannot be undone. The topic and all its content will be permanently deleted.', ar: 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف الموضوع وجميع محتوياته بشكل دائم.' },

  // Section Types
  sectionDefinition: { en: 'Definition', ar: 'التعريف' },
  sectionKeyConcepts: { en: 'Key Concepts', ar: 'المفاهيم الأساسية' },
  sectionComparison: { en: 'Comparison', ar: 'المقارنة' },
  sectionAdvantages: { en: 'Advantages', ar: 'المميزات' },
  sectionRisks: { en: 'Risks & Challenges', ar: 'المخاطر والتحديات' },
  sectionBestPractices: { en: 'Best Practices', ar: 'أفضل الممارسات' },
  sectionExample: { en: 'Practical Example', ar: 'مثال عملي' },
  sectionRelatedKPIs: { en: 'Related KPIs', ar: 'مؤشرات الأداء' },
  sectionCustom: { en: 'Custom', ar: 'مخصص' },
  sectionProductDescription: { en: 'Product Description', ar: 'وصف المنتج' },
  
  // These are for the add section buttons with camelCase keys
  sectionDefinition2: { en: 'Definition', ar: 'التعريف' },
  sectionKeyConcepts2: { en: 'Key Concepts', ar: 'المفاهيم الأساسية' },
  sectionComparison2: { en: 'Comparison', ar: 'المقارنة' },
  sectionAdvantages2: { en: 'Advantages', ar: 'المميزات' },
  sectionRisks2: { en: 'Risks', ar: 'المخاطر' },
  sectionBestPractices2: { en: 'Best Practices', ar: 'أفضل الممارسات' },
  sectionExample2: { en: 'Example', ar: 'مثال' },
  sectionRelatedKpis2: { en: 'Related KPIs', ar: 'مؤشرات الأداء' },
  sectionCustom2: { en: 'Custom', ar: 'مخصص' },

  // Content Types
  contentTypeText: { en: 'Text', ar: 'نص' },
  contentTypeBullets: { en: 'Bullet List', ar: 'قائمة نقطية' },
  contentTypeComparison: { en: 'Comparison Table', ar: 'جدول مقارنة' },
  contentTypeCallout: { en: 'Callout', ar: 'تنبيه' },
  contentTypeProductCard: { en: 'Product Card', ar: 'بطاقة المنتج' },

  // Editor Actions
  addBullet: { en: 'Add Bullet', ar: 'إضافة نقطة' },
  addRow: { en: 'Add Row', ar: 'إضافة صف' },
  leftColumn: { en: 'Left Column', ar: 'العمود الأيسر' },
  rightColumn: { en: 'Right Column', ar: 'العمود الأيمن' },

  // Footer
  allRightsReserved: { en: 'All rights reserved', ar: 'جميع الحقوق محفوظة' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('logipro-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('logipro-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
