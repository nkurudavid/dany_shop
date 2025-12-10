// Base API URL
export const API_BASE_URL = import.meta.env.BACKEND_API_BASE_URL || 'http://localhost:8000/api';

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup/',
  ACTIVATE_VERIFY_OTP: '/auth/activate_verify_otp/',
  ACTIVATE_RESEND_OTP: '/auth/activate_resend_otp/',
  PASSWORD_RESET_VERIFY_EMAIL: '/auth/password_reset_verify_email/',
  PASSWORD_RESET_VERIFY_OTP: '/auth/password_reset_verify_otp/',
  PASSWORD_RESET_CONFIRM: '/auth/password_reset_confirm/',
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  CHANGE_PASSWORD: '/auth/me/change_password/',
  PROFILE: '/auth/me/profile',
};

// Shop Public Endpoints
export const SHOP_PUBLIC_ENDPOINTS = {
  OVERVIEW: '/shop_overview/',
  PRODUCTS: '/shop_products/',
  PRODUCT_DETAIL: (id) => `/shop_products/${id}/`,
};

// Customer Endpoints
export const CUSTOMER_ENDPOINTS = {
  DASHBOARD: '/customer/dashboard/',
  ORDERS: '/customer/orders/',
  ORDER_DETAIL: (id) => `/customer/orders/${id}/`,
  CREATE_ORDER: '/customer/orders/',
  WISHLIST: '/customer/wishlist/',
  WISHLIST_DELETE: (id) => `/customer/wishlist/${id}/`,
  REVIEWS: '/customer/reviews/',
  REVIEW_DETAIL: (id) => `/customer/reviews/${id}/`,
};

// Shop Owner Endpoints
export const SHOP_ENDPOINTS = {
  DASHBOARD: '/shop/dashboard/',

  // Categories
  CATEGORIES: '/shop/categories/',
  CATEGORY_DETAIL: (id) => `/shop/categories/${id}/`,

  // Products
  PRODUCTS: '/shop/products/',
  PRODUCT_DETAIL: (id) => `/shop/products/${id}/`,
  PRODUCT_IMAGES: (productId) => `/shop/products/${productId}/images/`,
  PRODUCT_IMAGE_DELETE: (productId, imageId) => `/shop/products/${productId}/images/${imageId}/`,

  // Stock Management
  STOCK_MOVEMENTS: '/shop/stock-movements/',
  INVENTORY: '/shop/inventory/',

  // Orders
  ORDERS: '/shop/orders/',
  ORDER_DETAIL: (id) => `/shop/orders/${id}/`,

  // Payments
  PAYMENTS: '/shop/payments/',
  PAYMENT_DETAIL: (id) => `/shop/payments/${id}/`,

  // Reviews
  REVIEWS: '/shop/reviews/',
  REVIEW_DETAIL: (id) => `/shop/reviews/${id}/`,

  // Analytics
  ANALYTICS: '/shop/analytics/',
};