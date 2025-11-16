import React, { useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { XIcon } from 'lucide-react';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  const variantStyles = {
    default: 'bg-card text-card-foreground border-border',
    success: 'bg-success text-success-foreground border-success',
    error: 'bg-destructive text-destructive-foreground border-destructive',
    warning: 'bg-warning text-warning-foreground border-warning',
  };

  return (
    <ToastPrimitive.Provider swipeDirection="left">
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        className={`${variantStyles[variant]} border rounded-lg shadow-lg p-4 flex items-start gap-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-full`}
      >
        <div className="flex-1">
          <ToastPrimitive.Title className="font-semibold text-sm">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="text-sm mt-1 opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="text-current opacity-70 hover:opacity-100 transition-opacity">
          <XIcon className="w-4 h-4" strokeWidth={2} />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-full max-w-md z-50" />
    </ToastPrimitive.Provider>
  );
};
