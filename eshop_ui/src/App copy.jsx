// import Navbar from "./components/Navbar";
// import Intro from "./components/Intro";
// import FeaturedProducts from "./components/FeaturedProducts";
// import Categories from "./components/Categories";
// import AboutUs from "./components/AboutUs";
// import Footer from "./components/Footer";

// function App() {
//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
//       <Navbar />
//       <Intro />
//       <FeaturedProducts />
//       <Categories />
//       <AboutUs />
//       <Footer />
//     </div>
//   );
// }

// export default App;




import React, { useState, useEffect, createContext, useContext } from 'react';
import { ShoppingCart, Heart, User, Search, Phone, Mail, MapPin, Clock, Menu, X, Star, Package, Plus, Minus, Trash2, Eye } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:8000/api';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// API Helper
const api = {
  async call(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.call('/auth/me/profile');
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    await api.call('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    await checkAuth();
  };

  const logout = async () => {
    try {
      await api.call('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Top Info Bar Component
const TopInfoBar = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-xs lg:text-sm">
          <div className="flex items-center space-x-4 lg:space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
              <span className="hidden lg:inline">+060 (800) 801-582</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
              <span className="hidden lg:inline">support@shophub.com</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <button className="flex items-center space-x-1 hover:text-blue-500 transition">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Store</span>
            </button>
            {user ? (
              <button
                onClick={() => onNavigate('customer-dashboard')}
                className="flex items-center space-x-1 hover:text-blue-500 transition"
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Account</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center space-x-1 hover:text-blue-500 transition"
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const MainHeader = ({ cartCount = 0, onNavigate, onCartClick }) => {
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center">
            <h1 className="text-2xl lg:text-3xl font-bold">
              <span className="text-gray-900">Dany Shop</span>
              <span className="text-blue-500">.</span>
            </h1>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            />
            <button className="px-6 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 transition">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button className="p-2 hover:text-blue-500 transition hidden md:block">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              onClick={onCartClick}
              className="relative p-2 hover:text-blue-500 transition"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mt-3">
          <div className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            />
            <button className="px-4 bg-gray-900 text-white rounded-r-lg">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Home
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Products
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Categories
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              About
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              Contact
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition group">
      <div className="relative overflow-hidden">
        <div className="h-48 sm:h-56 md:h-64 bg-gray-100 flex items-center justify-center">
          {product.product_images?.[0] ? (
            <img
              src={
                product.product_images[0].image_base64.startsWith('data:')
                  ? product.product_images[0].image_base64
                  : `data:${product.product_images[0].mime_type};base64,${product.product_images[0].image_base64}`
              }
              alt={product.product_name}
            />
          ) : (
            <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-300" />
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleWishlist(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
          >
            <Heart
              className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
          <button
            onClick={() => setShowQuickView(true)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {!product.in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category_name || 'Category'}</p>
        <h3 className="font-semibold text-gray-900 mb-1 truncate text-sm md:text-base">
          {product.product_name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            Frw {parseFloat(product.price).toFixed(2)}
          </span>
          <div className="flex items-center">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs md:text-sm text-gray-600 ml-1">
              {product.average_rating || '5.0'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.in_stock}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// Cart Sidebar Component
const CartSidebar = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  {item.product_images && item.product_images[0] ? (
                    <img
                      src={
                          item.product_images[0].image_base64.startsWith('data:')
                            ? item.product_images[0].image_base64
                            : `data:${item.product_images[0].mime_type};base64,${item.product_images[0].image_base64}`
                        }
                      alt={item.product_name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</h4>
                  <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-500">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadProducts();
    if (user) loadWishlist();
  }, [user]);

  const loadProducts = async () => {
    try {
      const data = await api.call('/shop_products/');
      setProducts(data.results || []);
    } catch (error) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const data = await api.call('/customer/wishlist/');
      setWishlist(data.results || []);
    } catch (error) {
      console.error('Failed to load wishlist');
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      const inWishlist = wishlist.find(w => w.product.id === product.id);
      if (inWishlist) {
        await api.call(`/customer/wishlist/${inWishlist.id}/`, { method: 'DELETE' });
      } else {
        await api.call('/customer/wishlist/', {
          method: 'POST',
          body: JSON.stringify({ product: product.id }),
        });
      }
      loadWishlist();
    } catch (error) {
      console.error('Failed to update wishlist');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      onNavigate('login');
    } else {
      onNavigate('checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopInfoBar onNavigate={onNavigate} />
      <MainHeader
        cartCount={cart.length}
        onNavigate={onNavigate}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl text-white">
            <p className="text-sm md:text-base font-semibold mb-2">SPECIAL OFFER</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              Shop Amazing Products
            </h1>
            <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90">
              Discover our curated collection of premium products at unbeatable prices
            </p>
            <button className="px-6 md:px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              SHOP NOW
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <div className="w-16 h-1 bg-blue-500 mt-2"></div>
          </div>
          <button className="text-blue-500 font-semibold hover:text-blue-600 text-sm md:text-base">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.some(w => w.product.id === product.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

// Main App
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <AuthProvider>
      <AuthWrapper currentPage={currentPage} onNavigate={navigate} />
    </AuthProvider>
  );
};

const AuthWrapper = ({ currentPage, onNavigate }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return <HomePage onNavigate={onNavigate} />;
};

export default App;