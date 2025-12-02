import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useCreateOrder } from '../hooks/useOrders';
import { Product } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dailog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Toast } from './Toast';
import { TruckIcon, MapPinIcon, HomeIcon, Building2Icon, MessageSquareIcon, CheckCircleIcon, StoreIcon } from 'lucide-react';
// import { RadioGroup, RadioGroupItem } from '../components/ui/r';

interface DeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  cartItems: { id: string; product_id: string; quantity: number; product: Product }[];
  initialDeliveryType?: 'pickup' | 'delivery';
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ open, onOpenChange, userId, cartItems, initialDeliveryType = 'delivery' }) => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = useTranslation(language);
  const createOrder = useCreateOrder();
  const { user } = useAuthStore();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>(initialDeliveryType);
  const [deliveryData, setDeliveryData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryLocation: '',
    governorate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });

  // Auto-fill user data if available
  useEffect(() => {
    if (user) {
      // Fetch user profile data if available (assuming it's stored in user metadata or a separate profile table)
      // For now, we'll use the user object if it has these fields (which we added to the interface)
      setDeliveryData(prev => ({
        ...prev,
        name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user, open]);

  useEffect(() => {
    setDeliveryType(initialDeliveryType);
  }, [initialDeliveryType, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [id]: value }));
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const deliveryCost = deliveryType === 'delivery' ? 2500 : 0; // Example delivery cost
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + deliveryCost;

    try {
      await createOrder.mutateAsync({
        userId,
        cartItems,
        deliveryData: {
          address: deliveryType === 'delivery' ? deliveryData.address : 'Store Pickup',
          deliveryLocation: deliveryType === 'delivery' ? deliveryData.deliveryLocation : 'Store',
          governorate: deliveryType === 'delivery' ? deliveryData.governorate : 'Damascus',
          notes: deliveryData.notes,
          deliveryType,
          deliveryCost
        },
        customerData: {
          name: deliveryData.name,
          phone: deliveryData.phone,
        },
        totalAmount
      });

      setToast({
        open: true,
        title: t('deliverySuccess'),
        variant: 'success',
      });
      onOpenChange(false); // Close modal
      navigate('/orders'); // Navigate to orders page
    } catch (error) {
      console.error('Delivery confirmation error:', error);
      setToast({
        open: true,
        title: t('deliveryError'),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {deliveryType === 'delivery' ? (
                  <TruckIcon className="w-8 h-8 text-primary" strokeWidth={2} />
                ) : (
                  <StoreIcon className="w-8 h-8 text-primary" strokeWidth={2} />
                )}
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-serif font-bold text-foreground">
              {t('confirmDelivery')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleConfirmDelivery} className="space-y-5 py-4">
            {/* Delivery Type Selection */}
            <div className="flex justify-center mb-4">
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    deliveryType === 'delivery' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('delivery')}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    deliveryType === 'pickup' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('pickup')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name (Auto-filled but editable) */}
              <div>
                <Label htmlFor="name" className="text-foreground mb-2 block font-medium">
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={deliveryData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  className="bg-background text-foreground border-border h-12"
                />
              </div>

              {/* Phone (Auto-filled but editable) */}
              <div>
                <Label htmlFor="phone" className="text-foreground mb-2 block font-medium">
                  {t('phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={deliveryData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+963..."
                  className="bg-background text-foreground border-border h-12"
                  dir="ltr"
                />
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <>
                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-foreground mb-2 block font-medium">
                    {t('deliveryAddress')}
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={deliveryData.address}
                    onChange={handleInputChange}
                    required
                    placeholder={language === 'ar' ? 'مثال: شارع الحمراء، بناء رقم 123' : 'Ex: Hamra Street, Building #123'}
                    className="bg-background text-foreground border-border h-12"
                  />
                </div>

                {/* Delivery Location */}
                <div>
                  <Label htmlFor="deliveryLocation" className="text-foreground mb-2 block font-medium">
                    {t('deliveryLocation')}
                  </Label>
                  <Input
                    id="deliveryLocation"
                    type="text"
                    value={deliveryData.deliveryLocation}
                    onChange={handleInputChange}
                    required
                    placeholder={language === 'ar' ? 'مثال: بالقرب من حديقة عامة' : 'Ex: Near Public Garden'}
                    className="bg-background text-foreground border-border h-12"
                  />
                </div>

                {/* Governorate */}
                <div>
                  <Label htmlFor="governorate" className="text-foreground mb-2 block font-medium">
                    {t('governorate')}
                  </Label>
                  <Input
                    id="governorate"
                    type="text"
                    value={deliveryData.governorate}
                    onChange={handleInputChange}
                    required
                    placeholder={language === 'ar' ? 'مثال: دمشق' : 'Ex: Damascus'}
                    className="bg-background text-foreground border-border h-12"
                  />
                </div>
              </>
            )}

            {/* Order Notes */}
            <div>
              <Label htmlFor="notes" className="text-foreground mb-2 block font-medium">
                {t('orderNotes')}
              </Label>
              <Textarea
                id="notes"
                value={deliveryData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder={language === 'ar' ? 'أي ملاحظات إضافية لطلبك...' : 'Any additional notes for your order...'}
                className="bg-background text-foreground border-border"
              />
            </div>

            {/* Cost Summary */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span>{t('deliveryCost')}</span>
                <span>{deliveryType === 'delivery' ? '2,500' : '0'} {language === 'ar' ? 'ل.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span className="text-primary">
                  {(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + (deliveryType === 'delivery' ? 2500 : 0)).toLocaleString()} {language === 'ar' ? 'ل.س' : 'SAR'}
                </span>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-3 sm:flex-col pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium shadow-lg"
                size="lg"
              >
                <CheckCircleIcon className="w-5 h-5 me-2" strokeWidth={2} />
                {loading ? (language === 'ar' ? 'جاري التأكيد...' : 'Confirming...') : t('confirmDelivery')}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-medium"
                size="lg"
              >
                {t('cancel')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
    </>
  );
};
