import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Truck, MapPin, Package, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EzyLogo from "@/components/EzyLogo";

const HeroSection = () => {
  const { language, isRTL } = useLanguage();

  const t = {
    badge: language === 'ar' ? 'سهل · سريع · ذكي' : 'Simple · Fast · Smart',
    title1: language === 'ar' ? 'إدارة' : 'Logistics',
    titleHighlight: language === 'ar' ? 'لوجستياتك' : 'Made Easy',
    title2: language === 'ar' ? 'بكل سهولة' : '',
    subtitle: language === 'ar' 
      ? 'منصة واحدة لإدارة الشحنات والطلبات والمخزون والفواتير. كل شيء مربوط ببعضه.'
      : 'One platform to manage shipments, orders, inventory, and invoices. Everything connected.',
    getStarted: language === 'ar' ? 'ابدأ مجاناً' : 'Start Free',
    watchDemo: language === 'ar' ? 'شاهد كيف يعمل' : 'See How It Works',
    liveTracking: language === 'ar' ? 'نظرة سريعة' : 'Quick Overview',
    activeShipments: language === 'ar' ? '24 شحنة نشطة' : '24 active shipments',
    live: language === 'ar' ? 'مباشر' : 'Live',
    inTransit: language === 'ar' ? 'في الطريق' : 'In Transit',
    delivered: language === 'ar' ? 'تم التسليم' : 'Delivered',
    onTime: language === 'ar' ? 'في الموعد' : 'On Time',
    efficiency: language === 'ar' ? 'كفاءة' : 'Efficiency',
    shipment: language === 'ar' ? 'شحنة #4521' : 'Shipment #4521',
    arriving: language === 'ar' ? 'يصل خلال ساعتين' : 'Arriving in 2h',
  };

  return (
    <section className="relative min-h-[90vh] bg-hero overflow-hidden pt-16">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/50 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
              <span className="text-primary-foreground/80">✦ {t.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              {t.title1}{" "}
              <span className="text-gradient">{t.titleHighlight}</span>
              {t.title2 && <>{" "}{t.title2}</>}
            </h1>
            
            <p className={`text-lg md:text-xl text-primary-foreground/60 mb-8 max-w-lg ${isRTL ? 'mr-0 ml-auto lg:ml-0' : 'mx-auto lg:mx-0'} animate-fade-up`} style={{ animationDelay: "0.2s" }}>
              {t.subtitle}
            </p>

            <div className={`flex flex-col sm:flex-row gap-3 justify-center lg:justify-${isRTL ? 'end' : 'start'} animate-fade-up`} style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/saas/dashboard">
                  {t.getStarted}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" className="group" asChild>
                <Link to="/logistics-assistant">
                  <Play className="w-4 h-4" />
                  {t.watchDemo}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Clean Dashboard Preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative z-10 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-border/50">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground text-sm">{t.liveTracking}</h3>
                  <p className="text-xs text-muted-foreground">{t.activeShipments}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-ezy-green animate-pulse" />
                  <span className="text-xs text-muted-foreground">{t.live}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: Package, label: 'Orders', value: '142', color: 'text-primary' },
                  { icon: Truck, label: t.inTransit, value: '38', color: 'text-orange' },
                  { icon: MapPin, label: t.delivered, value: '1,847', color: 'text-ezy-green' },
                  { icon: FileText, label: 'Invoices', value: '$24K', color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, value: '847', label: t.inTransit, color: 'text-orange' },
                  { icon: MapPin, value: '1,234', label: t.delivered, color: 'text-ezy-green' },
                  { icon: TrendingUp, value: '98.5%', label: t.onTime, color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/30 rounded-lg p-3 text-center">
                    <item.icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
                    <p className="text-base font-bold text-foreground">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating efficiency card */}
            <div className="absolute -top-3 -right-3 bg-card rounded-xl shadow-md p-3 border border-border animate-float z-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ezy-green/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-ezy-green" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">+23%</p>
                  <p className="text-[10px] text-muted-foreground">{t.efficiency}</p>
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
