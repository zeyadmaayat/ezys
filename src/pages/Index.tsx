import MainLayout from '@/components/MainLayout';
import Seo from '@/components/Seo';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <MainLayout>
      <Seo
        title="ezy Logistic HUB — Simple Logistics Management"
        description="All-in-one bilingual platform to manage shipments, orders, inventory, invoices, and warehouses. Free plan available."
        path="/"
      />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
