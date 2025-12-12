// components/ProductCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { HeartIcon, ShoppingCartIcon, EyeIcon, StarIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  return (
    <Card className="group bg-card text-card-foreground border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* صورة المنتج */}
      <div className="relative overflow-hidden aspect-square">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url}
            alt={language === 'ar' ? product.name_ar : product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link> 
      </div>
      
      {/* معلومات المنتج */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground">
            {language === 'ar' ? product.type_ar : product.type}
          </span>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {language === 'ar' ? product.name_ar : product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {language === 'ar' ? product.description_ar : product.description}
        </p>
        
        {/* السعر والكمية */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-primary">
              {product.price.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? `${product.quantity} قطعة متوفرة`
                : `${product.quantity} pieces available`}
            </p>
          </div>       
        </div>
      </div>
    </Card>
  );
};