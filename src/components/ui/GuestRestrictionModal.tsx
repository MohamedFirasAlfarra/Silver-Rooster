import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, UserPlusIcon, LogInIcon } from 'lucide-react';
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

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/login');
  };

  const handleSignup = () => {
    onOpenChange(false);
    navigate('/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
              <LockIcon className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-serif font-bold text-foreground">
            {t('guestRestriction')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-muted-foreground leading-relaxed">
            {t('guestRestrictionMessage')}
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 font-medium shadow-lg"
            size="lg"
          >
            <LogInIcon className="w-5 h-5 me-2" strokeWidth={2} />
            {t('loginNow')}
          </Button>
          
          <Button
            onClick={handleSignup}
            variant="outline"
            className="w-full bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground font-medium"
            size="lg"
          >
            <UserPlusIcon className="w-5 h-5 me-2" strokeWidth={2} />
            {t('createAccount')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
