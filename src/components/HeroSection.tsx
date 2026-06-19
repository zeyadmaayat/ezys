import { Link } from "react-router-dom";
import { ArrowRight, Play, TrendingUp, Truck, BarChart3, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { language, isRTL } = useLanguage();

  const t = {
    badge: language === 'ar' ? 'من زياد' : 'by ZEYAD',
    ghost: language === 'ar' ? 'لوجستيات' : 'Logistics',
    title1: language === 'ar' ? 'إدارة' : 'Logistics',
    titleHighlight: language === 'ar' ? 'لوجستياتك' : 'Made Easy',
    title2: language === 'ar' ? 'بكل سهولة' : '',
    subtitle: language === 'ar'
      ? 'منصة واحدة لإدارة الشحنات والطلبات والفرق والفواتير. كل شيء مربوط في مساحة عمل واحدة عالية الأداء.'
      : 'A platform to manage shipments, orders, teams, and invoices. Everything connected in one unified high-performance workspace.',
    getStarted: language === 'ar' ? 'ابدأ مجاناً' : 'Start Free',
    watchDemo: language === 'ar' ? 'شاهد كيف يعمل' : 'See How It Works',
    overview: language === 'ar' ? 'نظرة سريعة' : 'Quick Overview',
    activeShipments: language === 'ar' ? '24 شحنة نشطة اليوم' : '24 active shipments today',
    efficiency: language === 'ar' ? '+23% كفاءة' : '+23% Efficiency',
    orders: language === 'ar' ? 'الطلبات' : 'Orders',
    inTransit: language === 'ar' ? 'في الطريق' : 'In Transit',
    delivered: language === 'ar' ? 'تم التسليم' : 'Delivered',
    invoices: language === 'ar' ? 'الفواتير' : 'Invoices',
    systemLoad: language === 'ar' ? 'حِمل النظام' : 'System Load',
    optimized: language === 'ar' ? 'مُحسَّن' : 'Optimized',
    onTime: language === 'ar' ? 'في الموعد' : 'On Time',
    avgProcess: language === 'ar' ? 'متوسط المعالجة' : 'Avg. Process',
  };

  const stats = [
    { label: t.orders, value: '142', accent: 'text-primary-foreground/70' },
    { label: t.inTransit, value: '38', accent: 'text-orange' },
    { label: t.delivered, value: '1,847', accent: 'text-primary-foreground/70' },
    { label: t.invoices, value: '$24K', accent: 'text-primary' },
  ];

  return (
    <section className="relative min-h-[90vh] bg-hero overflow-hidden pt-16 flex items-center">
      {/* Ambient background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
            <div className={`flex items-center gap-3 mb-8 justify-center lg:justify-${isRTL ? 'end' : 'start'} animate-fade-up`}>
              <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full">
                {t.badge}
              </span>
              <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <div className="relative">
              <span className="absolute -top-10 lg:-top-12 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 text-[80px] lg:text-[120px] font-extrabold text-primary-foreground/[0.04] leading-none select-none pointer-events-none uppercase whitespace-nowrap">
                {t.ghost}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t.title1}{" "}
                <br className="hidden lg:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/70 to-primary-foreground">
                  {t.titleHighlight}
                </span>
                {t.title2 && <>{" "}{t.title2}</>}
              </h1>
            </div>

            <p className={`text-lg text-primary-foreground/60 mt-8 max-w-lg leading-relaxed ${isRTL ? 'mr-0 ml-auto lg:ml-0' : 'mx-auto lg:mx-0'} animate-fade-up`} style={{ animationDelay: "0.2s" }}>
              {t.subtitle}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-${isRTL ? 'end' : 'start'} animate-fade-up`} style={{ animationDelay: "0.3s" }}>
              <Link
                to="/saas/dashboard"
                className="px-8 py-4 bg-gradient-to-br from-orange to-orange/90 text-white font-bold rounded-xl shadow-[0_10px_40px_-10px_hsl(var(--orange)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--orange)/0.7)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
              >
                {t.getStarted}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'} transition-transform`} />
              </Link>
              <Link
                to="/logistics-assistant"
                className="px-8 py-4 bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground font-semibold rounded-xl border border-primary-foreground/10 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-primary" />
                {t.watchDemo}
              </Link>
            </div>
          </div>

          {/* Dashboard Side */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="absolute -inset-4 bg-primary/20 blur-[60px] rounded-3xl" />

            <div className="relative bg-card/60 border border-border/50 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-foreground font-bold text-xl">{t.overview}</h3>
                  <p className="text-muted-foreground text-sm">{t.activeShipments}</p>
                </div>
                <div className="bg-ezy-green/10 border border-ezy-green/20 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-ezy-green rounded-full animate-pulse" />
                  <span className="text-ezy-green text-xs font-bold whitespace-nowrap">{t.efficiency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="bg-foreground/[0.03] border border-border/40 rounded-2xl p-5 hover:bg-foreground/[0.06] transition-colors">
                    <p className={`${s.accent} text-xs font-medium uppercase tracking-wider mb-1`}>{s.label}</p>
                    <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{t.systemLoad}</span>
                  <span className="text-primary font-bold">{t.optimized}</span>
                </div>
                <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-primary to-primary/60 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className={`absolute -bottom-10 ${isRTL ? '-right-6' : '-left-6'} bg-card/80 backdrop-blur-2xl border border-border/50 p-4 rounded-2xl shadow-2xl animate-float z-20`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-bold">98.5%</p>
                  <p className="text-muted-foreground text-xs">{t.onTime}</p>
                </div>
              </div>
            </div>

            <div className={`absolute -top-6 ${isRTL ? '-left-4' : '-right-4'} bg-card/80 backdrop-blur-2xl border border-border/50 p-4 rounded-2xl shadow-2xl animate-float z-20`} style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange/20 rounded-xl">
                  <Clock className="w-5 h-5 text-orange" />
                </div>
                <div>
                  <p className="text-foreground font-bold">12m</p>
                  <p className="text-muted-foreground text-xs">{t.avgProcess}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
