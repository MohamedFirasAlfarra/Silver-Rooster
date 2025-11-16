import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabaseClient';
import { isAdminCredentials } from '../lib/adminAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Toast } from '../components/Toast';
import { LogInIcon, ShieldCheckIcon, EyeIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { setUser, setGuestMode } = useAuthStore();
  const t = useTranslation(language);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGuestMode = () => {
    setGuestMode(true);
    setToast({
      open: true,
      title: language === 'ar' ? 'مرحباً بك كضيف!' : 'Welcome as Guest!',
      variant: 'success',
    });
    setTimeout(() => navigate('/'), 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if admin credentials
      if (isAdminCredentials(email, password)) {
        setUser({
          id: 'admin-user-id',
          email: email,
          role: 'admin',
        });
        
        setToast({
          open: true,
          title: t('loginSuccess'),
          variant: 'success',
        });
        
        setTimeout(() => navigate('/admin'), 1000);
        setLoading(false);
        return;
      }

      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          role: 'user',
        });
        
        setToast({
          open: true,
          title: t('loginSuccess'),
          variant: 'success',
        });
        
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      setToast({
        open: true,
        title: t('loginError'),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transition-page min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 md:p-10 bg-card/95 backdrop-blur-sm text-card-foreground border-border shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
            <LogInIcon className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 text-center">
          {t('login')}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {language === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
        </p>
        
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-2">
                {language === 'ar' ? 'حساب المسؤول التجريبي:' : 'Demo Admin Account:'}
              </p>
              <p className="text-muted-foreground mb-1">
                <strong className="text-foreground">{language === 'ar' ? 'البريد:' : 'Email:'}</strong> admin@chickenmarket.com
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">{language === 'ar' ? 'كلمة السر:' : 'Password:'}</strong> Admin@2024!Secure
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-foreground mb-2 block font-medium">
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@gmail.com"
              className="bg-background text-foreground border-border h-12"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground mb-2 block font-medium">
              {t('password')}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-background text-foreground border-border h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium h-12 text-base shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : t('login')}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {language === 'ar' ? 'أو' : 'Or'}
              </span>
            </div>
          </div>

          <Button
            onClick={handleGuestMode}
            variant="outline"
            className="w-full bg-muted/50 text-foreground border-border hover:bg-muted hover:text-foreground font-medium h-12"
            size="lg"
          >
            <EyeIcon className="w-5 h-5 me-2" strokeWidth={2} />
            {t('continueAsGuest')}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t('guestModeDescription')}
          </p>

          <div className="text-center pt-4">
            <p className="text-muted-foreground mb-2">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
            </p>
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 transition-colors font-semibold text-lg"
            >
              {t('signup')}
            </Link>
          </div>
        </div>
      </Card>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
    </div>
  );
};
