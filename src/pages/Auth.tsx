import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Eye, EyeOff, Mail, ArrowRight, Truck, BarChart3, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

const Auth = () => {
  const { t, isRTL } = useLanguage();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  if (user) {
    navigate('/saas/dashboard');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    try { emailSchema.parse(email); } catch { newErrors.email = t('invalidEmail'); }
    try { passwordSchema.parse(password); } catch { newErrors.password = t('passwordTooShort'); }
    if (!isLogin && password !== confirmPassword) newErrors.confirmPassword = t('passwordMismatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) setGeneralError(result.error);
        else navigate('/saas/dashboard');
      } else {
        const result = await signUp(email, password, displayName);
        if (result.error) setGeneralError(result.error);
        else {
          try {
            await supabase.functions.invoke('notify-new-signup', {
              body: { email, displayName: displayName || email.split('@')[0] },
            });
          } catch (e) { console.error('Failed to send signup notification:', e); }
          navigate('/saas/dashboard');
        }
      }
    } finally { setLoading(false); }
  };

  const handleMagicLink = async () => {
    if (!email) { setErrors({ email: t('invalidEmail') }); return; }
    try { emailSchema.parse(email); } catch { setErrors({ email: t('invalidEmail') }); return; }
    setMagicLinkLoading(true);
    setGeneralError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/saas/dashboard` },
      });
      if (error) setGeneralError(error.message);
      else {
        setMagicLinkSent(true);
        toast({ title: 'تم إرسال رابط الدخول', description: 'تفقد بريدك الإلكتروني للدخول بدون كلمة مرور' });
      }
    } finally { setMagicLinkLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setErrors({ email: t('invalidEmail') }); return; }
    try { emailSchema.parse(email); } catch { setErrors({ email: t('invalidEmail') }); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setGeneralError(error.message);
    else {
      toast({ title: t('resetLinkSent') });
      setShowForgotPassword(false);
    }
  };

  const features = [
    { icon: Truck, label: isRTL ? 'إدارة الشحنات' : 'Shipment Management' },
    { icon: BarChart3, label: isRTL ? 'تقارير وتحليلات' : 'Reports & Analytics' },
    { icon: Shield, label: isRTL ? 'أمان متقدم' : 'Advanced Security' },
  ];

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full bg-[hsl(var(--orange)/0.3)] blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[hsl(var(--primary)/0.2)] blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
              <Package className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">LogiPro Hub</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            {isRTL ? 'منصتك المتكاملة لإدارة اللوجستيات' : 'Your All-in-One Logistics Platform'}
          </h1>
          <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-md">
            {isRTL
              ? 'أدر شحناتك، مخازنك، ومواردك المالية من مكان واحد بكفاءة وسهولة.'
              : 'Manage shipments, warehouses, and finances from one powerful platform.'}
          </p>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">LogiPro Hub</span>
          </div>

          {/* Forgot Password View */}
          {showForgotPassword ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('resetPassword')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isRTL ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين' : 'Enter your email and we\'ll send you a reset link'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                  dir="ltr"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              {generalError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{generalError}</div>
              )}
              <Button onClick={handleForgotPassword} className="w-full bg-[hsl(var(--orange))] hover:bg-[hsl(var(--orange-light))] text-white" disabled={loading}>
                {loading ? t('loading') : t('sendResetLink')}
              </Button>
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setErrors({}); setGeneralError(null); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
              >
                <ArrowRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex mb-8 bg-muted/30 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrors({}); setGeneralError(null); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    isLogin
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setErrors({}); setGeneralError(null); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    !isLogin
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('signUp')}
                </button>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {isLogin ? t('welcomeBack') : t('createAccount')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isLogin ? t('enterCredentials') : t('fillDetails')}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-sm">{t('displayName')}</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                      className="h-11"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
                    dir="ltr"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm">{t('password')}</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setErrors({}); setGeneralError(null); }}
                        className="text-xs text-[hsl(var(--orange))] hover:text-[hsl(var(--orange-light))] font-medium transition-colors"
                      >
                        {t('forgotPassword')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`h-11 ${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? 'border-destructive' : ''}`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm">{t('confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`h-11 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      dir="ltr"
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                {generalError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{generalError}</div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-[hsl(var(--orange))] hover:bg-[hsl(var(--orange-light))] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? t('loading') : (isLogin ? t('login') : t('signUp'))}
                </Button>

                {isLogin && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-3 text-muted-foreground">
                          {isRTL ? 'أو' : 'or'}
                        </span>
                      </div>
                    </div>

                    {magicLinkSent ? (
                      <div className="bg-primary/10 text-primary text-sm p-4 rounded-xl text-center">
                        <Mail className="w-6 h-6 mx-auto mb-2 opacity-70" />
                        {isRTL ? 'تم إرسال رابط الدخول إلى بريدك الإلكتروني' : 'Login link sent to your email'}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={handleMagicLink}
                        disabled={magicLinkLoading}
                      >
                        <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {magicLinkLoading ? t('loading') : (isRTL ? 'دخول بدون كلمة مرور' : 'Sign in with Magic Link')}
                      </Button>
                    )}
                  </>
                )}
              </form>
            </>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            {isRTL
              ? 'بتسجيل الدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
              : 'By signing in, you agree to our Terms of Service and Privacy Policy'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
