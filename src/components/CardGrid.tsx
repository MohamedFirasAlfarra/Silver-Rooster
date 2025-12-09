// components/CardGrid.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface CardGridProps {
  products: Product[];
}

export const CardGrid: React.FC<CardGridProps> = ({ products }) => {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  
  // تأثير لتحميل المنتجات تدريجياً مع أنيميشن
  useEffect(() => {
    if (products.length === 0) {
      setVisibleProducts([]);
      return;
    }
    
    // عرض المنتجات تدريجياً مع تأثير fade-in
    let mounted = true;
    let index = 0;
    const batchSize = 8;
    
    const loadBatch = () => {
      if (!mounted || index >= products.length) return;
      
      const nextBatch = products.slice(index, index + batchSize);
      setVisibleProducts(prev => [...prev, ...nextBatch]);
      index += batchSize;
      
      // استمر في التحميل التدريجي
      if (index < products.length) {
        setTimeout(loadBatch, 50);
      }
    };
    
    // بدء التحميل
    loadBatch();
    
    return () => {
      mounted = false;
    };
  }, [products]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {visibleProducts.map((product, index) => (
        <div
          key={product.id}
          className="animate-fadeIn"
          style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};