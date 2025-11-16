import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useFavorites } from '../hooks/useFavorites';
import { useProducts } from '../hooks/useProducts';
import { CardGrid } from '../components/CardGrid';
import { Button } from '../components/ui/button';
import { HeartIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(language);
  
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(user?.id);
  const { data: allProducts, isLoading: productsLoading } = useProducts();

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

  const favoriteProducts = allProducts?.filter(product => 
    favorites?.some(fav => fav.product_id === product.id)
  ) || [];

  const isLoading = favoritesLoading || productsLoading;

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <HeartIcon className="w-6 h-6 text-primary" strokeWidth={2} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('favorites')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? `${favoriteProducts.length} منتج في المفضلة`
                : `${favoriteProducts.length} products in favorites`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : favoriteProducts.length > 0 ? (
          <CardGrid products={favoriteProducts} />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t('noFavorites')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'ar' 
                ? 'ابدأ بإضافة المنتجات المفضلة لديك لتسهيل الوصول إليها لاحقاً'
                : 'Start adding your favorite products for easy access later'}
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
