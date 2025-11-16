import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { useProducts } from '../hooks/useProducts';
import { CardGrid } from '../components/CardGrid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Card } from '../components/ui/card';
import { FilterIcon } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const { data: products, isLoading } = useProducts();
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = !categoryFilter || 
      (language === 'ar' ? product.category_ar : product.category)
        .toLowerCase()
        .includes(categoryFilter.toLowerCase());
    
    const matchesType = !typeFilter || 
      (language === 'ar' ? product.type_ar : product.type)
        .toLowerCase()
        .includes(typeFilter.toLowerCase());
    
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesType && matchesPrice;
  }) || [];

  const clearFilters = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setPriceRange([0, 10000]);
  };

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t('products')}
          </h1>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="md:hidden bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            <FilterIcon className="w-4 h-4 me-2" strokeWidth={2} />
            {t('filters')}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <Card className="p-6 bg-card text-card-foreground border-border sticky top-20">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {t('filters')}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="category" className="text-foreground mb-2 block">
                    {t('category')}
                  </Label>
                  <Input
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث عن القسم...' : 'Search category...'}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-foreground mb-2 block">
                    {t('type')}
                  </Label>
                  <Input
                    id="type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث عن النوع...' : 'Search type...'}
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-2 block">
                    {t('priceRange')}
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={10000}
                      step={100}
                      className="my-4"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{priceRange[0].toLocaleString()}</span>
                      <span>{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  {t('clearFilters')}
                </Button>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : filteredProducts.length > 0 ? (
              <CardGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('noProducts')}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
