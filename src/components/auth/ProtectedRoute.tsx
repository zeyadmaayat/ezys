import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Package } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isApproved, isAdmin, hasCompany, loading, signOut } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Always allow access to company setup page for authenticated users
  if (location.pathname === '/saas/setup') {
    return <>{children}</>;
  }

  // If user has no company, redirect to setup
  if (!hasCompany && !isAdmin) {
    return <Navigate to="/saas/setup" replace />;
  }

  // Admins always have access, non-approved users see pending screen
  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">ezy<span className="text-primary">Logistic</span></span>
            </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl">
                {t('pendingApproval') || 'Account Pending Approval'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('pendingApprovalMessage') || 'Your account has been created successfully. An administrator will review and approve your account shortly. You will be able to access the system once approved.'}
              </p>
              <Button variant="outline" className="w-full" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('signOut') || 'Sign Out'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
