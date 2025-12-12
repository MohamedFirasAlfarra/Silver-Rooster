import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Toast } from '../components/Toast';
import { LogInIcon, EyeIcon, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppStore();
  const { setUser, setGuestMode } = useAuthStore();
  const t = useTranslation(language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'success' as 'success' | 'error',
  });

  // تحقق إذا كان المستخدم مسجل دخول بالفعل
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('لم يتم العثور على المستخدم');
      }

      // جلب بيانات الملف الشخصي
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || 'user';

      // تحديث حالة المستخدم
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role,
      });

      setToast({ 
        open: true, 
        title: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login Successful',
        description: language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!',
        variant: 'success' 
      });

      // الانتقال للصفحة المناسبة
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          const from = location.state?.from || '/';
          navigate(from);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      setToast({ 
        open: true, 
        title: language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
        description: error.message || (language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'),
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuestMode = () => {
    setGuestMode(true);
    setToast({
      open: true,
      title: language === 'ar' ? 'مرحباً بك كضيف!' : 'Welcome as Guest!',
      description: language === 'ar' ? 'يمكنك تصفح المنتجات وإضافتها للسلة' : 'You can browse products and add to cart',
      variant: 'success',
    });
    setTimeout(() => navigate('/'), 800);
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
              className="mt-1"
              disabled={loading}
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
              className="mt-1"
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 me-2 animate-spin" />
                {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
              </>
            ) : (
              <>
                <LogInIcon className="w-5 h-5 me-2" />
                {t('login')}
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleGuestMode}
            variant="outline"
            className="w-full h-12"
            disabled={loading}
          >
            <EyeIcon className="w-5 h-5 me-2" /> 
            {t('continueAsGuest')}
          </Button>

          <div className="text-center pt-4 border-t border-border">
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
        description={toast.description}
        variant={toast.variant}
      />
    </div>
  );
};