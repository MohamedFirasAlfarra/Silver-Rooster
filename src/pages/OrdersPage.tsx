import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useOrders } from '../hooks/useOrders';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PackageIcon, CalendarIcon, ArrowLeftIcon, ArrowRightIcon, ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslation(language);
  
  const { data: orders, isLoading } = useOrders(user?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <PackageIcon className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <PackageIcon className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('myOrders')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? `لديك ${orders?.length || 0} طلبات سابقة`
                : `You have ${orders?.length || 0} previous orders`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="p-6 bg-card text-card-foreground border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {t(`status_${order.status}` as any)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4 me-2" />
                      {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-end">
                      <p className="text-sm text-muted-foreground">{t('total')}</p>
                      <p className="text-xl font-bold text-primary">
                        {order.total_amount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ل.س' : 'SAR'}
                      </p>
                    </div>
                    {language === 'ar' ? (
                      <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ArrowRightIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageIcon className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t('noOrders')}
            </h2>
            <Button
              onClick={() => navigate('/products')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
            >
              {t('startShopping')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
