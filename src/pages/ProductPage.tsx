import React, { useState, useEffect, useMemo } from 'react';
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
  XIcon
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const { 
    data: products = [], 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useProducts();
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]); // زيادة النطاق
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('📊 عدد المنتجات من useProducts:', products?.length);
    console.log('💰 بيانات المنتجات:', products.map(p => ({ 
      name: p.name, 
      price: p.price,
      category: p.category,
      category_ar: p.category_ar
    })));
  }, [products]);

  // معالجة خطأ الاتصال
  const isConnectionError = isError && 
    ((error as any)?.message?.includes('Failed to fetch') ||
    (error as any)?.message?.includes('ERR_NAME_NOT_RESOLVED'));

  // تحسين منطق التصفية - الإصلاح هنا!
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    console.log('🎯 بدء التصفية - المنتجات الأصلية:', products.length);
    
    let filtered = [...products];
    
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
      console.log('🔍 بعد البحث:', filtered.length);
    }
    
    // التصفية حسب الفئة
    if (categoryFilter.trim()) {
      const term = categoryFilter.toLowerCase();
      filtered = filtered.filter(product => {
        const categoryField = language === 'ar' ? product.category_ar : product.category;
        return categoryField?.toLowerCase().includes(term);
      });
      console.log('🏷️ بعد الفئة:', filtered.length);
    }
    
    // التصفية حسب النوع
    if (typeFilter.trim()) {
      const term = typeFilter.toLowerCase();
      filtered = filtered.filter(product => {
        const typeField = language === 'ar' ? product.type_ar : product.type;
        return typeField?.toLowerCase().includes(term);
      });
      console.log('📦 بعد النوع:', filtered.length);
    }
    
    // التصفية حسب السعر - الإصلاح هنا!
    console.log('💰 نطاق السعر الحالي:', priceRange[0], '-', priceRange[1]);
    // filtered = filtered.filter(product => {
    //   // تحويل السعر إلى رقم إذا كان نصاً
    //   const price = typeof product.price === 'number' 
    //     ? product.price 
    //     : parseFloat(product.price) || 0;
      
    //   console.log(`   منتج: ${product.name}, السعر: ${price}`);
      
    //   const inRange = price >= priceRange[0] && price <= priceRange[1];
    //   return inRange;
    // });
    console.log('💰 بعد السعر:', filtered.length);
    
    console.log('✅ المنتجات المصفاة النهائية:', filtered.length);
    return filtered;
  }, [products, searchTerm, categoryFilter, typeFilter, priceRange, language]);

  const clearFilters = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setSearchTerm('');
    // إعادة تعيين نطاق السعر بناءً على المنتجات الفعلية
    if (products && products.length > 0) {
      const prices = products
        .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0)
        .filter(p => p > 0);
      const maxPrice = Math.max(...prices);
      setPriceRange([0, maxPrice || 1000000]);
    } else {
      setPriceRange([0, 1000000]);
    }
  };

  // استخراج الفئات الفريدة
  const uniqueCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categories = products.map(p => 
      language === 'ar' ? (p.category_ar || p.category) : (p.category || p.category_ar)
    ).filter(Boolean);
    return Array.from(new Set(categories));
  }, [products, language]);

  // استخراج الأنواع الفريدة
  const uniqueTypes = useMemo(() => {
    if (!products || products.length === 0) return [];
    const types = products.map(p => 
      language === 'ar' ? (p.type_ar || p.type) : (p.type || p.type_ar)
    ).filter(Boolean);
    return Array.from(new Set(types));
  }, [products, language]);

  // الحصول على أعلى سعر للمنتجات
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 1000000;
    const prices = products
      .map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0)
      .filter(p => p > 0);
    if (prices.length === 0) return 1000000;
    const max = Math.max(...prices);
    return Math.ceil(max / 1000) * 1000; // تقريب لأقرب ألف
  }, [products]);

  // تهيئة نطاق السعر عند تحميل المنتجات
  useEffect(() => {
    if (products && products.length > 0 && maxPrice > 0 && priceRange[1] === 1000000) {
      setPriceRange([0, maxPrice]);
      console.log('⚙️ تهيئة نطاق السعر إلى:', [0, maxPrice]);
    }
  }, [products, maxPrice, priceRange]);

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
            <p className="text-muted-foreground mt-2">
              {isLoading 
                ? language === 'ar' ? 'جاري التحميل...' : 'Loading...'
                : language === 'ar' 
                  ? `عرض ${filteredProducts.length} من أصل ${products.length} منتج`
                  : `Showing ${filteredProducts.length} of ${products.length} products`}
            </p>
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

                {/* فلتر السعر */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    {t('priceRange')}
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={maxPrice}
                      step={100}
                      className="my-4"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {priceRange[0].toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                      </span>
                      <span className="text-foreground">
                        {priceRange[1].toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' 
                        ? `أعلى سعر: ${maxPrice.toLocaleString()} ل.س`
                        : `Highest price: ${maxPrice.toLocaleString()} SAR`}
                    </p>
                  </div>
                </div>

                {/* معلومات التصفية */}
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  {language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}
                </p>
              </div>
            ) : products.length === 0 ? (
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
                          ? `يتم عرض ${filteredProducts.length} منتج من أصل ${products.length}`
                          : `Showing ${filteredProducts.length} of ${products.length} products`}
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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};