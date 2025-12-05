import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';
import { 
  UserPlusIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  MailIcon,
  PhoneIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { setUser, setGuestMode } = useAuthStore();
  const t = useTranslation(language);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'success' as 'success' | 'error',
  });

  // التحقق من البريد
  const validateEmail = (email: string) => {
    // السماح بـ Gmail أو أي بريد آخر
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // التحقق من الهاتف - تم إلغاء التحقق من البداية +963
  const validatePhone = (phone: string) => {
    // فقط التحقق من أن الرقم يحتوي على أرقام ويحتوي على 10 أرقام على الأقل
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  // التحقق من كلمة المرور
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // التحقق من النموذج
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = language === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required';
    if (!age || +age < 1 || +age > 120) newErrors.age = language === 'ar' ? 'الرجاء إدخال عمر صحيح' : 'Please enter a valid age';
    if (!validatePhone(phone)) newErrors.phone = language === 'ar' ? 'رقم الهاتف غير صحيح (يجب أن يحتوي على 10 أرقام على الأقل)' : 'Invalid phone number (must contain at least 10 digits)';
    if (!address.trim()) newErrors.address = language === 'ar' ? 'العنوان مطلوب' : 'Address is required';
    if (!validateEmail(email)) newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    if (!validatePassword(password)) newErrors.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالجة تغيير رقم الهاتف - إضافة +963 تلقائياً
  const handlePhoneChange = (value: string) => {
    // إذا كان الحقل فارغاً أو المستخدم يحذف كل شيء
    if (value === '') {
      setPhone('+963');
      return;
    }

    // إذا بدأ المستخدم بكتابة رقم ولم يبدأ بـ +963، نضيفها تلقائياً
    if (!value.startsWith('+') && value.length > 0) {
      // إذا كان المستخدم يدخل أرقاماً فقط، نضيف +963 في البداية
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 9) { // 9 لأننا سنضيف +963 في المقدمة
        setPhone('+963' + digitsOnly);
      } else {
        // إذا كان الرقم يحتوي على أكثر من 9 أرقام، نعتبر أن المستخدم أدخل رقم كامل
        setPhone('+' + digitsOnly);
      }
    } else {
      // إذا بدأ بـ + أو يحتوي على +963 بالفعل، نتركه كما هو
      setPhone(value);
    }
    
    // إزالة خطأ الهاتف عند البدء بالكتابة
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  // عند التركيز على حقل الهاتف، نضيف +963 إذا كان فارغاً
  const handlePhoneFocus = () => {
    if (!phone || phone.trim() === '') {
      setPhone('+963');
    }
  };

  // عند فقدان التركيز، نتأكد من وجود +963 في البداية
  const handlePhoneBlur = () => {
    if (phone && phone.trim() !== '' && !phone.startsWith('+')) {
      // إذا لم يبدأ بـ +، نضيف +963
      const digitsOnly = phone.replace(/\D/g, '');
      setPhone('+963' + digitsOnly);
    }
  };

  // معالجة التسجيل
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('🚀 محاولة إنشاء حساب...');
      console.log('📧 البريد:', email);
      console.log('📱 الهاتف:', phone);

      // إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            age: +age,
            phone: phone,
            address: address
          }
        }
      });

      if (authError) {
        console.error('❌ خطأ في إنشاء الحساب:', authError);
        
        // تحسين رسائل الخطأ
        let errorMessage = authError.message;
        if (authError.message.includes('already registered')) {
          errorMessage = language === 'ar' 
            ? 'هذا البريد الإلكتروني مسجل مسبقاً' 
            : 'This email is already registered';
        } else if (authError.message.includes('CORS')) {
          errorMessage = language === 'ar'
            ? 'مشكلة في الاتصال بالخادم. يرجى المحاولة لاحقاً'
            : 'Connection issue with server. Please try again later';
        }
        
        throw new Error(errorMessage);
      }

      const user = authData.user;
      if (!user) {
        throw new Error(language === 'ar' ? 'فشل إنشاء الحساب' : 'Account creation failed');
      }

      console.log('✅ تم إنشاء حساب:', user.id);

      // تحديث البروفايل
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          age: +age,
          phone: phone,
          address: address
        })
        .eq('id', user.id);

      if (profileError) {
        console.warn('⚠️ لم يتم تحديث البروفايل:', profileError);
        // لا نوقف العملية إذا حدث خطأ في تحديث البروفايل
      }

      // تسجيل الدخول تلقائياً
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        // الحصول على بيانات المستخدم
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUser({
          id: user.id,
          email: user.email || '',
          role: profile?.role || 'user',
          full_name: fullName,
          phone: phone,
          address: address
        });

        setToast({
          open: true,
          title: language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!',
          description: language === 'ar' 
            ? 'مرحباً بك في الديك الفضي' 
            : 'Welcome to Silver Rooster',
          variant: 'success',
        });

        setTimeout(() => navigate('/'), 1500);
      } else {
        setToast({
          open: true,
          title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
          description: language === 'ar'
            ? 'يرجى تسجيل الدخول الآن'
            : 'Please login now',
          variant: 'success',
        });
        
        setTimeout(() => navigate('/login'), 1500);
      }

    } catch (err: any) {
      console.error('❌ خطأ في التسجيل:', err);
      
      setToast({
        open: true,
        title: language === 'ar' ? 'خطأ في التسجيل' : 'Signup Error',
        description: err.message || (language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // وضع الضيف
  const handleGuestMode = () => {
    setGuestMode(true);
    setToast({
      open: true,
      title: language === 'ar' ? 'مرحباً بك كضيف!' : 'Welcome as Guest!',
      description: language === 'ar' 
        ? 'يمكنك تصفح المنتجات ولكن لا يمكنك الشراء'
        : 'You can browse products but cannot make purchases',
      variant: 'success',
    });
    setTimeout(() => navigate('/'), 1000);
  };

  // تهيئة رقم الهاتف بـ +963 عند تحميل المكون
  useEffect(() => {
    if (!phone) {
      setPhone('+963');
    }
  }, []);

  return (
    <div className="transition-page min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            {language === 'ar' ? 'انضم إلينا' : 'Join Us'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'أنشئ حسابك واستمتع بأفضل منتجات الدجاج الطازجة'
              : 'Create your account and enjoy the best fresh chicken products'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* النموذج */}
          <Card className="p-6 md:p-8 bg-card/95 backdrop-blur-sm text-card-foreground border-border shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <UserPlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('signup')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'املأ البيانات أدناه' : 'Fill in the details below'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* الاسم الكامل */}
              <div>
                <Label htmlFor="fullName" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder={language === 'ar' ? 'محمد أحمد' : 'Mohammed Ahmed'}
                  className={`bg-background text-foreground border-border h-11 ${errors.fullName ? 'border-destructive' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* العمر */}
                <div>
                  <Label htmlFor="age" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {language === 'ar' ? 'العمر' : 'Age'}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setErrors({ ...errors, age: '' });
                    }}
                    placeholder="25"
                    className={`bg-background text-foreground border-border h-11 ${errors.age ? 'border-destructive' : ''}`}
                  />
                  {errors.age && (
                    <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircleIcon className="w-4 h-4" />
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* الهاتف */}
                <div>
                  <Label htmlFor="phone" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    {t('mobileNumber')}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onFocus={handlePhoneFocus}
                    onBlur={handlePhoneBlur}
                    placeholder="+963 99 123 4567"
                    className={`bg-background text-foreground border-border h-11 ${errors.phone ? 'border-destructive' : ''}`}
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircleIcon className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                 
                </div>
              </div>

              {/* العنوان */}
              <div>
                <Label htmlFor="address" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  {t('address')}
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors({ ...errors, address: '' });
                  }}
                  placeholder={language === 'ar' ? 'دمشق، كفرسوسة' : 'Damascus, Kfar Souseh'}
                  className={`bg-background text-foreground border-border h-11 ${errors.address ? 'border-destructive' : ''}`}
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <Label htmlFor="email" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  placeholder="example@gmail.com"
                  className={`bg-background text-foreground border-border h-11 ${errors.email ? 'border-destructive' : ''}`}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* كلمة المرور */}
              <div>
                <Label htmlFor="password" className="text-foreground mb-2 block font-medium flex items-center gap-2">
                  <KeyIcon className="w-4 h-4" />
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    placeholder={language === 'ar' ? '********' : '********'}
                    className={`bg-background text-foreground border-border h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                <Label htmlFor="confirmPassword" className="text-foreground mb-2 block font-medium">
                  {t('confirmPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: '' });
                    }}
                    placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                    className={`bg-background text-foreground border-border h-11 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium h-12 text-base shadow-lg hover:shadow-xl transition-all mt-6"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 me-2" strokeWidth={2} />
                    {t('signup')}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
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

              <p className="text-center text-sm text-muted-foreground">
                {t('guestModeDescription')}
              </p>

              <div className="text-center pt-4">
                <p className="text-muted-foreground mb-2">
                  {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                </p>
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 transition-colors font-semibold text-lg"
                >
                  {t('login')}
                </Link>
              </div>
            </div>
          </Card>

          {/* معلومات إضافية */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-primary" />
                {language === 'ar' ? 'مزايا التسجيل' : 'Registration Benefits'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span className="text-foreground">
                    {language === 'ar' ? 'تتبع طلباتك' : 'Track your orders'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span className="text-foreground">
                    {language === 'ar' ? 'حفظ المنتجات المفضلة' : 'Save favorite products'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span className="text-foreground">
                    {language === 'ar' ? 'عروض حصرية' : 'Exclusive offers'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <span className="text-foreground">
                    {language === 'ar' ? 'توصيل أسرع' : 'Faster delivery'}
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {language === 'ar' ? 'متطلبات التسجيل' : 'Registration Requirements'}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'أي بريد إلكتروني صالح (Gmail، Yahoo، Hotmail، إلخ)'
                      : 'Any valid email address (Gmail, Yahoo, Hotmail, etc.)'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'سيتم إضافة +963 تلقائياً في البداية'
                      : '+963 will be automatically added at the beginning'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? '8 أحرف على الأقل'
                      : 'At least 8 characters'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {language === 'ar' ? 'حماية البيانات' : 'Data Protection'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'نحن نحمي بياناتك الشخصية ولا نشاركها مع أطراف ثالثة.'
                  : 'We protect your personal data and do not share it with third parties.'}
              </p>
            </Card>
          </div>
        </div>
      </div>

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