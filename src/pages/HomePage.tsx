import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { useProducts } from '../hooks/useProducts';
import { HeroSlider } from '../components/HeroSlider';
import { CardGrid } from '../components/CardGrid';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowRightIcon, ArrowLeftIcon, SparklesIcon, TrendingUpIcon, CheckCircleIcon, TruckIcon, ShieldCheckIcon, HeartIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const featuredProducts = products?.slice(0, 4) || [];
  const recentProducts = products?.slice(4, 8) || [];

  return (
    <div className="transition-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* About Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نحن نقدم أفضل منتجات الدجاج بجودة عالية وأسعار تنافسية'
                : 'We offer the best chicken products with high quality and competitive prices'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ar' ? 'جودة مضمونة' : 'Quality Guaranteed'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'منتجات طازجة وعالية الجودة من مزارع موثوقة'
                  : 'Fresh and high-quality products from trusted farms'}
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TruckIcon className="w-8 h-8 text-tertiary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'توصيل سريع وآمن إلى باب منزلك'
                  : 'Fast and safe delivery to your doorstep'}
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 text-secondary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ar' ? 'دفع آمن' : 'Secure Payment'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'طرق دفع آمنة ومتعددة لراحتك'
                  : 'Safe and multiple payment methods for your convenience'}
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartIcon className="w-8 h-8 text-red-500" strokeWidth={2} fill="currentColor" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'نسعى دائماً لإرضاء عملائنا الكرام'
                  : 'We always strive to satisfy our valued customers'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {t('featuredChickens')}
              </h2>
            </div>
            <Button
              onClick={() => navigate('/products')}
              variant="ghost"
              className="bg-transparent text-primary hover:bg-muted hover:text-primary font-normal"
            >
              {t('viewAll')}
              {language === 'ar' ? (
                <ArrowLeftIcon className="w-4 h-4 ms-2" strokeWidth={2} />
              ) : (
                <ArrowRightIcon className="w-4 h-4 ms-2" strokeWidth={2} />
              )}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : featuredProducts.length > 0 ? (
            <CardGrid products={featuredProducts} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t('noProducts')}
            </div>
          )}
        </div>
      </section>

      {/* Recently Listed */}
      {recentProducts.length > 0 && (
        <section className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary/10 rounded-full flex items-center justify-center">
                  <TrendingUpIcon className="w-5 h-5 text-tertiary" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  {t('recentlyListed')}
                </h2>
              </div>
              <Button
                onClick={() => navigate('/products')}
                variant="ghost"
                className="bg-transparent text-primary hover:bg-muted hover:text-primary font-normal"
              >
                {t('viewAll')}
                {language === 'ar' ? (
                  <ArrowLeftIcon className="w-4 h-4 ms-2" strokeWidth={2} />
                ) : (
                  <ArrowRightIcon className="w-4 h-4 ms-2" strokeWidth={2} />
                )}
              </Button>
            </div>
            <CardGrid products={recentProducts} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-1 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {language === 'ar' ? 'جاهز للطلب؟' : 'Ready to Order?'}
          </h2>
          <p className="text-lg text-white/90 mb-8">
            {language === 'ar' 
              ? 'اطلب الآن واستمتع بأفضل منتجات الدجاج الطازجة'
              : 'Order now and enjoy the best fresh chicken products'}
          </p>
          <Button
            onClick={() => navigate('/products')}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-normal text-lg px-8 py-6 shadow-xl"
          >
            {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            {language === 'ar' ? (
              <ArrowLeftIcon className="w-5 h-5 ms-2" strokeWidth={2} />
            ) : (
              <ArrowRightIcon className="w-5 h-5 ms-2" strokeWidth={2} />
            )}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'عن الديك الفضي' : 'About Silver Rooster'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ar' 
                  ? 'نحن نقدم أفضل منتجات الدجاج الطازجة من مزارع موثوقة'
                  : 'We offer the best fresh chicken products from trusted farms'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    {language === 'ar' ? 'من نحن' : 'About Us'}
                  </a>
                </li>
                <li>
                  <a href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                    {language === 'ar' ? 'المنتجات' : 'Products'}
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{language === 'ar' ? 'البريد:' : 'Email:'} info@silverrooster.com</li>
                <li>{language === 'ar' ? 'الهاتف:' : 'Phone:'} +966 50 123 4567</li>
                <li>{language === 'ar' ? 'العنوان:' : 'Address:'} {language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'تابعنا' : 'Follow Us'}
              </h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <span className="text-lg">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
