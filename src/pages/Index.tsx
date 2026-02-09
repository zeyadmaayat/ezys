import MainLayout from '@/components/MainLayout';
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
