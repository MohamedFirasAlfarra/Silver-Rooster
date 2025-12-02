import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/button';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            العودة للخلف
          </Button>
          
          <Button
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/')}
            className="flex items-center gap-2 bg-primary text-primary-foreground"
          >
            <HomeIcon className="w-4 h-4" />
            {isAdmin ? 'الذهاب إلى لوحة التحكم' : 'الذهاب إلى الصفحة الرئيسية'}
          </Button>
        </div>
      </div>
    </div>
  );
};