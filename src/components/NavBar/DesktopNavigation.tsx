// components/NavBar/DesktopNavigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LanguageToggle } from '../LanguageToggle';
import { ThemeToggle } from '../ThemeToggle';
import { 
  Heart, 
  ShoppingCart, 
  UserIcon, 
  LogOutIcon,
  Instagram,
  LogIn,
  UserPlus,
  Settings
} from 'lucide-react';
import { navItems } from './NavItems';

interface DesktopNavigationProps {
  language: string;
  location: any;
  user: any;
  isAdmin: boolean;
  isGuest: boolean;
  t: (key: string) => string;
  cartCount: number;
  favoriteCount: number;
  instagramUrl: string;
  handleLogout: () => void;
  navigate: (path: string) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  language,
  location,
  user,
  isAdmin,
  isGuest,
  t,
  cartCount,
  favoriteCount,
  instagramUrl,
  handleLogout,
  navigate
}) => {
  const items = navItems({ language, user, isAdmin, isGuest, t });

  return (
    <div className="hidden lg:flex items-center gap-6">
      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 transition-all duration-300 group ${
                isActive 
                  ? 'text-primary font-semibold' 
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
              <span className="relative">
                {item.label}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                  isActive ? 'w-full' : ''
                }`}></span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* سلة المشتريات */}
      {(user || isGuest) && !isAdmin && (
        <Button
          onClick={() => navigate('/cart')}
          variant="ghost"
          size="sm"
          className="relative text-foreground/80 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
        >
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          {cartCount > 0 && (
            <>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border border-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            </>
          )}
        </Button>
      )}

      {/* المفضلة */}
      {user && !isAdmin && !isGuest && (
        <Button
          onClick={() => navigate('/favorites')}
          variant="ghost"
          size="sm"
          className="relative text-foreground/80 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <Heart 
            className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 ${
              favoriteCount > 0 ? 'fill-red-500 text-red-500' : ''
            }`} 
          />
          {favoriteCount > 0 && (
            <>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border border-white">
                {favoriteCount > 9 ? '9+' : favoriteCount}
              </span>
            </>
          )}
        </Button>
      )}

      {/* إنستجرام */}
      <a 
        href={instagramUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-foreground/80 hover:text-pink-500 transition-all duration-300 p-1 hover:scale-110"
        aria-label="Instagram"
      >
        <Instagram className="w-5 h-5" />
      </a>

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Language Toggle */}
      <LanguageToggle />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* User Actions */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            {/* لوحة التحكم للمسؤول */}
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-yellow-600 hover:bg-yellow-50"
              >
                <Settings className="w-5 h-5 me-2" />
                {t('dashboard')}
              </Button>
            )}
            
            {/* معلومات المستخدم */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium truncate max-w-[120px]">
                  {user.email?.split('@')[0] || t('profile')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? '👑 Admin' : isGuest ? '👤 Guest' : '👤 User'}
                </p>
              </div>
            </div>
            
            {/* زر تسجيل الخروج */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-red-600 hover:bg-red-50"
            >
              <LogOutIcon className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            {/* زر تسجيل الدخول */}
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <LogIn className="w-5 h-5 me-2" />
              {t('login')}
            </Button>
            
            {/* زر إنشاء حساب */}
            <Button
              onClick={() => navigate('/signup')}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white"
            >
              <UserPlus className="w-5 h-5 me-2" />
              {t('signup')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};