import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Eye, EyeOff, Mail } from 'lucide-react';
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
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    navigate('/saas/dashboard');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch {
      newErrors.email = t('invalidEmail');
    }
    
    try {
      passwordSchema.parse(password);
    } catch {
      newErrors.password = t('passwordTooShort');
    }
    
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }
    
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
        if (result.error) {
          setGeneralError(result.error);
        } else {
          navigate('/saas/dashboard');
        }
      } else {
        const result = await signUp(email, password, displayName);
        if (result.error) {
          setGeneralError(result.error);
        } else {
          // Send notification email to admin
          try {
            await supabase.functions.invoke('notify-new-signup', {
              body: { email, displayName: displayName || email.split('@')[0] },
            });
          } catch (e) {
            console.error('Failed to send signup notification:', e);
          }
          navigate('/saas/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-accent-gradient rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-accent-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">LogiPro Hub</span>
        </div>

        <Card className="border-border shadow-lg">
          {/* Auth Mode Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
                setGeneralError(null);
              }}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                isLogin 
                  ? 'text-accent border-b-2 border-accent bg-accent/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
                setGeneralError(null);
              }}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                !isLogin 
                  ? 'text-accent border-b-2 border-accent bg-accent/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('signUp')}
            </button>
          </div>
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </CardTitle>
            <CardDescription>
              {isLogin ? t('enterCredentials') : t('fillDetails')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('displayName')}</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('displayName')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className={errors.email ? 'border-destructive' : ''}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password')}
                    className={`${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? 'border-destructive' : ''}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    dir="ltr"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
              
              {generalError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {generalError}
                </div>
              )}
              
              <Button
                type="submit"
                variant="accent"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('loading') : (isLogin ? t('login') : t('signUp'))}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
