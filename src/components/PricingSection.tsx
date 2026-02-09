import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingSection = () => {
  const { language } = useLanguage();

  const t = {
    badge: language === 'ar' ? 'خطط الأسعار' : 'Pricing Plans',
    title1: language === 'ar' ? 'خطة مناسبة' : 'A Plan for',
    titleHighlight: language === 'ar' ? 'لكل حجم أعمال' : 'Every Business Size',
    subtitle: language === 'ar'
      ? 'ابدأ مجاناً وقم بالترقية حسب نمو أعمالك. جميع الخطط تشمل الدعم الفني.'
      : 'Start free and scale as you grow. All plans include technical support and core features.',
    monthly: language === 'ar' ? '/ شهرياً' : '/ month',
    getStarted: language === 'ar' ? 'ابدأ الآن' : 'Get Started',
    contactSales: language === 'ar' ? 'تواصل مع المبيعات' : 'Contact Sales',
    popular: language === 'ar' ? 'الأكثر شعبية' : 'Most Popular',
    free: language === 'ar' ? 'مجاني' : 'Free',
    custom: language === 'ar' ? 'مخصص' : 'Custom',
  };

  const plans = [
    {
      name: language === 'ar' ? 'مجاني' : 'Free',
      price: t.free,
      description: language === 'ar' ? 'للبدء واستكشاف المنصة' : 'Get started and explore the platform',
      icon: Zap,
      iconColor: 'text-muted-foreground',
      features: language === 'ar'
        ? ['حتى 25 شحنة / شهر', 'مستخدم واحد', 'لوحة قيادة أساسية', 'تتبع الشحنات', 'دعم عبر البريد']
        : ['Up to 25 shipments / month', '1 user', 'Basic dashboard', 'Shipment tracking', 'Email support'],
      cta: t.getStarted,
      popular: false,
      highlighted: false,
    },
    {
      name: language === 'ar' ? 'ستارتر' : 'Starter',
      price: '$29',
      description: language === 'ar' ? 'للشركات الصغيرة والناشئة' : 'For small and growing businesses',
      icon: Zap,
      iconColor: 'text-primary',
      features: language === 'ar'
        ? ['حتى 200 شحنة / شهر', 'حتى 5 مستخدمين', 'إدارة العملاء', 'الفوترة الآلية', 'تقارير أساسية', 'دعم ذو أولوية']
        : ['Up to 200 shipments / month', 'Up to 5 users', 'Client management', 'Automated invoicing', 'Basic reports', 'Priority support'],
      cta: t.getStarted,
      popular: false,
      highlighted: false,
    },
    {
      name: language === 'ar' ? 'احترافي' : 'Pro',
      price: '$79',
      description: language === 'ar' ? 'للشركات المتوسطة التي تحتاج أدوات متقدمة' : 'For mid-size companies needing advanced tools',
      icon: Crown,
      iconColor: 'text-orange',
      features: language === 'ar'
        ? ['شحنات غير محدودة', 'حتى 25 مستخدم', 'إدارة المستودعات', 'تحليلات متقدمة', 'مساعد AI لوجستي', 'إدارة المخزون', 'تقارير PDF', 'دعم مخصص']
        : ['Unlimited shipments', 'Up to 25 users', 'Warehouse management', 'Advanced analytics', 'AI logistics assistant', 'Inventory management', 'PDF reports', 'Dedicated support'],
      cta: t.getStarted,
      popular: true,
      highlighted: true,
    },
    {
      name: language === 'ar' ? 'المؤسسات' : 'Enterprise',
      price: t.custom,
      description: language === 'ar' ? 'للمؤسسات الكبيرة باحتياجات مخصصة' : 'For large organizations with custom needs',
      icon: Building2,
      iconColor: 'text-foreground',
      features: language === 'ar'
        ? ['كل مزايا Pro', 'مستخدمون غير محدودون', 'API مخصص', 'SSO تسجيل دخول موحد', 'SLA مضمون', 'مدير حساب مخصص', 'تدريب مخصص']
        : ['Everything in Pro', 'Unlimited users', 'Custom API access', 'SSO single sign-on', 'Guaranteed SLA', 'Dedicated account manager', 'Custom training'],
      cta: t.contactSales,
      popular: false,
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-primary">{t.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            {t.title1}{" "}
            <span className="text-gradient">{t.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 animate-fade-up ${
                plan.highlighted
                  ? 'bg-hero border-primary/50 shadow-glow scale-[1.02]'
                  : 'bg-card border-border hover:border-primary/30 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gradient text-accent-foreground text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  {t.popular}
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl ${plan.highlighted ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 ${plan.highlighted ? 'text-primary-foreground' : plan.iconColor}`} />
              </div>

              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {plan.price}
                </span>
                {plan.price !== t.free && plan.price !== t.custom && (
                  <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {t.monthly}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 mt-0.5 shrink-0 ${plan.highlighted ? 'text-green-400' : 'text-primary'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/90' : 'text-foreground/80'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'hero' : 'outline'}
                className="w-full"
                asChild
              >
                <Link to="/auth">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
