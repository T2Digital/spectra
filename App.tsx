import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages (Lazy Loaded for Code Splitting)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const VirtualTryOnPage = React.lazy(() => import('./pages/VirtualTryOnPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const FaqPage = React.lazy(() => import('./pages/FaqPage'));
const ReturnPolicyPage = React.lazy(() => import('./pages/ReturnPolicyPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Components
import PromoBar from './components/PromoBar';
import Header from './components/Header';
import TrustBadge from './components/TrustBadge';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import SalesBot from './SalesBot';
import ScrollToTop from './components/ScrollToTop';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Admin Section
import AdminRoutes from './admin/AdminRoutes';

// Services
import { getProducts } from './firebase/services';
import type { Product } from './types';

const LoadingFallback: React.FC = () => (
  <div className="h-screen flex items-center justify-center">...جاري تحميل الصفحة</div>
);

const MainLayout: React.FC<{ children: React.ReactNode; allProducts: Product[] }> = ({ children, allProducts }) => (
  <NotificationProvider>
    <WishlistProvider>
      <CartProvider>
        <div className="bg-white text-brand-primary font-sans">
          <PromoBar />
          <Header />
          <CartSidebar />
          <main className="min-h-screen">
            {children}
          </main>
          <SalesBot allProducts={allProducts} />
          <TrustBadge />
          <Footer />
        </div>
      </CartProvider>
    </WishlistProvider>
  </NotificationProvider>
);

function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Failed to fetch all products for the app:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);


  if (loading) {
    return <div className="h-screen flex items-center justify-center">...جاري تحميل المتجر</div>
  }

  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/*" element={
              <MainLayout allProducts={allProducts}>
                <Routes>
                  <Route path="/" element={<HomePage allProducts={allProducts} />} />
                  <Route path="/products" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/try-on/:id" element={<VirtualTryOnPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/return-policy" element={<ReturnPolicyPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;