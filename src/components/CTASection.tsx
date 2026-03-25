import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { language, isRTL } = useLanguage();

  const benefits = language === 'ar' 
    ? ["تجربة مجانية 14 يوماً", "لا حاجة لبطاقة ائتمان", "إلغاء في أي وقت"]
    : ["14-day free trial", "No credit card required", "Cancel anytime"];

  const t = {
    title1: language === 'ar' ? 'هل أنت مستعد لتحويل' : 'Ready to Transform Your',
    titleHighlight: language === 'ar' ? 'عملياتك اللوجستية؟' : 'Logistics Operations?',
    subtitle: language === 'ar'
      ? 'انضم إلى آلاف الشركات التي تستخدم منصتنا لتبسيط سلسلة التوريد وزيادة الكفاءة.'
      : 'Join thousands of companies already using ezy Logistic HUB to simplify their logistics.',
    startTrial: language === 'ar' ? 'ابدأ تجربتك المجانية' : 'Start Your Free Trial',
    scheduleDemo: language === 'ar' ? 'جدولة عرض توضيحي' : 'Schedule a Demo',
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative bg-hero rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 px-6 py-16 lg:px-16 lg:py-24 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6 max-w-3xl mx-auto">
              {t.title1}{" "}
              <span className="text-gradient">{t.titleHighlight}</span>
            </h2>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
              {t.subtitle}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-primary-foreground/80">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/saas/dashboard">
                  {t.startTrial}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/logistics-assistant">
                  {t.scheduleDemo}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
