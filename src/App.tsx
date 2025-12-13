import { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/AuthProvider';
import { AppInitializerOptimized } from './components/AppInitializerOptimized';
import { useAppStore } from './stores/useAppStore';
import { TopNav } from './components/TopNav';
import { supabaseKeepAlive } from './services/supabaseKeepAlive';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductPage').then(module => ({ default: module.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductsDetailPage').then(module => ({ default: module.ProductDetailPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPgae').then(module => ({ default: module.FavoritesPage })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

function App() {
  const { theme, language } = useAppStore();
  const [keepAliveStarted, setKeepAliveStarted] = useState(false);

  useEffect(() => {
    if (!keepAliveStarted) {
      supabaseKeepAlive.start();
      setKeepAliveStarted(true);
      console.log('✅ Keep-Alive Service started');
    }
  }, [keepAliveStarted]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInitializerOptimized>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <TopNav />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AppInitializerOptimized>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;