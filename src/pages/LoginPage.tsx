import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Toast } from '../components/Toast';
import { LogInIcon, EyeIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { setUser, setGuestMode } = useAuthStore();
  const t = useTranslation(language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    title: '',
    variant: 'success' as 'success' | 'error',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("User not found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role ?? "user";

      setUser({
        id: user.id,
        email: user.email ?? "",
        role,
      });

      setToast({ open: true, title: t('loginSuccess'), variant: 'success' });

      setTimeout(() => {
        if (role === "admin") {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 800);

    } catch (_) {
      setToast({ open: true, title: t('loginError'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuestMode = () => {
    setGuestMode(true);
    setToast({
      open: true,
      title: language === 'ar' ? 'مرحباً بك كضيف!' : 'Welcome as Guest!',
      variant: 'success',
    });
    setTimeout(() => navigate('/'), 1000);
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@gmail.com"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : t('login')}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleGuestMode}
            variant="outline"
            className="w-full h-12"
          >
            <EyeIcon className="w-5 h-5 me-2" /> {t('continueAsGuest')}
          </Button>

          <div className="text-center pt-4">
            <p className="text-muted-foreground mb-2">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
            </p>
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-semibold text-lg"
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