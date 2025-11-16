import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useProducts } from '../hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dailog';
import { Toast } from '../components/Toast';
import { PlusIcon, EditIcon, Trash2Icon, PackageIcon } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { isAdmin, user } = useAuthStore();
  const t = useTranslation(language);
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    category: '',
    category_ar: '',
    type: '',
    type_ar: '',
    quantity: 1,
    ingredients: '',
    ingredients_ar: '',
    description: '',
    description_ar: '',
    price: 0,
    image_url: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      category: '',
      category_ar: '',
      type: '',
      type_ar: '',
      quantity: 1,
      ingredients: '',
      ingredients_ar: '',
      description: '',
      description_ar: '',
      price: 0,
      image_url: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
    setShowProductForm(false);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          ...formData,
        });
        setToast({
          open: true,
          title: t('productUpdated'),
          variant: 'success',
        });
      } else {
        await createProduct.mutateAsync({
          ...formData,
          seller_id: user?.id || '',
        });
        setToast({
          open: true,
          title: t('productAdded'),
          variant: 'success',
        });
      }
      resetForm();
    } catch (error) {
      setToast({
        open: true,
        title: t('error'),
        variant: 'error',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_ar: product.name_ar,
      category: product.category,
      category_ar: product.category_ar,
      type: product.type,
      type_ar: product.type_ar,
      quantity: product.quantity,
      ingredients: product.ingredients,
      ingredients_ar: product.ingredients_ar,
      description: product.description,
      description_ar: product.description_ar,
      price: product.price,
      image_url: product.image_url,
    });
    setImagePreview(product.image_url);
    setShowProductForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      setToast({
        open: true,
        title: t('productDeleted'),
        variant: 'success',
      });
      setDeleteConfirm(null);
    } catch (error) {
      setToast({
        open: true,
        title: t('error'),
        variant: 'error',
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t('dashboard')}
          </h1>
          <Button
            onClick={() => setShowProductForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
          >
            <PlusIcon className="w-4 h-4 me-2" strokeWidth={2} />
            {t('addProduct')}
          </Button>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-muted text-muted-foreground mb-6">
            <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <PackageIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('productList')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-6 bg-card text-card-foreground border-border">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={product.image_url}
                        alt={language === 'ar' ? product.name_ar : product.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {language === 'ar' ? product.name_ar : product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'ar' ? product.category_ar : product.category}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {language === 'ar' ? product.type_ar : product.type} • {product.quantity} {language === 'ar' ? 'قطعة' : 'pieces'}
                        </p>
                        <p className="text-primary font-bold">
                          {product.price.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                        </p>
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="outline"
                          size="sm"
                          className="bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                        >
                          <EditIcon className="w-4 h-4 me-2" strokeWidth={2} />
                          {t('edit')}
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirm(product.id)}
                          variant="outline"
                          size="sm"
                          className="bg-card text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground font-normal"
                        >
                          <Trash2Icon className="w-4 h-4 me-2" strokeWidth={2} />
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PackageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
                <p className="text-muted-foreground text-lg">
                  {t('noProducts')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? t('editProduct') : t('addProduct')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="text-foreground mb-2 block">
                {t('uploadImage')}
              </Label>
              <div className="flex flex-col gap-4">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer text-center font-medium">
                      {imagePreview ? t('changeImage') : t('selectImage')}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  {t('name')} (English)
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Grilled Chicken"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="name_ar" className="text-foreground">
                  {t('name')} (العربية)
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                  placeholder="دجاج مشوي"
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-foreground">
                  {t('category')} (English)
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="Oven Roasted"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="category_ar" className="text-foreground">
                  {t('category')} (العربية)
                </Label>
                <Input
                  id="category_ar"
                  value={formData.category_ar}
                  onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })}
                  required
                  placeholder="دجاج بالفرن"
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-foreground">
                  {t('type')} (English)
                </Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  placeholder="Whole Chicken"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="type_ar" className="text-foreground">
                  {t('type')} (العربية)
                </Label>
                <Input
                  id="type_ar"
                  value={formData.type_ar}
                  onChange={(e) => setFormData({ ...formData, type_ar: e.target.value })}
                  required
                  placeholder="دجاج كامل"
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-foreground">
                  {t('quantity')}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-foreground">
                  {t('price')} ({language === 'ar' ? 'ر.س' : 'SAR'})
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ingredients" className="text-foreground">
                  {t('ingredients')} (English)
                </Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  required
                  rows={4}
                  placeholder="Chicken, Salt, Pepper, Garlic, Lemon..."
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="ingredients_ar" className="text-foreground">
                  {t('ingredients')} (العربية)
                </Label>
                <Textarea
                  id="ingredients_ar"
                  value={formData.ingredients_ar}
                  onChange={(e) => setFormData({ ...formData, ingredients_ar: e.target.value })}
                  required
                  rows={4}
                  placeholder="دجاج، ملح، فلفل، ثوم، ليمون..."
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description" className="text-foreground">
                  {t('description')} (English)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Delicious oven-roasted chicken..."
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="description_ar" className="text-foreground">
                  {t('description')} (العربية)
                </Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  required
                  rows={4}
                  placeholder="دجاج لذيذ مشوي بالفرن..."
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
                className="bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
              >
                {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t('confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-normal"
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
    </div>
  );
};
