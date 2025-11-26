import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useProduct } from '../hooks/useProducts';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../hooks/useFavorites';
import { useAddToCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Toast } from '../components/Toast';
import { GuestRestrictionModal } from '../components/ui/GuestRestrictionModal';
import { DeliveryModal } from '../components/DeliveryModal';
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon, PhoneIcon, MessageCircleIcon, PackageIcon, TagIcon, TruckIcon, StoreIcon } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslation(language);
  const { data: product, isLoading } = useProduct(id || '');
  const { data: favorites } = useFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddToCart();
  
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const isFavorite = favorites?.some(fav => fav.product_id === id);

  const handleFavoriteClick = async () => {
    if (isGuest || !user || !id) {
      setShowGuestModal(true);
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync({ userId: user.id, productId: id });
        setToast({
          open: true,
          title: t('favoriteRemoved'),
          variant: 'success',
        });
      } else {
        await addFavorite.mutateAsync({ userId: user.id, productId: id });
        setToast({
          open: true,
          title: t('favoriteAdded'),
          variant: 'success',
        });
      }
    } catch (error) {
      setToast({
        open: true,
        title: t('error'),
        variant: 'error',
      });
    }
  };

  const handleAddToCart = async () => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    
    if (!user || !id) {
      navigate('/login');
      return;
    }

    try {
      await addToCart.mutateAsync({ userId: user.id, productId: id, quantity: 1 });
      setToast({
        open: true,
        title: t('cartAdded'),
        variant: 'success',
      });
    } catch (error) {
      setToast({
        open: true,
        title: t('error'),
        variant: 'error',
      });
    }
  };

  const handleDirectBuy = (type: 'pickup' | 'delivery') => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    
    if (!user || !id) {
      navigate('/login');
      return;
    }

    setDeliveryType(type);
    setShowDeliveryModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
        </p>
      </div>
    );
  }

  const name = language === 'ar' ? product.name_ar : product.name;
  const category = language === 'ar' ? product.category_ar : product.category;
  const type = language === 'ar' ? product.type_ar : product.type;
  const ingredients = language === 'ar' ? product.ingredients_ar : product.ingredients;
  const description = language === 'ar' ? product.description_ar : product.description;

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/products')}
          variant="ghost"
          className="mb-6 bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          {language === 'ar' ? (
            <>
              <ArrowRightIcon className="w-4 h-4 me-2" strokeWidth={2} />
              العودة إلى المنتجات
            </>
          ) : (
            <>
              <ArrowLeftIcon className="w-4 h-4 me-2" strokeWidth={2} />
              Back to Products
            </>
          )}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div>
            <Card className="p-6 bg-card text-card-foreground border-border">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                {name}
              </h1>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('category')}
                  </p>
                  <div className="flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-primary" strokeWidth={2} />
                    <p className="text-base font-semibold text-foreground">
                      {category}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('type')}
                  </p>
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-primary" strokeWidth={2} />
                    <p className="text-base font-semibold text-foreground">
                      {type}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('quantity')}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {product.quantity} {language === 'ar' ? 'قطعة' : 'pieces'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {t('ingredients')}
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {ingredients}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ر.س' : 'SAR'}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {t('description')}
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleDirectBuy('delivery')}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-normal text-lg py-6"
                    size="lg"
                  >
                    <TruckIcon className="w-5 h-5 me-2" strokeWidth={2} />
                    {t('buyWithDelivery')}
                  </Button>
                  <Button
                    onClick={() => handleDirectBuy('pickup')}
                    variant="outline"
                    className="w-full bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal text-lg py-6"
                    size="lg"
                  >
                    <StoreIcon className="w-5 h-5 me-2" strokeWidth={2} />
                    {t('buyPickup')}
                  </Button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  variant="secondary"
                  className="w-full font-normal text-lg py-6"
                  size="lg"
                >
                  {t('addToCart')}
                </Button>
                
                <div className="flex gap-3 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    size="lg"
                  >
                    <PhoneIcon className="w-4 h-4 me-2" strokeWidth={2} />
                    {t('contactSeller')}
                  </Button>
                  {(user || isGuest) && (
                    <Button
                      onClick={handleFavoriteClick}
                      variant="outline"
                      size="lg"
                      className={`${isFavorite ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-card border-border'} hover:bg-muted hover:text-foreground font-normal`}
                    >
                      <HeartIcon 
                        className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`}
                        strokeWidth={2}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
      
      <GuestRestrictionModal
        open={showGuestModal}
        onOpenChange={setShowGuestModal}
      />

      {product && user && (
        <DeliveryModal
          open={showDeliveryModal}
          onOpenChange={setShowDeliveryModal}
          userId={user.id}
          cartItems={[{ id: 'temp', product_id: product.id, quantity: 1, product }]}
          initialDeliveryType={deliveryType}
        />
      )}
    </div>
  );
};
