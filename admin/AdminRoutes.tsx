import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';

import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminFiltersPage from './pages/AdminFiltersPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminShippingPage from './pages/AdminShippingPage';

const ProtectedRoute: React.FC<{user: User | null; loading: boolean; children: React.ReactNode}> = ({ user, loading, children }) => {
    if (loading) {
        return <div className="flex h-screen items-center justify-center">جاري التحقق...</div>;
    }
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
};

const AdminRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="login" element={user ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="filters" element={<AdminFiltersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="shipping" element={<AdminShippingPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;