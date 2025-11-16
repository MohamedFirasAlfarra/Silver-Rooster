import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '../components/ui/navigation-menu';
import { MenuIcon, XIcon, UserIcon, LogOutIcon, ShoppingCartIcon } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';

export const TopNav: React.FC = () => {
  const { language } = useAppStore();
  const { user, isAdmin, isGuest, logout } = useAuthStore();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: cartItems } = useCart(user?.id);
  
  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: t('home'), path: '/' },
    { label: t('about'), path: '/about' },
    { label: t('products'), path: '/products' },
    { label: t('contact'), path: '/contact' },
  ];

  if (user && !isAdmin && !isGuest) {
    navItems.push({ label: t('favorites'), path: '/favorites' });
    navItems.push({ label: t('cart'), path: '/cart' });
  }

  if (isAdmin) {
    navItems.push({ label: t('admin'), path: '/admin' });
  }

  return (
    <nav className="bg-card/95 backdrop-blur-md text-card-foreground border-b border-border/50 sticky top-0 z-40 transition-theme shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://c.animaapp.com/mhx6z2hgaXoALR/img/img_0192.JPG" 
              alt={t('siteName')}
              className="w-14 h-14 object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-all"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                {t('siteName')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('siteTagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-1">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className="px-4 py-2 text-foreground hover:text-primary transition-all font-medium cursor-pointer rounded-lg hover:bg-muted/50 relative group"
                      >
                        {item.label}
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300" />
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              
              {user && !isAdmin && !isGuest && (
                <Button
                  onClick={() => navigate('/cart')}
                  variant="ghost"
                  size="icon"
                  className="bg-transparent text-foreground hover:bg-primary/10 hover:text-primary relative rounded-lg"
                >
                  <ShoppingCartIcon className="w-5 h-5" strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Button>
              )}
              
              {user || isGuest ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <div className={`w-8 h-8 ${isGuest ? 'bg-muted' : 'bg-gradient-1'} rounded-full flex items-center justify-center`}>
                      <UserIcon className={`w-4 h-4 ${isGuest ? 'text-muted-foreground' : 'text-white'}`} strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-foreground hidden lg:block">
                      {isGuest ? (language === 'ar' ? 'ضيف' : 'Guest') : user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive font-normal rounded-lg"
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
                    className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal rounded-lg"
                  >
                    {t('login')}
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-1 text-white hover:opacity-90 font-normal shadow-lg hover:shadow-xl transition-all rounded-lg"
                  >
                    {t('signup')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile MenuIcon Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-6 h-6" strokeWidth={2} />
              ) : (
                <MenuIcon className="w-6 h-6" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile MenuIcon */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors font-normal"
              >
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-border pt-3 space-y-2">
              {user ? (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                >
                  <LogOutIcon className="w-4 h-4 me-2" strokeWidth={2} />
                  {t('logout')}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                  >
                    {t('login')}
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
                  >
                    {t('signup')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
