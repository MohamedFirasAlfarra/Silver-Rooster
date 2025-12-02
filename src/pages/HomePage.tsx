import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useAuthStore } from '../stores/useAuthStore';
import { HeroSlider } from '../components/HeroSlider';
import { CardGrid } from '../components/CardGrid';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  SparklesIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  ClockIcon, 
  StoreIcon, 
  MessageSquareIcon, 
  MapPinIcon,
  AlertCircleIcon,
  XCircleIcon,
  PackageIcon,
  PackageCheckIcon,
  Loader2Icon
} from 'lucide-react';
import Footer from '../components/Footer';

export const HomePage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { user } = useAuthStore();
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders(user?.id);
  const [refreshingOrder, setRefreshingOrder] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const featuredProducts = products?.slice(0, 4) || [];
  const recentProducts = products?.slice(4, 8) || [];

  // Get the latest order (any status except delivered/cancelled for a while)
  const latestActiveOrder = orders?.[0];

  // Function to get status display
  const getStatusInfo = (status: string) => {
    const statuses: any = {
      pending: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: <ClockIcon className="w-4 h-4" />,
        text: language === 'ar' ? 'بانتظار التأكيد' : 'Awaiting Confirmation',
        progress: 25,
        message: language === 'ar' 
          ? 'طلبك قيد المراجعة من قبل الإدارة'
          : 'Your order is under review by management'
      },
      processing: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        icon: <PackageIcon className="w-4 h-4" />,
        text: language === 'ar' ? 'قيد التجهيز' : 'Being Processed',
        progress: 50,
        message: language === 'ar' 
          ? 'طلبك قيد التجهيز والتعبئة'
          : 'Your order is being processed and packed'
      },
      shipped: {
        color: 'text-purple-600',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        icon: <TruckIcon className="w-4 h-4" />,
        text: language === 'ar' ? 'قيد الشحن' : 'Shipped',
        progress: 75,
        message: language === 'ar' 
          ? 'طلبك في الطريق إليك'
          : 'Your order is on its way to you'
      },
      delivered: {
        color: 'text-green-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        icon: <PackageCheckIcon className="w-4 h-4" />,
        text: language === 'ar' ? 'تم التسليم' : 'Delivered',
        progress: 100,
        message: language === 'ar' 
          ? 'تم تسليم طلبك بنجاح'
          : 'Your order has been delivered successfully'
      },
      cancelled: {
        color: 'text-red-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: <XCircleIcon className="w-4 h-4" />,
        text: language === 'ar' ? 'ملغي' : 'Cancelled',
        progress: 0,
        message: language === 'ar' 
          ? 'تم إلغاء طلبك'
          : 'Your order has been cancelled'
      }
    };
    
    return statuses[status] || statuses.pending;
  };

  const handleRefreshOrder = async () => {
    setRefreshingOrder(true);
    await refetch();
    setTimeout(() => setRefreshingOrder(false), 1000);
  };

  const shouldShowOrderNotification = latestActiveOrder && 
    (latestActiveOrder.status === 'pending' || 
     latestActiveOrder.status === 'processing' || 
     latestActiveOrder.status === 'shipped' ||
     (latestActiveOrder.status === 'cancelled' && 
      new Date(latestActiveOrder.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000) ||
     (latestActiveOrder.status === 'delivered' && 
      new Date(latestActiveOrder.created_at).getTime() > Date.now() - 48 * 60 * 60 * 1000));

  return (
    <div className="transition-page">
      {/* Order Status Notification */}
      {shouldShowOrderNotification && (
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Card className="p-6 border-none shadow-lg bg-card rounded-xl overflow-hidden relative">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <MapPinIcon className="w-5 h-5 text-primary" />
                  <span>{latestActiveOrder.delivery_type === 'delivery' ? (language === 'ar' ? 'توصيل للمنزل' : 'Home Delivery') : (language === 'ar' ? 'استلام من المتجر' : 'Store Pickup')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground font-bold">#{latestActiveOrder.id.slice(-8)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRefreshOrder}
                    disabled={refreshingOrder}
                  >
                    {refreshingOrder ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-lg">🔄</span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-foreground">
                  {language === 'ar' ? 'حالة طلبك' : 'Your Order Status'}
                </h3>
                
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${
                  getStatusInfo(latestActiveOrder.status).bgColor
                } ${getStatusInfo(latestActiveOrder.status).color} ${
                  getStatusInfo(latestActiveOrder.status).borderColor
                }`}>
                  {getStatusInfo(latestActiveOrder.status).icon}
                  {getStatusInfo(latestActiveOrder.status).text}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{language === 'ar' ? 'تم الطلب' : 'Ordered'}</span>
                  <span>{getStatusInfo(latestActiveOrder.status).progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      latestActiveOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-primary'
                    }`}
                    style={{ width: `${getStatusInfo(latestActiveOrder.status).progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{language === 'ar' ? 'انتظار' : 'Waiting'}</span>
                  <span>{language === 'ar' ? 'تجهيز' : 'Processing'}</span>
                  <span>{language === 'ar' ? 'شحن' : 'Shipping'}</span>
                  <span>{language === 'ar' ? 'تسليم' : 'Delivery'}</span>
                </div>
              </div>

              {/* Status Message with Icon */}
              <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
                latestActiveOrder.status === 'cancelled' 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : latestActiveOrder.status === 'delivered'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                {latestActiveOrder.status === 'cancelled' ? (
                  <AlertCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                ) : latestActiveOrder.status === 'delivered' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {getStatusInfo(latestActiveOrder.status).message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'تم الطلب في ' 
                      : 'Order placed on '}
                    {new Date(latestActiveOrder.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                  <p className="text-lg font-bold text-primary">
                    {latestActiveOrder.total_amount.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                  <p className="text-sm font-medium text-foreground">
                    {latestActiveOrder.governorate}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 border-t border-border pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 text-foreground hover:text-primary hover:bg-transparent font-medium"
                  onClick={() => navigate(`/orders/${latestActiveOrder.id}`)}
                >
                  {language === 'ar' ? 'عرض تفاصيل الطلب' : 'View Order Details'}
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button 
                  variant="ghost" 
                  className="flex-1 text-foreground hover:text-primary hover:bg-transparent font-medium gap-2"
                  onClick={() => navigate('/contact')}
                >
                  {language === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'}
                  <MessageSquareIcon className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Hero Slider */}
      <HeroSlider />

      {/* About Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {t('aboutTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('aboutSubtitle')}
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

            <Footer />

    </div>
  );
};