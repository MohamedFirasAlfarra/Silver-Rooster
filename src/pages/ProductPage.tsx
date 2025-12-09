import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { useProducts } from '../hooks/useProducts';
import { CardGrid } from '../components/CardGrid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Card } from '../components/ui/card';
import { 
  FilterIcon, 
  AlertCircleIcon, 
  RefreshCwIcon,
  SearchIcon,
  XIcon,
  Loader2Icon
} from 'lucide-react';
import { Product } from '../types';

export const ProductsPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  
  // استخدام useProducts العادي مع cache
  const { 
    data: allProducts = [], 
    isLoading: isInitialLoading, 
    error, 
    refetch,
    isError,
    isFetching 
  } = useProducts();
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const productsPerBatch = 12; // عدد المنتجات في كل دفعة
  const batchIndexRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // دالة لتحميل المزيد من المنتجات تدريجياً
  const loadMoreProducts = useCallback(async () => {
    if (!allProducts.length || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // محاكاة تحميل تدريجي
    setTimeout(() => {
      const startIndex = batchIndexRef.current * productsPerBatch;
      const endIndex = startIndex + productsPerBatch;
      const nextBatch = allProducts.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        batchIndexRef.current += 1;
      }
      
      if (endIndex >= allProducts.length) {
        setHasMore(false);
      }
      
      setIsLoadingMore(false);
    }, 150); // تأخير قصير لمحاكاة التحميل التدريجي
  }, [allProducts, isLoadingMore, hasMore]);
  
  // تهيئة العرض الأولي
  useEffect(() => {
    if (allProducts.length > 0 && !initialLoadDone) {
      // تحميل الدفعة الأولى فوراً
      const firstBatch = allProducts.slice(0, productsPerBatch);
      setDisplayedProducts(firstBatch);
      batchIndexRef.current = 1;
      setHasMore(firstBatch.length < allProducts.length);
      setInitialLoadDone(true);
      
      // تحميل الباقي في الخلفية
      setTimeout(() => {
        const remainingProducts = allProducts.slice(productsPerBatch);
        if (remainingProducts.length > 0) {
          setDisplayedProducts(allProducts);
          setHasMore(false);
        }
      }, 500);
    }
  }, [allProducts, initialLoadDone]);
  
  // إعداد Intersection Observer للتحميل التلقائي
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.5 }
    );
    
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMoreProducts]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('📊 عدد المنتجات المحملة:', displayedProducts.length);
  }, [displayedProducts]);
  
  // معالجة خطأ الاتصال
  const isConnectionError = isError && 
    ((error as any)?.message?.includes('Failed to fetch') ||
    (error as any)?.message?.includes('ERR_NAME_NOT_RESOLVED'));
  
  // تحسين منطق التصفية
  const filteredProducts = useMemo(() => {
    if (!displayedProducts || displayedProducts.length === 0) return [];
    
    let filtered = [...displayedProducts];
    
    // التصفية حسب البحث
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(term) || 
                         product.name_ar?.toLowerCase().includes(term);
        const descMatch = product.description?.toLowerCase().includes(term) || 
                         product.description_ar?.toLowerCase().includes(term);
        const categoryMatch = product.category?.toLowerCase().includes(term) || 
                            product.category_ar?.toLowerCase().includes(term);
        
        return nameMatch || descMatch || categoryMatch;
      });
    }
    
    // التصفية حسب الفئة
    if (categoryFilter.trim()) {
      const term = categoryFilter.toLowerCase();
      filtered = filtered.filter(product => {
        const categoryField = language === 'ar' ? product.category_ar : product.category;
        return categoryField?.toLowerCase().includes(term);
      });
    }
    
    // التصفية حسب النوع
    if (typeFilter.trim()) {
      const term = typeFilter.toLowerCase();
      filtered = filtered.filter(product => {
        const typeField = language === 'ar' ? product.type_ar : product.type;
        return typeField?.toLowerCase().includes(term);
      });
    }
    
    // التصفية حسب السعر
    filtered = filtered.filter(product => {
      const price = typeof product.price === 'number' 
        ? product.price 
        : parseFloat(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    return filtered;
  }, [displayedProducts, searchTerm, categoryFilter, typeFilter, priceRange, language]);
  
  const clearFilters = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setSearchTerm('');
    if (allProducts && allProducts.length > 0) {
      const prices = allProducts
        .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0)
        .filter(p => p > 0);
      const maxPrice = Math.max(...prices);
      setPriceRange([0, maxPrice || 1000000]);
    } else {
      setPriceRange([0, 1000000]);
    }
  };
  
  // استخراج الفئات الفريدة من جميع المنتجات
  const uniqueCategories = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const categories = allProducts.map(p => 
      language === 'ar' ? (p.category_ar || p.category) : (p.category || p.category_ar)
    ).filter(Boolean);
    return Array.from(new Set(categories));
  }, [allProducts, language]);
  
  // استخراج الأنواع الفريدة من جميع المنتجات
  const uniqueTypes = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const types = allProducts.map(p => 
      language === 'ar' ? (p.type_ar || p.type) : (p.type || p.type_ar)
    ).filter(Boolean);
    return Array.from(new Set(types));
  }, [allProducts, language]);
  
  // الحصول على أعلى سعر
  const maxPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 1000000;
    const prices = allProducts
      .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0)
      .filter(p => p > 0);
    if (prices.length === 0) return 1000000;
    const max = Math.max(...prices);
    return Math.ceil(max / 1000) * 1000;
  }, [allProducts]);
  
  // تهيئة نطاق السعر
  useEffect(() => {
    if (allProducts && allProducts.length > 0 && maxPrice > 0 && priceRange[1] === 1000000) {
      setPriceRange([0, maxPrice]);
    }
  }, [allProducts, maxPrice, priceRange]);
  
  // دالة لتحميل جميع المنتجات يدوياً
  const handleLoadAllProducts = () => {
    if (allProducts.length > 0) {
      setDisplayedProducts(allProducts);
      setHasMore(false);
    }
  };
  
  if (isConnectionError) {
    return (
      <div className="transition-page min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircleIcon className="w-20 h-20 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
              : 'Unable to connect to the server. Please check your internet connection and try again.'}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => refetch()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCwIcon className="w-4 h-4 me-2" />
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              {language === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">       
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('products')}
            </h1>
            
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="md:hidden bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              <FilterIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('filters')}
            </Button>
            {(searchTerm || categoryFilter || typeFilter || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <XIcon className="w-4 h-4" />
                {language === 'ar' ? 'مسح الكل' : 'Clear all'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* الشريط الجانبي للفلاتر */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <Card className="p-6 bg-card text-card-foreground border-border sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t('filters')}
                </h2>
                {(searchTerm || categoryFilter || typeFilter || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* فلتر الفئة */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    {t('category')}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder={language === 'ar' ? 'ابحث عن القسم...' : 'Search category...'}
                      className="bg-background text-foreground border-border"
                    />
                    {uniqueCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {uniqueCategories.slice(0, 3).map((category, index) => (
                          <button
                            key={index}
                            onClick={() => setCategoryFilter(category || '')}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              categoryFilter === category
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* فلتر النوع */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    {t('type')}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      placeholder={language === 'ar' ? 'ابحث عن النوع...' : 'Search type...'}
                      className="bg-background text-foreground border-border"
                    />
                    {uniqueTypes.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' 
                          ? `${uniqueTypes.length} نوع متاح` 
                          : `${uniqueTypes.length} types available`}
                      </div>
                    )}
                  </div>
                </div>
                
                {(searchTerm || categoryFilter || typeFilter || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? `يتم عرض ${filteredProducts.length} منتج بعد التصفية`
                        : `Showing ${filteredProducts.length} products after filtering`}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </aside>
          
          {/* شبكة المنتجات */}
          <main className="flex-1">
            {isInitialLoading && !initialLoadDone ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  {language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}
                </p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products available'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {language === 'ar' 
                    ? 'لم يتم إضافة أي منتجات بعد. الرجاء المحاولة لاحقاً.'
                    : 'No products have been added yet. Please try again later.'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {language === 'ar' 
                    ? 'لم يتم العثور على منتجات تطابق معايير البحث. جرب تعديل الفلاتر.'
                    : 'No products match your search criteria. Try adjusting your filters.'}
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                >
                  {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
                </Button>
              </div>
            ) : (
              <>
                {/* شريط حالة التصفية */}
                {(searchTerm || categoryFilter || typeFilter || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <div className="mb-6 p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">
                        {language === 'ar' 
                          ? `يتم عرض ${filteredProducts.length} منتج من أصل ${displayedProducts.length}`
                          : `Showing ${filteredProducts.length} of ${displayedProducts.length} products`}
                      </p>
                      <Button
                        onClick={clearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                      >
                        {language === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* عرض المنتجات */}
                <CardGrid products={filteredProducts} />
                
                {/* مؤشر التحميل التلقائي */}
                {hasMore && displayedProducts.length < allProducts.length && (
                  <div className="text-center py-8">
                    {isLoadingMore ? (
                      <div className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2Icon className="w-5 h-5 animate-spin" />
                        <span>{language === 'ar' ? 'جاري تحميل المزيد...' : 'Loading more...'}</span>
                      </div>
                    ) : (
                      <Button
                        onClick={loadMoreProducts}
                        variant="outline"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {language === 'ar' ? 'تحميل المزيد' : 'Load more'}
                      </Button>
                    )}
                  </div>
                )}
                
                {/* زر تحميل جميع المنتجات */}
                {hasMore && displayedProducts.length < allProducts.length && (
                  <div className="text-center pb-8">
                    <Button
                      onClick={handleLoadAllProducts}
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      {language === 'ar' ? 'تحميل جميع المنتجات مرة واحدة' : 'Load all products at once'}
                    </Button>
                  </div>
                )}
                
                {/* عنصر مراقبة للتحميل التلقائي */}
                <div ref={sentinelRef} className="h-10" />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};