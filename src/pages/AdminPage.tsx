import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useAdminOrders, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { Product, Order } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dailog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Toast } from '../components/Toast';
import { 
  PlusIcon, 
  EditIcon, 
  Trash2Icon, 
  PackageIcon, 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
  PackageCheckIcon,
  Truck,
  Home,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Calendar,
  CreditCard,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { isAdmin, user } = useAuthStore();
  const t = useTranslation(language);

  const queryClient = useQueryClient();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useAdminOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<string | null>(null);
  const [orderToAction, setOrderToAction] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  const [toast, setToast] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'success' as 'success' | 'error' | 'warning',
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
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!isAdmin) navigate('/');
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
    setImagePreview('');
    setImageFile(null);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData((d) => ({ ...d, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...formData });
        setToast({ 
          open: true, 
          title: t('productUpdated'), 
          description: language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
          variant: 'success' 
        });
      } else {
        await createProduct.mutateAsync({
          ...formData,
          seller_id: ''
        });
        setToast({ 
          open: true, 
          title: t('productAdded'), 
          description: language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully',
          variant: 'success' 
        });
      }

      resetForm();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setToast({ 
        open: true, 
        title: t('error'), 
        description: language === 'ar' 
          ? `حدث خطأ أثناء حفظ المنتج: ${err.message || 'يرجى المحاولة مرة أخرى'}`
          : `Error saving product: ${err.message || 'Please try again'}`,
        variant: 'error' 
      });
    } finally {
      setLoading(false);
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
        description: language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
        variant: 'success' 
      });
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setToast({ 
        open: true, 
        title: t('error'), 
        description: language === 'ar' 
          ? `حدث خطأ أثناء حذف المنتج: ${err.message || 'يرجى المحاولة مرة أخرى'}`
          : `Error deleting product: ${err.message || 'Please try again'}`,
        variant: 'error' 
      });
    }
  };

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      setIsProcessingAction(orderId);
      const status = action === 'accept' ? 'processing' : 'cancelled';
      await updateOrderStatus.mutateAsync({ orderId, status });
      
      setToast({ 
        open: true, 
        title: action === 'accept' 
          ? (language === 'ar' ? 'تم قبول الطلب' : 'Order accepted')
          : (language === 'ar' ? 'تم رفض الطلب' : 'Order rejected'),
        description: language === 'ar' 
          ? `تم تغيير حالة الطلب إلى ${action === 'accept' ? 'قيد التجهيز' : 'ملغي'}`
          : `Order status changed to ${action === 'accept' ? 'Processing' : 'Cancelled'}`,
        variant: action === 'accept' ? 'success' : 'warning'
      });
      
      setOrderToAction(null);
      await refetchOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setToast({ 
        open: true, 
        title: t('error'), 
        description: language === 'ar' 
          ? `حدث خطأ أثناء تحديث حالة الطلب: ${err.message || 'يرجى المحاولة مرة أخرى'}`
          : `Error updating order status: ${err.message || 'Please try again'}`,
        variant: 'error' 
      });
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsProcessingAction(orderId);
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      setToast({ 
        open: true, 
        title: t('statusUpdated'), 
        description: language === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully',
        variant: 'success' 
      });
      await refetchOrders();
    } catch (err: any) {
      console.error('Error changing status:', err);
      setToast({ 
        open: true, 
        title: t('error'), 
        description: language === 'ar' 
          ? `حدث خطأ أثناء تحديث حالة الطلب: ${err.message || 'يرجى المحاولة مرة أخرى'}`
          : `Error updating order status: ${err.message || 'Please try again'}`,
        variant: 'error' 
      });
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsProcessingAction(orderId);
      await deleteOrderMutation.mutateAsync(orderId);
      setToast({ 
        open: true, 
        title: language === 'ar' ? 'تم حذف الطلب' : 'Order deleted',
        description: language === 'ar' ? 'تم حذف الطلب بنجاح من النظام' : 'Order deleted successfully from the system',
        variant: 'success' 
      });
      setDeleteOrderConfirm(null);
      await refetchOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setToast({ 
        open: true, 
        title: t('error'), 
        description: language === 'ar' 
          ? `حدث خطأ أثناء حذف الطلب: ${err.message || 'يرجى المحاولة مرة أخرى'}`
          : `Error deleting order: ${err.message || 'Please try again'}`,
        variant: 'error' 
      });
    } finally {
      setIsProcessingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'processing': return <PackageIcon className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <PackageCheckIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <PackageIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportOrders = () => {
    if (!orders) return;
    
    const csvContent = [
      ['Order ID', 'Customer Name', 'Phone', 'Total Amount', 'Status', 'Date', 'Address', 'Notes'],
      ...orders.map(order => [
        order.id,
        order.customer_name,
        order.customer_phone,
        order.total_amount,
        order.status,
        formatDate(order.created_at),
        `${order.governorate} - ${order.delivery_address}`,
        order.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  return (
    <div className="transition-page min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t('dashboard')}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowProductForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
            >
              <PlusIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('addProduct')}
            </Button>
            <Button
              onClick={exportOrders}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 font-normal"
            >
              <Download className="w-4 h-4 me-2" strokeWidth={2} />
              {language === 'ar' ? 'تصدير الطلبات' : 'Export Orders'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-muted text-muted-foreground mb-6">
            <TabsTrigger value="orders" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <ShoppingBagIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('ordersList')}
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <PackageIcon className="w-4 h-4 me-2" strokeWidth={2} />
              {t('productList')}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6 bg-card text-card-foreground border-border hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Order Header */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                              #{order.id.slice(-8)}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {t(`status_${order.status}` as any)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <User className="w-4 h-4" />
                              <span>{order.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span dir="ltr">{order.customer_phone}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{order.governorate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Home className="w-4 h-4" />
                              <span className="text-sm">{order.delivery_address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Actions & Total */}
                      <div className="flex flex-col items-end justify-between gap-4 min-w-[280px]">
                        <div className="text-end space-y-1">
                          <p className="text-sm text-muted-foreground">{t('total')}</p>
                          <p className="text-2xl font-bold text-primary">
                            {order.total_amount.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="w-4 h-4" />
                            <span>{order.delivery_type === 'delivery' ? (language === 'ar' ? 'توصيل' : 'Delivery') : (language === 'ar' ? 'استلام' : 'Pickup')}</span>
                          </div>
                        </div>
                        
                        <div className="w-full space-y-3">
                          {/* Action Buttons */}
                          {order.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm" 
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                                onClick={() => setOrderToAction({ id: order.id, action: 'accept' })}
                                disabled={isProcessingAction === order.id}
                              >
                                {isProcessingAction === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircleIcon className="w-4 h-4 me-1" />
                                    {language === 'ar' ? 'قبول' : 'Accept'}
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="w-full"
                                onClick={() => setOrderToAction({ id: order.id, action: 'reject' })}
                                disabled={isProcessingAction === order.id}
                              >
                                {isProcessingAction === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircleIcon className="w-4 h-4 me-1" />
                                    {language === 'ar' ? 'رفض' : 'Reject'}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Status Selector */}
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={isProcessingAction === order.id}
                          >
                            <SelectTrigger className="w-full">
                              {isProcessingAction === order.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>{language === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                                </div>
                              ) : (
                                <SelectValue placeholder={t('orderStatus')} />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="w-4 h-4" />
                                  {t('status_pending')}
                                </div>
                              </SelectItem>
                              <SelectItem value="processing">
                                <div className="flex items-center gap-2">
                                  <PackageIcon className="w-4 h-4" />
                                  {t('status_processing')}
                                </div>
                              </SelectItem>
                              <SelectItem value="shipped">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4" />
                                  {t('status_shipped')}
                                </div>
                              </SelectItem>
                              <SelectItem value="delivered">
                                <div className="flex items-center gap-2">
                                  <PackageCheckIcon className="w-4 h-4" />
                                  {t('status_delivered')}
                                </div>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <div className="flex items-center gap-2">
                                  <XCircleIcon className="w-4 h-4" />
                                  {t('status_cancelled')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Delete Button */}
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                            onClick={() => setDeleteOrderConfirm(order.id)}
                            disabled={isProcessingAction === order.id}
                          >
                            {isProcessingAction === order.id ? (
                              <Loader2 className="w-4 h-4 me-1 animate-spin" />
                            ) : (
                              <>
                                <Trash2Icon className="w-4 h-4 me-1" />
                                {language === 'ar' ? 'حذف الطلب' : 'Delete Order'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBagIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
                <p className="text-muted-foreground text-lg">
                  {t('noOrders')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-6 bg-card text-card-foreground border-border hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={product.image_url}
                        alt={language === 'ar' ? product.name_ar : product.name}
                        className="w-full md:w-40 h-40 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
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
                              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                                {product.quantity} {language === 'ar' ? 'قطعة' : 'pieces'}
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
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(product)}
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-none"
                          >
                            <EditIcon className="w-4 h-4 me-2" strokeWidth={2} />
                            {t('edit')}
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(product.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-none border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2Icon className="w-4 h-4 me-2" strokeWidth={2} />
                            {t('delete')}
                          </Button>
                        </div>
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
                  {t('price')} ({language === 'ar' ? 'ل.س' : 'SAR'})
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t('confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4">
            {language === 'ar' 
              ? 'هل أنت متأكد من حذف هذا المنتج؟ هذا الإجراء لا يمكن التراجع عنه.'
              : 'Are you sure you want to delete this product? This action cannot be undone.'}
          </p>
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

      {/* Delete Order Confirmation */}
      <Dialog open={!!deleteOrderConfirm} onOpenChange={(open) => !open && setDeleteOrderConfirm(null)}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {language === 'ar' ? 'تأكيد حذف الطلب' : 'Confirm Order Deletion'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4">
            {language === 'ar' 
              ? '⚠️ هل أنت متأكد من حذف هذا الطلب؟ سيتم حذف الطلب نهائياً من قاعدة البيانات ولا يمكن استعادته.'
              : '⚠️ Are you sure you want to delete this order? The order will be permanently deleted from the database and cannot be recovered.'}
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {language === 'ar' 
                ? '⚠️ تحذير: سيتم حذف الطلب من حساب المستخدم أيضاً.'
                : '⚠️ Warning: The order will also be deleted from the user\'s account.'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOrderConfirm(null)}
              className="bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => deleteOrderConfirm && handleDeleteOrder(deleteOrderConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-normal"
              disabled={isProcessingAction === deleteOrderConfirm}
            >
              {isProcessingAction === deleteOrderConfirm ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {language === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2Icon className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'نعم، احذف الطلب' : 'Yes, Delete Order'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Action Confirmation */}
      <Dialog open={!!orderToAction} onOpenChange={(open) => !open && setOrderToAction(null)}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {orderToAction?.action === 'accept' ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  {language === 'ar' ? 'تأكيد قبول الطلب' : 'Confirm Order Acceptance'}
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  {language === 'ar' ? 'تأكيد رفض الطلب' : 'Confirm Order Rejection'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-4">
            {orderToAction?.action === 'accept' 
              ? (language === 'ar' 
                  ? 'هل تريد قبول هذا الطلب وتغيير حالته إلى "قيد التجهيز"؟'
                  : 'Do you want to accept this order and change its status to "Processing"?')
              : (language === 'ar' 
                  ? 'هل تريد رفض هذا الطلب وتغيير حالته إلى "ملغي"؟'
                  : 'Do you want to reject this order and change its status to "Cancelled"?')}
          </p>
          <div className={`p-4 rounded-lg mb-4 ${
            orderToAction?.action === 'accept' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm ${
              orderToAction?.action === 'accept' 
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {orderToAction?.action === 'accept' 
                ? (language === 'ar' 
                    ? '✅ سيظهر للمستخدم في حسابه أن طلبه قيد التجهيز'
                    : '✅ The user will see in their account that their order is being processed')
                : (language === 'ar' 
                    ? '❌ سيظهر للمستخدم في حسابه أن طلبه مرفوض'
                    : '❌ The user will see in their account that their order is rejected')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOrderToAction(null)}
              className="bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              disabled={isProcessingAction === orderToAction?.id}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => orderToAction && handleOrderAction(orderToAction.id, orderToAction.action)}
              className={orderToAction?.action === 'accept' 
                ? 'bg-green-600 text-white hover:bg-green-700 font-normal'
                : 'bg-red-600 text-white hover:bg-red-700 font-normal'
              }
              disabled={isProcessingAction === orderToAction?.id}
            >
              {isProcessingAction === orderToAction?.id ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : null}
              {orderToAction?.action === 'accept' 
                ? (language === 'ar' ? 'نعم، قَبِل الطلب' : 'Yes, Accept Order')
                : (language === 'ar' ? 'نعم، ارفض الطلب' : 'Yes, Reject Order')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
    </div>
  );
};