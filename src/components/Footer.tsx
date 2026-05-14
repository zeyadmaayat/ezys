import { Linkedin, Twitter, Github, Mail, Phone, MapPin } from "lucide-react";
import EzyLogo from "@/components/EzyLogo";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();

  const t = {
    brand: 'ezy Logistic HUB',
    tagline: language === 'ar'
      ? 'منصة لوجستية بسيطة وذكية لإدارة سلسلة التوريد.'
      : 'Simple, smart logistics platform for modern supply chains.',
    product: language === 'ar' ? 'المنتج' : 'Product',
    company: language === 'ar' ? 'الشركة' : 'Company',
    resources: language === 'ar' ? 'الموارد' : 'Resources',
    rights: language === 'ar' ? '© 2025 ezy Logistic HUB. جميع الحقوق محفوظة. — صُمِّم وطُوِّر بواسطة ZEYAD' : '© 2025 ezy Logistic HUB. All rights reserved. — Designed & built by ZEYAD',
    privacy: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy',
    terms: language === 'ar' ? 'شروط الاستخدام' : 'Terms',
  };

  const productLinks = language === 'ar'
    ? [
        { label: 'الميزات', href: '#features' },
        { label: 'الأسعار', href: '#pricing' },
        { label: 'لوحة القيادة', to: '/saas/dashboard' },
        { label: 'الشحنات', to: '/saas/shipments' },
      ]
    : [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Dashboard', to: '/saas/dashboard' },
        { label: 'Shipments', to: '/saas/shipments' },
      ];

  const companyLinks = language === 'ar'
    ? [{ label: 'من نحن', href: '#' }, { label: 'المدونة', href: '#' }]
    : [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }];

  const resourceLinks = language === 'ar'
    ? [{ label: 'الأسئلة الشائعة', href: '#faq' }, { label: 'أدوات التدريب', to: '/tools' }]
    : [{ label: 'FAQ', href: '#faq' }, { label: 'Training Tools', to: '/tools' }];

  const renderLink = (link: { label: string; href?: string; to?: string }) => {
    if (link.to) {
      return <Link to={link.to} className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors text-sm">{link.label}</Link>;
    }
    return <a href={link.href} className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors text-sm">{link.label}</a>;
  };

  return (
    <footer className="bg-hero border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <EzyLogo size="sm" className="[&_span]:!text-primary-foreground [&_div]:!text-primary-foreground/70" />
            </div>
            <p className="text-primary-foreground/50 mb-5 max-w-xs text-sm">{t.tagline}</p>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-primary-foreground/40 text-xs">
                <Mail className="w-3.5 h-3.5" /><span>info@ezylogistic.com</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/40 text-xs">
                <Phone className="w-3.5 h-3.5" /><span>+966 50 000 0000</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/40 text-xs">
                <MapPin className="w-3.5 h-3.5" /><span>{language === 'ar' ? 'عمان' : 'Amman, JO'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-primary-foreground/5 rounded-lg flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
                  <Icon className="w-4 h-4 text-primary-foreground/40" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground/80 mb-3 text-sm">{t.product}</h4>
            <ul className="space-y-2">{productLinks.map(l => <li key={l.label}>{renderLink(l)}</li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground/80 mb-3 text-sm">{t.company}</h4>
            <ul className="space-y-2">{companyLinks.map(l => <li key={l.label}>{renderLink(l)}</li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground/80 mb-3 text-sm">{t.resources}</h4>
            <ul className="space-y-2">{resourceLinks.map(l => <li key={l.label}>{renderLink(l)}</li>)}</ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-primary-foreground/30 text-xs">{t.rights}</p>
          <div className="flex items-center gap-4 text-xs text-primary-foreground/30">
            <a href="#" className="hover:text-primary-foreground/50 transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-primary-foreground/50 transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
