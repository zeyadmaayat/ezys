import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const { language } = useLanguage();

  const t = {
    badge: language === 'ar' ? 'أسئلة شائعة' : 'FAQ',
    title1: language === 'ar' ? 'أسئلة' : 'Frequently Asked',
    titleHighlight: language === 'ar' ? 'متكررة' : 'Questions',
    subtitle: language === 'ar'
      ? 'إجابات على أكثر الأسئلة شيوعاً حول منصتنا وخدماتنا.'
      : 'Answers to the most common questions about our platform and services.',
  };

  const faqs = [
    {
      q: language === 'ar' ? 'هل يمكنني تجربة المنصة مجاناً؟' : 'Can I try the platform for free?',
      a: language === 'ar'
        ? 'نعم! نقدم خطة مجانية تشمل حتى 25 شحنة شهرياً، بالإضافة إلى تجربة مجانية لمدة 14 يوماً على جميع الخطط المدفوعة بدون الحاجة لبطاقة ائتمان.'
        : 'Yes! We offer a free plan with up to 25 shipments per month, plus a 14-day free trial on all paid plans with no credit card required.',
    },
    {
      q: language === 'ar' ? 'كيف تتم حماية بياناتي؟' : 'How is my data protected?',
      a: language === 'ar'
        ? 'نستخدم تشفيراً من الدرجة المصرفية وعزل البيانات على مستوى الشركة. كل مستأجر لديه بيانات معزولة تماماً عن الآخرين مع سياسات أمان صارمة.'
        : 'We use bank-grade encryption and company-level data isolation. Each tenant has completely isolated data with strict security policies (Row Level Security).',
    },
    {
      q: language === 'ar' ? 'هل يدعم النظام اللغة العربية؟' : 'Does the system support Arabic?',
      a: language === 'ar'
        ? 'نعم، المنصة ثنائية اللغة بالكامل (عربي/إنجليزي) مع دعم كامل لتخطيط RTL والواجهة المحلية.'
        : 'Yes, the platform is fully bilingual (Arabic/English) with complete RTL layout support and a localized interface.',
    },
    {
      q: language === 'ar' ? 'هل يمكنني ترقية أو تخفيض خطتي لاحقاً؟' : 'Can I upgrade or downgrade my plan later?',
      a: language === 'ar'
        ? 'بالتأكيد! يمكنك الترقية أو التخفيض في أي وقت. التغييرات تسري فوراً ويتم احتساب الفرق تناسبياً.'
        : 'Absolutely! You can upgrade or downgrade at any time. Changes take effect immediately and the difference is prorated.',
    },
    {
      q: language === 'ar' ? 'كم عدد المستخدمين الذين يمكنني إضافتهم؟' : 'How many users can I add?',
      a: language === 'ar'
        ? 'يعتمد على خطتك: مستخدم واحد في المجانية، 5 في ستارتر، 25 في الاحترافية، وغير محدود في المؤسسات. كل مستخدم يمكن أن يكون له دور مختلف (عمليات، مستودعات، مالية، مشاهد).'
        : 'It depends on your plan: 1 user on Free, 5 on Starter, 25 on Pro, and unlimited on Enterprise. Each user can have a different role (operations, warehouse, finance, viewer).',
    },
    {
      q: language === 'ar' ? 'هل يتضمن النظام مساعد ذكاء اصطناعي؟' : 'Does the system include an AI assistant?',
      a: language === 'ar'
        ? 'نعم! خطة Pro والمؤسسات تتضمن مساعد AI لوجستي يساعدك في تخطيط الشحنات وتقديم توصيات بأنواع الشحن وتقدير التكاليف.'
        : 'Yes! Pro and Enterprise plans include an AI logistics assistant that helps you plan shipments, recommend shipping modes, and estimate costs.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-primary">{t.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            {t.title1}{" "}
            <span className="text-gradient">{t.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-background rounded-xl border border-border px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
