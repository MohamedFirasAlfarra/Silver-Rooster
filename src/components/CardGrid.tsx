import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { useAppStore } from '../stores/useAppStore';

interface CardGridProps {
  products: Product[];
}

export const CardGrid: React.FC<CardGridProps> = ({ products }) => {
  const { language } = useAppStore();

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {language === 'ar' ? 'لا توجد منتجات لعرضها' : 'No products to display'}
        </p>
      </div>
    );
  }

  console.log('🃏 CardGrid يتلقى:', products.length, 'منتج');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};