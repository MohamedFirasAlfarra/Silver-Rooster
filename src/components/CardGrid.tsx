// components/CardGrid.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface CardGridProps {
  products: Product[];
}

export const CardGrid: React.FC<CardGridProps> = ({ products }) => {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (products.length === 0) {
      setVisibleProducts([]);
      return;
    }
    setVisibleProducts(products);

  }, [products]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {visibleProducts.map((product, index) => (
        <div
          key={product.id}
          className="animate-fadeIn"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};