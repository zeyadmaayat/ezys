import MainLayout from '@/components/MainLayout';
import { LogisticsChat } from '@/components/logistics/LogisticsChat';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LogisticsAssistant() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-140px)]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="h-full bg-card rounded-xl border shadow-sm overflow-hidden">
          <LogisticsChat />
        </div>
      </div>
    </MainLayout>
  );
}
