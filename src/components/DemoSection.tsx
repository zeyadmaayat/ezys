import { Link } from "react-router-dom";
import { Play, Package, Boxes, ShoppingCart, Wallet, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DemoSection = () => {
  const { language, isRTL } = useLanguage();

  const t = {
    eyebrow: language === 'ar' ? 'فيديو تعريفي' : 'Product demo',
    title: language === 'ar' ? 'شاهد ezys خلال 16 ثانية' : 'See ezys in 16 seconds',
    subtitle: language === 'ar'
      ? 'جولة سريعة على أهم وظائف المنصة: الشحنات، المخزون بالذكاء الاصطناعي، المشتريات والمالية.'
      : 'A quick tour of the core modules: shipments, AI-powered inventory, procurement and finance.',
    linksTitle: language === 'ar' ? 'انتقل مباشرة إلى' : 'Jump straight to',
    cta: language === 'ar' ? 'ابدأ مجاناً' : 'Start free',
  };

  const links = [
    {
      icon: Package,
      to: "/#features",
      title: language === 'ar' ? 'الشحنات والعمليات' : 'Shipments & operations',
      desc: language === 'ar' ? 'تتبع كامل من الإنشاء حتى التسليم' : 'Full tracking from created to delivered',
    },
    {
      icon: Boxes,
      to: "/#features",
      title: language === 'ar' ? 'المخزون الذكي' : 'Smart inventory',
      desc: language === 'ar' ? 'مسح بالكاميرا، دفعات، وإعادة طلب' : 'Camera scan, batches and reorder rules',
    },
    {
      icon: ShoppingCart,
      to: "/#pricing",
      title: language === 'ar' ? 'الخطط والأسعار' : 'Plans & pricing',
      desc: language === 'ar' ? 'خطط تناسب كل حجم أعمال' : 'A plan for every business size',
    },
    {
      icon: Wallet,
      to: "/#faq",
      title: language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently asked',
      desc: language === 'ar' ? 'إجابات عن الأمان والتجربة المجانية' : 'Answers on security and the free trial',
    },
  ];

  return (
    <section id="demo" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full">
            {t.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mt-5">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground mt-4">{t.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-background shadow-2xl">
            <video
              className="w-full h-auto block"
              src="/video/ezys-demo.mp4"
              poster="/video/ezys-demo-poster.jpg"
              controls
              playsInline
              muted
              loop
              preload="none"
              aria-label={language === 'ar' ? 'فيديو ديمو لمنصة ezy Logistic HUB' : 'ezy Logistic HUB demo video'}
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {t.linksTitle}
            </p>
            <div className="space-y-3">
              {links.map((l) => (
                <Link
                  key={l.title}
                  to={l.to}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-background/60 hover:bg-background hover:border-primary/40 transition-colors group"
                >
                  <span className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    <l.icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-foreground">{l.title}</span>
                    <span className="block text-sm text-muted-foreground truncate">{l.desc}</span>
                  </span>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              ))}
            </div>

            <Link
              to="/signup"
              className="mt-4 w-full px-6 py-4 bg-gradient-to-br from-orange to-orange/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
            >
              <Play className="w-4 h-4" />
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
