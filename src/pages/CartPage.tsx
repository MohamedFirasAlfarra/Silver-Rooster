import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(language);
  
  const { data: cartItems, isLoading: cartLoading } = useCart(user?.id);
  const { data: allProducts, isLoading: productsLoading } = useProducts();
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();

  const { isGuest } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  if (!user) {
    return null;
  }

  const isLoading = cartLoading || productsLoading;

  const cartWithProducts = cartItems?.map(item => {
    const product = allProducts?.find(p => p.id === item.product_id);
    return { ...item, product };
  }).filter(item => item.product) || [];

  const total = cartWithProducts.reduce((sum, item) => {
    return sum + (item.product!.price * item.quantity);
  }, 0);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity.mutateAsync({ userId: user.id, cartItemId, quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart.mutateAsync({ userId: user.id, cartItemId });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCartIcon className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('cart')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? `${cartWithProducts.length} منتج في السلة`
                : `${cartWithProducts.length} items in cart`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : cartWithProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartWithProducts.map((item) => {
                const product = item.product!;
                const name = language === 'ar' ? product.name_ar : product.name;
                const category = language === 'ar' ? product.category_ar : product.category;
                
                return (
                  <Card key={item.id} className="p-4 bg-card text-card-foreground border-border">
                    <div className="flex gap-4">
                      <img
                        src={product.image_url}
                        alt={name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {category}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {product.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ر.س' : 'SAR'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          onClick={() => handleRemove(item.id)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="w-4 h-4" strokeWidth={2} />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" strokeWidth={2} />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <PlusIcon className="w-4 h-4" strokeWidth={2} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card text-card-foreground border-border sticky top-20">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{total.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                    <span>{language === 'ar' ? 'مجاني' : 'Free'}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>{t('total')}</span>
                      <span className="text-primary">{total.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-normal mb-3"
                  size="lg"
                >
                  {t('checkout')}
                </Button>
                
                <Button
                  onClick={() => navigate('/products')}
                  variant="outline"
                  className="w-full bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  size="lg"
                >
                  {t('continueShopping')}
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCartIcon className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t('emptyCart')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'ar' 
                ? 'ابدأ بإضافة المنتجات إلى سلة التسوق'
                : 'Start adding products to your shopping cart'}
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
            >
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              {language === 'ar' ? (
                <ArrowLeftIcon className="w-4 h-4 ms-2" strokeWidth={2} />
              ) : (
                <ArrowRightIcon className="w-4 h-4 ms-2" strokeWidth={2} />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
