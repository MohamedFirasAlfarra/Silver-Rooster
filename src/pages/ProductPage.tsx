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
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  GridIcon,
  ListIcon,
  TagIcon,
  PackageIcon,
  FlameIcon,
  StarIcon,
  ClockIcon
} from 'lucide-react';
import { Product } from '../types';

interface CategoryGroup {
  name: string;
  name_ar: string;
  types: TypeGroup[];
}

interface TypeGroup {
  name: string;
  name_ar: string;
  products: Product[];
}

export const ProductsPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  
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
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  
  const productsPerBatch = 12;
  const batchIndexRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const categoryGroups = useMemo(() => {
    if (!allProducts.length) return [];
    
    const categoriesMap = new Map<string, CategoryGroup>();
    
    allProducts.forEach(product => {
      const categoryName = language === 'ar' ? product.category_ar : product.category;
      const categoryKey = product.category; 
      
      if (!categoriesMap.has(categoryKey)) {
        categoriesMap.set(categoryKey, {
          name: product.category,
          name_ar: product.category_ar,
          types: []
        });
      }
      
      const category = categoriesMap.get(categoryKey)!;
      const typeName = language === 'ar' ? product.type_ar : product.type;
      const typeKey = product.type;
      
      let typeGroup = category.types.find(t => t.name === product.type);
      if (!typeGroup) {
        typeGroup = {
          name: product.type,
          name_ar: product.type_ar,
          products: []
        };
        category.types.push(typeGroup);
      }
      
      typeGroup.products.push(product);
    });
    
    // ترتيب الفئات حسب عدد المنتجات
    return Array.from(categoriesMap.values())
      .sort((a, b) => {
        const aCount = a.types.reduce((sum, type) => sum + type.products.length, 0);
        const bCount = b.types.reduce((sum, type) => sum + type.products.length, 0);
        return bCount - aCount;
      });
  }, [allProducts, language]);
  
  // جلب المنتجات حسب التصنيف المحدد
  const getFilteredProducts = useMemo(() => {
    let filtered = [...allProducts];
    
    // فلترة حسب الفئة المختارة
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        product.category_ar === selectedCategory
      );
    }
    
    // فلترة حسب النوع المختار
    if (selectedType) {
      filtered = filtered.filter(product => 
        product.type === selectedType || 
        product.type_ar === selectedType
      );
    }
    
    // فلترة حسب البحث
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(term) || 
                         product.name_ar?.toLowerCase().includes(term);
        const descMatch = product.description?.toLowerCase().includes(term) || 
                         product.description_ar?.toLowerCase().includes(term);
        return nameMatch || descMatch;
      });
    }
    
    // فلترة حسب السعر
    filtered = filtered.filter(product => {
      const price = typeof product.price === 'number' 
        ? product.price 
        : parseFloat(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // ترتيب المنتجات
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          // يمكنك إضافة منطق الترتيب حسب الشعبية لاحقاً
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allProducts, selectedCategory, selectedType, searchTerm, priceRange, sortBy, language]);
  
  // تهيئة العرض الأولي
  useEffect(() => {
    if (allProducts.length > 0 && !initialLoadDone) {
      const firstBatch = getFilteredProducts.slice(0, productsPerBatch);
      setDisplayedProducts(firstBatch);
      batchIndexRef.current = 1;
      setHasMore(firstBatch.length < getFilteredProducts.length);
      setInitialLoadDone(true);
      
      // تحميل الباقي في الخلفية
      setTimeout(() => {
        const remainingProducts = getFilteredProducts.slice(productsPerBatch);
        if (remainingProducts.length > 0) {
          setDisplayedProducts(getFilteredProducts);
          setHasMore(false);
        }
      }, 500);
    } else if (allProducts.length > 0) {
      // إذا تم تحديث الفلاتر، أعد تحميل المنتجات
      const firstBatch = getFilteredProducts.slice(0, productsPerBatch);
      setDisplayedProducts(firstBatch);
      batchIndexRef.current = 1;
      setHasMore(firstBatch.length < getFilteredProducts.length);
    }
  }, [allProducts, getFilteredProducts, initialLoadDone]);
  
  const loadMoreProducts = useCallback(async () => {
    if (!getFilteredProducts.length || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const startIndex = batchIndexRef.current * productsPerBatch;
      const endIndex = startIndex + productsPerBatch;
      const nextBatch = getFilteredProducts.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        batchIndexRef.current += 1;
      }
      
      if (endIndex >= getFilteredProducts.length) {
        setHasMore(false);
      }
      
      setIsLoadingMore(false);
    }, 150);
  }, [getFilteredProducts, isLoadingMore, hasMore]);
  
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
  
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };
  
  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setSelectedType(null);
  };
  
  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
  };
  
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSearchTerm('');
    setExpandedCategories(new Set());
    if (allProducts && allProducts.length > 0) {
      const prices = allProducts
        .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0)
        .filter(p => p > 0);
      const maxPrice = Math.max(...prices);
      setPriceRange([0, maxPrice || 1000000]);
    }
  };
  
  const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes('grilled') || lowerName.includes('مشوي')) return <FlameIcon className="w-5 h-5" />;
    if (lowerName.includes('fresh') || lowerName.includes('طازج')) return <StarIcon className="w-5 h-5" />;
    if (lowerName.includes('special') || lowerName.includes('خاص')) return <StarIcon className="w-5 h-5" />;
    if (lowerName.includes('new') || lowerName.includes('جديد')) return <ClockIcon className="w-5 h-5" />;
    return <PackageIcon className="w-5 h-5" />;
  };
  
  // معالجة خطأ الاتصال
  const isConnectionError = isError && 
    ((error as any)?.message?.includes('Failed to fetch') ||
    (error as any)?.message?.includes('ERR_NAME_NOT_RESOLVED'));
  
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t('products')}
            </h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">  

              {(selectedCategory || selectedType || searchTerm) && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <TagIcon className="w-3 h-3" />
                      {categoryGroups.find(c => c.name === selectedCategory)?.[language === 'ar' ? 'name_ar' : 'name']}
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="ml-1 hover:text-primary/70"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedType && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                      <PackageIcon className="w-3 h-3" />
                      {selectedType}
                      <button 
                        onClick={() => setSelectedType(null)}
                        className="ml-1 hover:text-secondary/70"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <GridIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
 
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="md:hidden"
            >
              <FilterIcon className="w-4 h-4 me-2" />
              {t('filters')}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* الشريط الجانبي للفئات */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="space-y-6 sticky top-24">
              
              <Card className="p-6 bg-card text-card-foreground border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {language === 'ar' ? 'الأقسام' : 'Categories'}
                  </h2>
                  {(selectedCategory || selectedType) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      {language === 'ar' ? 'مسح الكل' : 'Clear all'}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={clearAllFilters}
                  className={`w-full text-right mb-4 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    !selectedCategory && !selectedType
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="font-medium">
                    {language === 'ar' ? 'كل المنتجات' : 'All Products'}
                  </span>
                  <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                    {allProducts.length}
                  </span>
                </button>
                
                {/* قائمة الفئات */}
                <div className="space-y-2">
                  {categoryGroups.map((category, index) => {
                    const isSelected = selectedCategory === category.name;
                    const isExpanded = expandedCategories.has(category.name);
                    const totalProducts = category.types.reduce((sum, type) => sum + type.products.length, 0);
                    
                    return (
                      <div key={category.name} className="border border-border rounded-lg overflow-hidden">
                        {/* زر الفئة */}
                        <button
                          onClick={() => {
                            handleCategorySelect(category.name);
                            toggleCategory(category.name);
                          }}
                          className={`w-full px-4 py-3 text-right flex items-center justify-between transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(category.name)}
                            <div className="text-right">
                              <div className="font-medium">
                                {language === 'ar' ? category.name_ar : category.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {language === 'ar' 
                                  ? `${totalProducts} منتج`
                                  : `${totalProducts} products`}
                              </div>
                            </div>
                          </div>
                          <ChevronDownIcon 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {isExpanded && (
                          <div className="border-t border-border bg-background/50">
                            <div className="py-2 px-4 space-y-1">
                              {category.types.map((type, typeIndex) => {
                                const isTypeSelected = selectedType === type.name;
                                
                                return (
                                  <button
                                    key={type.name}
                                    onClick={() => handleTypeSelect(type.name)}
                                    className={`w-full text-right px-3 py-2 rounded flex items-center justify-between transition-all duration-200 ${
                                      isTypeSelected
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <PackageIcon className="w-3 h-3" />
                                      <span className="text-sm">
                                        {language === 'ar' ? type.name_ar : type.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                                      {type.products.length}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </aside>
          
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
                    ? 'لم يتم إضافة أي منتجات بعد في هذا القسم. الرجاء المحاولة لاحقاً.'
                    : 'No products have been added yet in this section. Please try again later.'}
                </p>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                >
                  {language === 'ar' ? 'عرض جميع المنتجات' : 'View all products'}
                </Button>
              </div>
            ) : (
              <>
                {/* عنوان القسم المحدد */}
                {(selectedCategory || selectedType) && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {selectedCategory 
                            ? `${language === 'ar' ? 'قسم' : 'Category'}: ${
                                categoryGroups.find(c => c.name === selectedCategory)?.[language === 'ar' ? 'name_ar' : 'name']
                              }`
                            : language === 'ar' ? 'كل المنتجات' : 'All Products'}
                        </h2>
                        {selectedType && (
                          <p className="text-muted-foreground mt-1">
                            {language === 'ar' ? 'النوع:' : 'Type:'} {selectedType}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? `${displayedProducts.length} منتج`
                          : `${displayedProducts.length} products`}
                      </div>
                    </div>
                    
                    {selectedCategory && !selectedType && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categoryGroups
                          .find(c => c.name === selectedCategory)
                          ?.types.map((type, index) => (
                            <button
                              key={type.name}
                              onClick={() => handleTypeSelect(type.name)}
                              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <PackageIcon className="w-3 h-3" />
                                {language === 'ar' ? type.name_ar : type.name}
                                <span className="text-xs bg-background px-1.5 py-0.5 rounded">
                                  {type.products.length}
                                </span>
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* عرض المنتجات */}
                {viewMode === 'grid' ? (
                  <CardGrid products={displayedProducts} />
                ) : (
                  <div className="space-y-4">
                    {displayedProducts.map((product) => (
                      <Card key={product.id} className="p-6 bg-card text-card-foreground border-border">
                        <div className="flex flex-col md:flex-row gap-6">
                          <img
                            src={product.image_url}
                            alt={language === 'ar' ? product.name_ar : product.name}
                            className="w-full md:w-48 h-48 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                  {language === 'ar' ? product.name_ar : product.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                    {language === 'ar' ? product.category_ar : product.category}
                                  </span>
                                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                                    {language === 'ar' ? product.type_ar : product.type}
                                  </span>
                                </div>
                              </div>
                              <p className="text-2xl font-bold text-primary">
                                {product.price.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                              </p>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {language === 'ar' ? product.description_ar : product.description}
                            </p>

                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* مؤشر التحميل التلقائي */}
                {hasMore && displayedProducts.length < getFilteredProducts.length && (
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
                {hasMore && displayedProducts.length < getFilteredProducts.length && (
                  <div className="text-center pb-8">
                    <Button
                      onClick={() => {
                        setDisplayedProducts(getFilteredProducts);
                        setHasMore(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      {language === 'ar' 
                        ? `تحميل جميع المنتجات (${getFilteredProducts.length - displayedProducts.length} منتج)`
                        : `Load all products (${getFilteredProducts.length - displayedProducts.length} products)`}
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