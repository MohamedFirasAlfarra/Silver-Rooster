import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { supabase } from '../lib/supabaseClient';
import { DesktopNavigation } from '../components/NavBar/DesktopNavigation';
import { MobileMenu } from '../components/NavBar/MobileMenu';
import { LogoSection } from '../components/NavBar/LogoSection';
import { MobileControls } from '../components/NavBar/MobileControls';

export const TopNav: React.FC = () => {
  const { language } = useAppStore();
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

  const instagramUrl = "https://www.instagram.com/aldeek_alfiddi?igsh=MTZ5MHNubzVzaDczaA%3D%3D&utm_source=qr";

  return (
    <nav className={`
      lg:bg-card/95 lg:backdrop-blur-md
      bg-card
      text-card-foreground border-b border-border/50 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-xl lg:bg-card/98 lg:backdrop-blur-lg ' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section */}
          <LogoSection t={t} language={language} />
          
          {/* Desktop Navigation */}
          <DesktopNavigation
            language={language}
            location={location}
            user={user}
            isAdmin={isAdmin}
            isGuest={isGuest}
            t={t}
            cartCount={cartCount}
            favoriteCount={favoriteCount}
            instagramUrl={instagramUrl}
            handleLogout={handleLogout}
            navigate={navigate}
          />

          {/* Mobile Controls */}
          <MobileControls
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            user={user}
            isAdmin={isAdmin}
            isGuest={isGuest}
            favoriteCount={favoriteCount}
            instagramUrl={instagramUrl}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        language={language}
        location={location}
        user={user}
        isAdmin={isAdmin}
        isGuest={isGuest}
        t={t}
        cartCount={cartCount}
        favoriteCount={favoriteCount}
        instagramUrl={instagramUrl}
        handleLogout={handleLogout}
        navigate={navigate}
      />
    </nav>
  );
};