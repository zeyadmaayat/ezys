import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
