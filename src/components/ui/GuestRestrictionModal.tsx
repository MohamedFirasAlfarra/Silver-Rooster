import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, UserPlusIcon, LogInIcon, SparklesIcon, ShieldIcon, StarIcon } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useTranslation } from '../../lib/translations';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from './dailog';
import { Button } from './button';

interface GuestRestrictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestRestrictionModal: React.FC<GuestRestrictionModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleLogin = () => {
    onOpenChange(false);
    setTimeout(() => navigate('/login'), 400);
  };

  const handleSignup = () => {
    onOpenChange(false);
    setTimeout(() => navigate('/signup'), 400);
  };

  if (!open && !isVisible) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          open ? 'bg-black/70 backdrop-blur-xl' : 'bg-black/0 backdrop-blur-0'
        }`}
      >
        <DialogContent 
          className={`max-w-md w-full transform transition-all duration-300 ${
            open 
              ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-10' 
              : 'animate-out fade-out-0 zoom-out-95 slide-out-to-top-10'
          }`}
        >
          {/* تأثيرات الخلفية المتحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full animate-bounce delay-300"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/10 rounded-full animate-bounce delay-700"></div>
          
          <div className="relative bg-gradient-to-br from-card via-card/95 to-muted/30 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Header مع تدرج لوني */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <DialogHeader>
                <div className="flex justify-center mb-6 relative">
                  <div className="relative">
                    {/* تأثير دائري متحرك */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping delay-1000"></div>
                    <div className="absolute inset-4 bg-white/10 rounded-full animate-pulse"></div>
                    
                    {/* أيقونة القفل الرئيسية */}
                    <div className="relative w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                      <LockIcon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* النجوم المتحركة حول الأيقونة */}
                    <SparklesIcon className="absolute -top-2 -left-2 w-6 h-6 text-yellow-300 animate-spin delay-500" />
                    <StarIcon className="absolute -top-2 -right-2 w-5 h-5 text-yellow-200 animate-pulse delay-300" />
                    <ShieldIcon className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-200 animate-bounce delay-700" />
                  </div>
                </div>
                
                <DialogTitle className="text-center text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {t('guestRestriction')}
                </DialogTitle>
                
                <div className="text-center">
                  <p className="text-white/80 text-lg font-medium">
                    {language === 'ar' ? 'الوصول المميز في انتظارك' : 'Premium Access Awaits'}
                  </p>
                </div>
              </DialogHeader>
            </div>
            
            {/* Body */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  {t('guestRestrictionMessage')}
                </p>
                
                {/* ميزات الإشتراك */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center group hover:bg-primary/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <StarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'ar' ? 'ميزات حصرية' : 'Exclusive Features'}
                    </p>
                  </div>
                  
                  <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10 text-center group hover:bg-secondary/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <ShieldIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'ar' ? 'حماية وأمان' : 'Security & Safety'}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-4">
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 font-semibold text-lg py-6 shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 active:scale-95 group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <LogInIcon className="w-6 h-6 me-3 relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  <span className="relative z-10">{t('loginNow')}</span>
                </Button>
                
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  className="w-full bg-transparent text-card-foreground border-2 
                  border-primary/30 hover:border-primary hover:bg-primary/5 font-semibold text-lg py-6 
                  transition-all duration-300 transform hover:scale-105 active:scale-95 group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <UserPlusIcon className="w-6 h-6 me-3 relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  <span className="relative z-10">{t('createAccount')}</span>
                </Button>
              </DialogFooter>
            
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};