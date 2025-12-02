import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '../components/ui/navigation-menu';
import { 
  MenuIcon, 
  XIcon, 
  UserIcon, 
  LogOutIcon, 
  ShoppingCartIcon, 
  Instagram, 
  Heart, 
  Search,
  Home,
  Info,
  ShoppingBag,
  Phone,
  Package,
  Settings,
  PlusCircle,
  ClipboardList,
  ChevronRight,
  LogIn,
  UserPlus,
  Bell,
  Star,
  Store,
  Package2,
  Tag,
  Globe,
  Moon,
  Sun,
  ShoppingCart,
  MapPin,
  CreditCard,
  Shield,
  Award,
  Truck,
  Clock
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { supabase } from '../lib/supabaseClient';

export const TopNav: React.FC = () => {
  const { language, theme } = useAppStore();
  const { user, isAdmin, isGuest, logout } = useAuthStore();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: cartItems } = useCart(user?.id);
  const { data: favoriteItems } = useFavorites(user?.id);
  
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoriteCount = favoriteItems?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // تعريف الأيقونات لكل عنصر
  const navItems = [
    { label: t('home'), path: '/', icon: Home, color: 'text-blue-500',  },
    { label: t('about'), path: '/about', icon: Info, color: 'text-green-500',  },
    { label: t('products'), path: '/products', icon: ShoppingBag, color: 'text-purple-500',},
    { label: t('contact'), path: '/contact', icon: Phone, color: 'text-pink-500',  },
  ];

  if (user && !isAdmin && !isGuest) {
    navItems.push(
      { label: t('myOrders'), path: '/orders', icon: Package, color: 'text-orange-500',  },
      { label: t('favorites'), path: '/favorites', icon: Heart, color: 'text-red-500',  }
    );
  }

  if (isAdmin) {
    navItems.push(
      { label: t('admin'), path: '/admin', icon: Settings, color: 'text-yellow-500', },
      { label: t('addProduct'), path: '/admin/add', icon: PlusCircle, color: 'text-teal-500',  }
    );
  }

  const instagramUrl = "https://www.instagram.com/aldeek_alfiddi?igsh=MTZ5MHNubzVzaDczaA%3D%3D&utm_source=qr";

  return (
    <nav className={`
      /* خلفية غير شفافة في الموبايل، شفافة في الشاشات الكبيرة */
      lg:bg-card/95 lg:backdrop-blur-md
      bg-card
      text-card-foreground border-b border-border/50 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-xl lg:bg-card/98 lg:backdrop-blur-lg shadow-lg' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo - تم التعديل هنا فقط للموبايل */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              {/* التعديل: في الموبايل فقط - أكبر قليلاً وأكثر دائرية */}
              <img 
                src="src/asset/IMG_0192.JPG" 
                alt={t('siteName')}
                className="
                  /* أحجام الموبايل (أقل من 640px) */
                  w-16 h-16 rounded-2xl 
                  /* أحجام الشاشات الصغيرة فما فوق (640px فأكثر) */
                  sm:w-14 sm:h-14 sm:rounded-xl
                  /* أحجام متوسطة وكبيرة بدون تغيير */
                  md:w-14 md:h-14 md:rounded-xl
                  lg:w-14 lg:h-14 lg:rounded-xl
                  xl:w-14 xl:h-14 xl:rounded-xl
                  object-contain shadow-lg group-hover:shadow-xl transition-all duration-300 
                  border-2 border-primary/20 group-hover:border-primary/40
                "
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl -z-10 transform rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            
            {/* إضافة اسم الموقع بجانب اللوغو في الموبايل */}
            <div className="block sm:hidden">
              <div className="flex flex-col">
                <h1 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                  {t('siteName')}
                </h1>
                <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 truncate max-w-[120px]">
                  {t('siteTagline')}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {t('siteName')}
              </h1>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                {t('siteTagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - بدون تغيير */}
          <div className="hidden lg:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavigationMenuItem key={item.path}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.path}
                          className={`px-4 py-2 transition-all font-medium cursor-pointer rounded-lg relative group flex items-center gap-2 ${
                            location.pathname === item.path 
                              ? 'text-primary bg-primary/10' 
                              : 'text-foreground hover:text-primary hover:bg-muted/50'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" strokeWidth={2} />
                          {item.label}
                          <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                            location.pathname === item.path ? 'w-3/4' : 'w-0 group-hover:w-3/4'
                          }`} />
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <LanguageToggle />
                <ThemeToggle />
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-foreground hover:text-pink-500 transition-all duration-300 hover:scale-110 rounded-lg"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" strokeWidth={2} />
                </a>
              </div>
              
              {/* Action Buttons */}
              {user && !isAdmin && !isGuest && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/favorites')}
                    variant="ghost"
                    size="icon"
                    className="bg-transparent text-foreground hover:text-red-500 hover:bg-red-50 relative rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-300 ${
                        favoriteCount > 0 ? 'fill-red-500 text-red-500' : ''
                      }`} 
                      strokeWidth={2} 
                    />
                    {favoriteCount > 0 && (
                      <span className="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {favoriteCount > 9 ? '9+' : favoriteCount}
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/cart')}
                    variant="ghost"
                    size="icon"
                    className="bg-transparent text-foreground hover:text-primary hover:bg-primary/10 relative rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCartIcon className="w-5 h-5" strokeWidth={2} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              
              {/* User Section */}
              {user || isGuest ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <div className={`w-8 h-8 ${isGuest ? 'bg-muted' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105`}>
                      <UserIcon className={`w-4 h-4 ${isGuest ? 'text-muted-foreground' : 'text-white'}`} strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-foreground hidden xl:block">
                      {isGuest ? (language === 'ar' ? 'ضيف' : 'Guest') : user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive font-normal rounded-lg transition-all duration-300"
                  >
                    <LogOutIcon className="w-4 h-4 me-2" strokeWidth={2} />
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal rounded-lg transition-all duration-300"
                  >
                    {t('login')}
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 font-normal shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg hover:scale-105"
                  >
                    {t('signup')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-2">
            {/* Search Button Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-transparent text-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
            >
              {/* <Search className="w-5 h-5" /> */}
            </Button>

            {/* Favorite & Cart Buttons */}
            {user && !isAdmin && !isGuest && (
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => navigate('/favorites')}
                  variant="ghost"
                  size="icon"
                  className="bg-transparent text-foreground hover:text-red-500 hover:bg-red-50 relative transition-all duration-300"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 ${
                      favoriteCount > 0 ? 'fill-red-500 text-red-500' : ''
                    }`} 
                    strokeWidth={2} 
                  />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg">
                      {favoriteCount}
                    </span>
                  )}
                </Button>
                
                <Button
                  onClick={() => navigate('/cart')}
                  variant="ghost"
                  size="icon"
                  className="bg-transparent text-foreground hover:text-primary hover:bg-primary/10 relative transition-all duration-300"
                >
                  <ShoppingCartIcon className="w-5 h-5" strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
            
            <LanguageToggle />
            <ThemeToggle />
            
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-foreground hover:text-pink-500 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" strokeWidth={2} />
            </a>

            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="bg-transparent text-foreground hover:bg-muted hover:text-foreground transition-all duration-300 relative group"
            >
              <div className="relative">
                {mobileMenuOpen ? (
                  <XIcon className="w-6 h-6 transform transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                ) : (
                  <MenuIcon className="w-6 h-6 transform transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                )}
                {/* Animated Dots */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  <div className={`w-1 h-1 rounded-full bg-primary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                  <div className={`w-1 h-1 rounded-full bg-primary transition-all duration-300 delay-75 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                  <div className={`w-1 h-1 rounded-full bg-primary transition-all duration-300 delay-150 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - تصميم جديد مع خلفية غير شفافة */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
        mobileMenuOpen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none delay-300'
      }`}>
        {/* Overlay - ضبابية قوية جداً */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ${
            mobileMenuOpen 
              ? 'opacity-100 bg-black/80 backdrop-blur-xl' 
              : 'opacity-0 bg-black/0 backdrop-blur-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Side Menu Panel - خلفية صلبة غير شفافة */}
        <div 
          className={`absolute top-0 h-full w-80 max-w-[85vw] bg-card border-l border-border/50 shadow-2xl transition-all duration-700 ease-out ${
            language === 'ar' 
              ? 'right-0 origin-right' 
              : 'left-0 origin-left'
          } ${
            mobileMenuOpen 
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
                    src="src/asset/IMG_0192.JPG" 
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
                onClick={() => setMobileMenuOpen(false)}
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
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-11 rounded-xl text-sm"
                >
                  <LogIn className="w-4 h-4 me-2" />
                  {t('login')}
                </Button>
                <Button
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 h-11 rounded-xl text-sm"
                >
                  <UserPlus className="w-4 h-4 me-2" />
                  {t('signup')}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="px-5 py-3 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-foreground">سريع</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">توصيل</p>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground">آمن</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">دفع</p>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-foreground">جودة</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">مضمونة</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
            </h3>
            
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 transform hover:translate-x-1 ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30' 
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                  style={{
                    animation: mobileMenuOpen ? `slideIn 0.5s ease-out ${index * 0.1}s both` : 'none'
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
                {user && !isAdmin && !isGuest && (
                  <>
                    <Button
                      onClick={() => {
                        navigate('/cart');
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="justify-start h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border border-blue-500/20"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <ShoppingCart className="w-5 h-5 text-blue-500" />
                          {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {cartCount}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{t('cart')}</p>
                          <p className="text-xs text-muted-foreground">{cartCount} {language === 'ar' ? 'عنصر' : 'items'}</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        navigate('/favorites');
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="justify-start h-14 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border border-red-500/20"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Heart className="w-5 h-5 text-red-500" fill={favoriteCount > 0 ? "currentColor" : "none"} />
                          {favoriteCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {favoriteCount}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{t('favorites')}</p>
                          <p className="text-xs text-muted-foreground">{favoriteCount} {language === 'ar' ? 'مفضل' : 'favs'}</p>
                        </div>
                      </div>
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => {
                    window.open(instagramUrl, '_blank');
                    setMobileMenuOpen(false);
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
                
                <Button
                  onClick={user ? handleLogout : () => {
                    navigate('/login');
                    setMobileMenuOpen(false);
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

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(${language === 'ar' ? '20px' : '-20px'});
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5));
        }
      `}</style>
    </nav>
  );
};