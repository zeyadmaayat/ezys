import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Shield } from 'lucide-react';

const Admin = () => {
  const { t } = useLanguage();
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 mx-auto text-destructive/50 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('accessDenied')}</h1>
          <p className="text-muted-foreground">{t('adminOnly')}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('adminPanel')}</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-2">{t('manageCategories')}</h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-2">{t('manageTopics')}</h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-2">{t('manageAbbreviations')}</h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
