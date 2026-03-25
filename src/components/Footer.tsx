import { Package, Linkedin, Twitter, Github, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();

  const t = {
    brand: 'ezy Logistic HUB',
    tagline: language === 'ar'
      ? 'منصة لوجستية حديثة لفرق سلسلة التوريد المتطورة.'
      : 'The modern logistics platform for forward-thinking supply chain teams.',
    product: language === 'ar' ? 'المنتج' : 'Product',
    company: language === 'ar' ? 'الشركة' : 'Company',
    resources: language === 'ar' ? 'الموارد' : 'Resources',
    contact: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
    rights: language === 'ar' ? '© 2025 ezy Logistic HUB. جميع الحقوق محفوظة.' : '© 2025 ezy Logistic HUB. All rights reserved.',
    privacy: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    terms: language === 'ar' ? 'شروط الاستخدام' : 'Terms of Service',
    cookies: language === 'ar' ? 'إعدادات الكوكيز' : 'Cookie Settings',
  };

  const productLinks = language === 'ar'
    ? [
        { label: 'الميزات', href: '#features' },
        { label: 'الأسعار', href: '#pricing' },
        { label: 'لوحة القيادة', to: '/saas/dashboard' },
        { label: 'إدارة الشحنات', to: '/saas/shipments' },
      ]
    : [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Dashboard', to: '/saas/dashboard' },
        { label: 'Shipment Tracking', to: '/saas/shipments' },
      ];

  const companyLinks = language === 'ar'
    ? [
        { label: 'من نحن', href: '#' },
        { label: 'المدونة', href: '#' },
        { label: 'الوظائف', href: '#' },
      ]
    : [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
      ];

  const resourceLinks = language === 'ar'
    ? [
        { label: 'الأسئلة الشائعة', href: '#faq' },
        { label: 'أدوات التدريب', to: '/tools' },
        { label: 'المساعد الذكي', to: '/logistics-assistant' },
      ]
    : [
        { label: 'FAQ', href: '#faq' },
        { label: 'Training Tools', to: '/tools' },
        { label: 'AI Assistant', to: '/logistics-assistant' },
      ];

  const renderLink = (link: { label: string; href?: string; to?: string }) => {
    if (link.to) {
      return (
        <Link to={link.to} className="text-muted-foreground hover:text-primary transition-colors">
          {link.label}
        </Link>
      );
    }
    return (
      <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
        {link.label}
      </a>
    );
  };

  return (
    <footer className="bg-hero border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent-gradient rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">{t.brand}</span>
            </div>
            <p className="text-primary-foreground/60 mb-6 max-w-xs">{t.tagline}</p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@logipro-hub.com</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <Phone className="w-4 h-4" />
                <span>+966 50 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="w-5 h-5 text-primary-foreground/70" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Linkedin className="w-5 h-5 text-primary-foreground/70" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Github className="w-5 h-5 text-primary-foreground/70" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t.product}</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t.company}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t.resources}</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">{t.rights}</p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/50">
            <a href="#" className="hover:text-primary transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.terms}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
