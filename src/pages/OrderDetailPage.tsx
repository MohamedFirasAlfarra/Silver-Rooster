import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useOrder } from '../hooks/useOrders';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon, MapPinIcon, PackageIcon, CalendarIcon, CreditCardIcon, TruckIcon, StoreIcon } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslation(language);
  
  const { data: order, isLoading } = useOrder(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === 'ar' ? 'الطلب غير موجود' : 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/orders')}
          variant="ghost"
          className="mb-6 bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          {language === 'ar' ? (
            <>
              <ArrowRightIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('backToOrders')}
            </>
          ) : (
            <>
              <ArrowLeftIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('backToOrders')}
            </>
          )}
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              {t('orderDetails')}
            </h1>
            <p className="text-muted-foreground font-mono">#{order.id}</p>
          </div>
          <div className="text-end">
            <span className={`px-4 py-2 rounded-full text-sm font-medium inline-block mb-2
              ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'}`}>
              {t(`status_${order.status}` as any)}
            </span>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Delivery Info */}
          <Card className="p-6 bg-card text-card-foreground border-border md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {order.delivery_type === 'delivery' ? (
                <TruckIcon className="w-5 h-5 text-primary" />
              ) : (
                <StoreIcon className="w-5 h-5 text-primary" />
              )}
              {t('deliveryInfo')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">{t('deliveryType')}:</span>
                <span className="col-span-2 font-medium">
                  {order.delivery_type === 'delivery' ? t('delivery') : t('pickup')}
                </span>
              </div>
              {order.delivery_type === 'delivery' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-muted-foreground">{t('governorate')}:</span>
                    <span className="col-span-2 font-medium">{order.governorate}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-muted-foreground">{t('deliveryAddress')}:</span>
                    <span className="col-span-2 font-medium">{order.delivery_address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-muted-foreground">{t('deliveryLocation')}:</span>
                    <span className="col-span-2 font-medium">{order.delivery_location}</span>
                  </div>
                </>
              )}
              {order.notes && (
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">{t('orderNotes')}:</span>
                  <span className="col-span-2 font-medium">{order.notes}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-primary" />
              {t('orderSummary')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('items')} ({order.order_items?.length})</span>
                <span>{(order.total_amount - (order.delivery_cost || 0)).toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('deliveryCost')}</span>
                <span className="text-green-600">
                  {order.delivery_cost > 0 
                    ? `${order.delivery_cost.toLocaleString()} ${language === 'ar' ? 'ل.س' : 'SAR'}`
                    : (language === 'ar' ? 'مجاني' : 'Free')}
                </span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total')}</span>
                  <span className="text-primary">{order.total_amount.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="bg-card text-card-foreground border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-primary" />
              {t('items')}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {order.order_items?.map((item) => (
              <div key={item.id} className="p-6 flex items-center gap-4">
                <img 
                  src={item.product?.image_url} 
                  alt={language === 'ar' ? item.product?.name_ar : item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg bg-muted"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {language === 'ar' ? item.product?.name_ar : item.product?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? item.product?.category_ar : item.product?.category}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="bg-muted px-2 py-1 rounded">
                      {item.quantity} x {item.price_at_purchase.toLocaleString()}
                    </span>
                    <span className="font-bold text-primary">
                      {(item.quantity * item.price_at_purchase).toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
