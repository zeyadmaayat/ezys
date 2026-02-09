import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsSection = () => {
  const { language } = useLanguage();

  const t = {
    badge: language === 'ar' ? 'آراء العملاء' : 'What Our Clients Say',
    title1: language === 'ar' ? 'موثوق من قبل' : 'Trusted by',
    titleHighlight: language === 'ar' ? 'قادة الصناعة' : 'Industry Leaders',
    subtitle: language === 'ar'
      ? 'اكتشف كيف ساعدت منصتنا الشركات على تحسين عملياتها اللوجستية وزيادة كفاءتها.'
      : 'Discover how LogiPro Hub has helped companies streamline their logistics and boost operational efficiency.',
  };

  const testimonials = [
    {
      name: language === 'ar' ? 'أحمد الراشد' : 'Ahmed Al-Rashed',
      role: language === 'ar' ? 'مدير العمليات' : 'Operations Director',
      company: language === 'ar' ? 'شركة النقل السريع' : 'Express Freight Co.',
      quote: language === 'ar'
        ? 'منصة LogiPro Hub غيّرت طريقة إدارتنا للشحنات بالكامل. أصبحت لدينا رؤية شاملة لكل عملية في الوقت الفعلي.'
        : 'LogiPro Hub completely transformed how we manage shipments. We now have full real-time visibility into every operation.',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'سارة المنصور' : 'Sara Al-Mansour',
      role: language === 'ar' ? 'مديرة سلسلة التوريد' : 'Supply Chain Manager',
      company: language === 'ar' ? 'مجموعة الخليج للتجارة' : 'Gulf Trade Group',
      quote: language === 'ar'
        ? 'الفوترة الآلية وتتبع المدفوعات وفّرا لنا ساعات من العمل اليدوي كل أسبوع. أنصح بها بشدة.'
        : 'Automated invoicing and payment tracking saved us hours of manual work every week. Highly recommended.',
      rating: 5,
    },
    {
      name: language === 'ar' ? 'خالد العتيبي' : 'Khalid Al-Otaibi',
      role: language === 'ar' ? 'المدير التنفيذي' : 'CEO',
      company: language === 'ar' ? 'لوجستيات المستقبل' : 'Future Logistics',
      quote: language === 'ar'
        ? 'من أفضل المنصات اللوجستية التي استخدمناها. لوحة القيادة توفر كل المعلومات التي نحتاجها في مكان واحد.'
        : 'One of the best logistics platforms we have used. The dashboard provides all the information we need in one place.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-primary">{t.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            {t.title1}{" "}
            <span className="text-gradient">{t.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              className="relative bg-background rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              <p className="text-foreground/80 leading-relaxed mb-6">{item.quote}</p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange text-orange" />
                ))}
              </div>
              <div>
                <p className="font-bold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
                <p className="text-sm text-primary font-medium">{item.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
