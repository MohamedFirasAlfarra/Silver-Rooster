import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../hooks/useFavorites';
import { useTranslation } from '../lib/translations';
import { Toast } from './Toast';
import { GuestRestrictionModal } from '../components/ui/GuestRestrictionModal';
import { HeartIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language } = useAppStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslation(language);
  const { data: favorites } = useFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  const name = language === 'ar' ? product.name_ar : product.name;
  const category = language === 'ar' ? product.category_ar : product.category;
  const type = language === 'ar' ? product.type_ar : product.type;

  const isFavorite = favorites?.some(fav => fav.product_id === product.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGuest || !user) {
      setShowGuestModal(true);
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync({ userId: user.id, productId: product.id });
        setToast({
          open: true,
          title: t('favoriteRemoved'),
          variant: 'success',
        });
      } else {
        await addFavorite.mutateAsync({ userId: user.id, productId: product.id });
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

  return (
    <>
      <Link to={`/products/${product.id}`} className="block group">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card text-card-foreground border-border h-full flex flex-col relative">
          {(user || isGuest) && (
            <Button
              onClick={handleFavoriteClick}
              variant="ghost"
              size="icon"
              className="absolute top-2 end-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background border border-border"
            >
              <HeartIcon 
                className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-foreground'}`}
                strokeWidth={2}
              />
            </Button>
          )}
          
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={product.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
              {category}
            </p>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
              {type}
            </p>
            <div className="mt-auto">
              <p className="text-xl font-bold text-primary">
                {product.price.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ل.س' : 'SAR'}
              </p>
            </div>
          </div>
        </Card>
      </Link>
      
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
    </>
  );
};
