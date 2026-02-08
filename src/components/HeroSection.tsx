import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Truck, MapPin, Package, FileText, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { language, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowRight : ArrowRight;

  const t = {
    badge: language === 'ar' ? 'موثوق من قبل +2,500 شركة لوجستية' : 'Trusted by 2,500+ logistics companies',
    title1: language === 'ar' ? 'منصة' : 'Enterprise',
    titleHighlight: language === 'ar' ? 'لوجستية متكاملة' : 'Logistics Platform',
    title2: language === 'ar' ? 'للمؤسسات' : 'for Modern Supply Chains',
    subtitle: language === 'ar' 
      ? 'منصة لوجستية شاملة تساعدك على تتبع وإدارة وتحسين سلسلة التوريد بأكملها مع رؤية فورية وتحليلات قوية.'
      : 'The all-in-one logistics ERP that helps you manage orders, shipments, inventory, and billing with real-time visibility and powerful analytics.',
    getStarted: language === 'ar' ? 'ابدأ الآن' : 'Get Started',
    watchDemo: language === 'ar' ? 'شاهد العرض' : 'Watch Demo',
    trustedBy: language === 'ar' ? 'موثوق من قادة الصناعة' : 'Trusted by industry leaders',
    liveTracking: language === 'ar' ? 'التتبع المباشر' : 'Live Dashboard',
    activeShipments: language === 'ar' ? '24 شحنة نشطة' : '24 active shipments',
    live: language === 'ar' ? 'مباشر' : 'Live',
    inTransit: language === 'ar' ? 'في الطريق' : 'In Transit',
    delivered: language === 'ar' ? 'تم التسليم' : 'Delivered',
    onTime: language === 'ar' ? 'في الوقت' : 'On Time',
    efficiency: language === 'ar' ? 'الكفاءة' : 'Efficiency',
    shipment: language === 'ar' ? 'شحنة #4521' : 'Shipment #4521',
    arriving: language === 'ar' ? 'يصل خلال ساعتين' : 'Arriving in 2h',
  };

  return (
    <section className="relative min-h-screen bg-hero overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground/90 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground">{t.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {t.title1}{" "}
              <span className="text-gradient">{t.titleHighlight}</span>{" "}
              {t.title2}
            </h1>
            
            <p className={`text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-xl ${isRTL ? 'mr-0 ml-auto lg:ml-0' : 'mx-auto lg:mx-0'} animate-fade-up`} style={{ animationDelay: "0.3s" }}>
              {t.subtitle}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-${isRTL ? 'end' : 'start'} animate-fade-up`} style={{ animationDelay: "0.4s" }}>
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  {t.getStarted}
                  <ArrowIcon className={`w-5 h-5 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" className="group" asChild>
                <Link to="/categories">
                  <Play className="w-5 h-5" />
                  {t.watchDemo}
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-primary-foreground/10 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <p className="text-primary-foreground/50 text-sm mb-4">{t.trustedBy}</p>
              <div className={`flex items-center gap-8 justify-center lg:justify-${isRTL ? 'end' : 'start'} opacity-60`}>
                <span className="text-primary-foreground font-bold text-lg">Aramex</span>
                <span className="text-primary-foreground font-bold text-lg">DHL</span>
                <span className="text-primary-foreground font-bold text-lg">Maersk</span>
                <span className="text-primary-foreground font-bold text-lg hidden sm:block">NAQEL</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="relative z-10 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-border">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-foreground">{t.liveTracking}</h3>
                  <p className="text-sm text-muted-foreground">{t.activeShipments}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">{t.live}</span>
                </div>
              </div>

              {/* Mini Dashboard Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">142</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t.inTransit}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">38</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t.delivered}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">1,847</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Invoices</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">$24K</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <Truck className="w-5 h-5 mx-auto mb-1 text-accent" />
                  <p className="text-lg font-bold text-foreground">847</p>
                  <p className="text-xs text-muted-foreground">{t.inTransit}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold text-foreground">1,234</p>
                  <p className="text-xs text-muted-foreground">{t.delivered}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold text-foreground">98.5%</p>
                  <p className="text-xs text-muted-foreground">{t.onTime}</p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border animate-float z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">+23%</p>
                  <p className="text-xs text-muted-foreground">{t.efficiency}</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 border border-border animate-float z-20" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.shipment}</p>
                  <p className="text-xs text-muted-foreground">{t.arriving}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
