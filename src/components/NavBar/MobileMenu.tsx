// components/NavBar/MobileMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  XIcon, 
  UserIcon, 
  LogOutIcon,
  Instagram,
  Heart,
  ShoppingCart,
  LogIn,
  UserPlus,
  ChevronRight,
  Globe,
  Moon,
  Sun,
  Package,
  Home,
  Info,
  ShoppingBag,
  Phone,
  Settings
} from 'lucide-react';
import { LanguageToggle } from '../LanguageToggle';
import { ThemeToggle } from '../ThemeToggle';
import { useAppStore } from '../../stores/useAppStore';
import { navItems } from './NavItems';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
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

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
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
  const { theme } = useAppStore();
  const items = navItems({ language, user, isAdmin, isGuest, t });

  return (
    <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
      isOpen 
        ? 'opacity-100 pointer-events-auto' 
        : 'opacity-0 pointer-events-none delay-300'
    }`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ${
          isOpen 
            ? 'opacity-100 bg-black/80 backdrop-blur-xl' 
            : 'opacity-0 bg-black/0 backdrop-blur-0'
        }`}
        onClick={onClose}
      />
      
      {/* Side Menu Panel */}
      <div 
        className={`absolute top-0 h-full w-80 max-w-[85vw] bg-card border-l border-border/50 shadow-2xl transition-all duration-700 ease-out ${
          language === 'ar' 
            ? 'right-0 origin-right' 
            : 'left-0 origin-left'
        } ${
          isOpen 
            ? 'translate-x-0 opacity-100' 
            : language === 'ar'
              ? 'translate-x-full opacity-0'
              : '-translate-x-full opacity-0'
        }`}
      >
        {/* Header Section */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://c.animaapp.com/mhx6z2hgaXoALR/img/img_0192.JPG"
                  alt={t('siteName')}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-primary/30 shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl -z-10" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  {t('siteName')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('siteTagline')}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted/50 hover:bg-muted hover:scale-110 transition-all duration-300"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          {user ? (
            <div className="bg-gradient-to-r from-primary/15 to-primary/10 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${
                  isGuest 
                    ? 'bg-muted' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                } rounded-full flex items-center justify-center shadow-lg`}>
                  <UserIcon className={`w-6 h-6 ${
                    isGuest ? 'text-muted-foreground' : 'text-white'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">
                    {isGuest ? (language === 'ar' ? 'ضيف' : 'Guest') : user?.email?.split('@')[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  {!isGuest && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isAdmin 
                          ? 'bg-yellow-500/20 text-yellow-600' 
                          : 'bg-green-500/20 text-green-600'
                      }`}>
                        {isAdmin ? '👑 ' + (language === 'ar' ? 'مدير' : 'Admin') : '👤 ' + (language === 'ar' ? 'مستخدم' : 'User')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  navigate('/login');
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-11 rounded-xl text-sm"
              >
                <LogIn className="w-4 h-4 me-2" />
                {t('login')}
              </Button>
              <Button
                onClick={() => {
                  navigate('/signup');
                  onClose();
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 h-11 rounded-xl text-sm"
              >
                <UserPlus className="w-4 h-4 me-2" />
                {t('signup')}
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </h3>
          
          {items.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 transform hover:translate-x-1 ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30' 
                    : 'hover:bg-muted/50 text-foreground'
                }`}
                style={{
                  animation: isOpen ? `slideIn 0.5s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/20 scale-110' 
                    : 'bg-muted group-hover:scale-105'
                }`}>
                  <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'scale-110' : ''
                  } ${item.color}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5'
                }`} />
              </Link>
            );
          })}

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              {language === 'ar' ? 'أدوات سريعة' : 'Quick Tools'}
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {/* سلة المشتريات */}
              {(user || isGuest) && !isAdmin && (
                <Button
                  onClick={() => {
                    navigate('/cart');
                    onClose();
                  }}
                  variant="ghost"
                  className="justify-start h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border border-blue-500/20 relative"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5 text-blue-500" />
                      {cartCount > 0 && (
                        <>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                            {cartCount > 9 ? '9+' : cartCount}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{t('cart')}</p>
                      <p className="text-xs text-muted-foreground">
                        {cartCount} {language === 'ar' ? 'عنصر' : 'items'}
                      </p>
                    </div>
                  </div>
                </Button>
              )}
              
              {/* المفضلة */}
              {user && !isAdmin && !isGuest && (
                <Button
                  onClick={() => {
                    navigate('/favorites');
                    onClose();
                  }}
                  variant="ghost"
                  className="justify-start h-14 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border border-red-500/20 relative"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <Heart className="w-5 h-5 text-red-500" fill={favoriteCount > 0 ? "currentColor" : "none"} />
                      {favoriteCount > 0 && (
                        <>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                            {favoriteCount > 9 ? '9+' : favoriteCount}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{t('favorites')}</p>
                      <p className="text-xs text-muted-foreground">
                        {favoriteCount} {language === 'ar' ? 'مفضل' : 'favs'}
                      </p>
                    </div>
                  </div>
                </Button>
              )}
              
              {/* إنستجرام */}
              <Button
                onClick={() => {
                  window.open(instagramUrl, '_blank');
                  onClose();
                }}
                variant="ghost"
                className="justify-start h-14 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 hover:from-pink-500/20 hover:to-pink-500/10 border border-pink-500/20"
              >
                <div className="flex items-center gap-3 w-full">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Instagram</p>
                    <p className="text-xs text-muted-foreground">@{'aldeek_alfiddi'}</p>
                  </div>
                </div>
              </Button>
              
              {/* تسجيل الدخول/الخروج */}
              <Button
                onClick={user ? handleLogout : () => {
                  navigate('/login');
                  onClose();
                }}
                variant="ghost"
                className={`justify-start h-14 rounded-xl ${
                  user 
                    ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border border-red-500/20' 
                    : 'bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border border-green-500/20'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  {user ? (
                    <>
                      <LogOutIcon className="w-5 h-5 text-red-500" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{t('logout')}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'خروج آمن' : 'Secure logout'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{t('login')}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'دخول سريع' : 'Quick login'}</p>
                      </div>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {language === 'ar' ? 'اللغة' : 'Language'}
              </span>
            </div>
            <LanguageToggle />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {theme === 'dark' ? (language === 'ar' ? 'المظهر الداكن' : 'Dark Theme') : (language === 'ar' ? 'المظهر الفاتح' : 'Light Theme')}
              </span>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              {t('siteName')} © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};