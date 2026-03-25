import { 
  Package, 
  Truck, 
  Warehouse, 
  FileText, 
  BarChart3, 
  Users,
  Clock,
  ShieldCheck,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: Package,
      title: language === 'ar' ? 'إدارة الطلبات' : 'Order Management',
      description: language === 'ar' 
        ? 'أنشئ وتتبع الطلبات من البداية إلى النهاية مع سير عمل آلي وتحديثات فورية.'
        : 'Create and track orders from start to finish with automated workflows and real-time status updates.',
      color: "bg-primary/10 text-primary",
      link: "/erp/orders",
    },
    {
      icon: Truck,
      title: language === 'ar' ? 'إدارة الشحنات' : 'Shipment Tracking',
      description: language === 'ar'
        ? 'تتبع كل شحنة في الوقت الفعلي عبر دورة حياة التسليم بأكملها.'
        : 'Track every shipment in real-time across the entire delivery lifecycle with status management.',
      color: "bg-orange-500/10 text-orange-500",
      link: "/saas/shipments",
    },
    {
      icon: Warehouse,
      title: language === 'ar' ? 'إدارة المخزون' : 'Inventory Control',
      description: language === 'ar'
        ? 'راقب مستويات المخزون عبر المستودعات مع تتبع الحركة وتحسين المخزون.'
        : 'Monitor stock levels across warehouses with movement tracking and stock optimization.',
      color: "bg-purple-500/10 text-purple-500",
      link: "/erp/inventory",
    },
    {
      icon: FileText,
      title: language === 'ar' ? 'الفوترة والمدفوعات' : 'Billing & Invoices',
      description: language === 'ar'
        ? 'أنشئ الفواتير تلقائياً وتتبع المدفوعات وأدر التدفق النقدي بسهولة.'
        : 'Generate invoices automatically, track payments, and manage cash flow with ease.',
      color: "bg-green-500/10 text-green-500",
      link: "/saas/invoices",
    },
    {
      icon: BarChart3,
      title: language === 'ar' ? 'لوحة القيادة' : 'Dashboard',
      description: language === 'ar'
        ? 'احصل على رؤى قابلة للتنفيذ مع لوحات معلومات قوية وتحليلات تنبؤية.'
        : 'Gain actionable insights with powerful dashboards and operational analytics.',
      color: "bg-blue-500/10 text-blue-500",
      link: "/saas/dashboard",
    },
    {
      icon: Users,
      title: language === 'ar' ? 'إدارة العملاء' : 'Client Management',
      description: language === 'ar'
        ? 'أدر قاعدة عملائك مع سجلات كاملة وتتبع العناوين والتواصل.'
        : 'Manage your clients and vendors with complete records, address tracking, and communication.',
      color: "bg-pink-500/10 text-pink-500",
      link: "/saas/clients",
    },
    {
      icon: BookOpen,
      title: language === 'ar' ? 'أدوات التدريب' : 'Training Tools',
      description: language === 'ar'
        ? 'تدرب على سيناريوهات اللوجستيات الحقيقية باستخدام محاكاة تفاعلية وخطط عمل عملية.'
        : 'Train on real logistics scenarios with interactive simulations and practical action plans.',
      color: "bg-indigo-500/10 text-indigo-500",
      link: "/tools",
    },
  ];

  const t = {
    badge: language === 'ar' ? 'ميزات قوية' : 'Powerful Features',
    title1: language === 'ar' ? 'كل ما تحتاجه' : 'Everything You Need to',
    titleHighlight: language === 'ar' ? 'لإدارة اللوجستيات' : 'Run Your Logistics',
    subtitle: language === 'ar'
      ? 'من إدارة الطلبات إلى التحليلات المتقدمة، توفر منصتنا جميع الأدوات التي تحتاجها.'
      : 'From order management to advanced analytics, ezy Logistic HUB provides all the tools you need to streamline your supply chain.',
    setupTime: language === 'ar' ? 'الإعداد يستغرق أقل من 5 دقائق' : 'Setup takes less than 5 minutes',
  };

  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-primary">{t.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            {t.title1}{" "}
            <span className="text-gradient">{t.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Link
              to={feature.link}
              key={feature.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center justify-between">
                {feature.title}
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-secondary rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">
              {t.setupTime}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
