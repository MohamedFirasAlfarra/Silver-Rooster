// App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/AuthProvider';
import { SessionManager } from './components/SessionManager';
import { AppInitializer } from './components/AppInitializer';
import { useAppStore } from './stores/useAppStore';
import { validateUserSession } from './stores/useAuthStore';
import { TopNav } from './components/TopNav';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductPage';
import { ProductDetailPage } from './pages/ProductsDetailPage';
import { ContactPage } from './pages/ContactPage';
import { FavoritesPage } from './pages/FavoritesPgae';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminPage } from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 دقيقة
      gcTime: 60 * 60 * 1000, // 60 دقيقة
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

function App() {
  const { theme, language } = useAppStore();

  // تطبيق السمة
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // تطبيق اللغة والاتجاه
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // فحص دوري للحالة
  useEffect(() => {
    const interval = setInterval(async () => {
      const { valid, reason } = await validateUserSession();
      if (!valid && reason !== 'No user found') {
        console.log('⚠️ جلسة غير صالحة:', reason);
        // يمكنك إضافة منطق لإعادة التوجيه هنا إذا لزم الأمر
      }
    }, 5 * 60 * 1000); // كل 5 دقائق

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInitializer>
          <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <SessionManager />
              <TopNav />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </div>
          </Router>
        </AppInitializer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;