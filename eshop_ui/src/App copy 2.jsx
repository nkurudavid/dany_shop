import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useAuth } from './hooks/useAuth';

// Layout
import MainLayout from './components/layout/MainLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import VerifyOTPPage from './pages/public/VerifyOTPPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Orders';
import CustomerOrderDetail from './pages/customer/OrderDetail';
import CustomerWishlist from './pages/customer/Wishlist';
import CustomerProfile from './pages/customer/Profile';
import CheckoutPage from './pages/customer/Checkout';

// Shop Owner Pages
import ShopDashboard from './pages/shop/ShopDashboard';
import ProductManagement from './pages/shop/ProductManagement';
import OrderManagement from './pages/shop/OrderManagement';
import Inventory from './pages/shop/Inventory';
import Analytics from './pages/shop/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Redirect based on role
    if (user.role === 'shop_owner') {
      return <Navigate to="/shop/dashboard" replace />;
    }
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
      <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerOrders /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerOrderDetail /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/wishlist"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerWishlist /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CustomerProfile /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MainLayout><CheckoutPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Shop Owner Routes */}
      <Route
        path="/shop/dashboard"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <MainLayout><ShopDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/products"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <MainLayout><ProductManagement /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/orders"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <MainLayout><OrderManagement /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/inventory"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <MainLayout><Inventory /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/analytics"
        element={
          <ProtectedRoute allowedRoles={['shop_owner']}>
            <MainLayout><Analytics /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
}

// 404 Component
const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Go Home
      </a>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;