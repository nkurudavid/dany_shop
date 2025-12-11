import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Header = ({ onCartOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo */}
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center flex-shrink-0"
          >
            <h1 className="text-2xl lg:text-3xl font-bold">
              <span className="text-gray-900">ShopPro</span>
              <span className="text-blue-500">.</span>
            </h1>
          </button>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-xl"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 transition"
            />
            <button 
              type="submit"
              className="px-6 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Wishlist - Hidden on mobile, shown for logged-in users */}
            {user && (
              <button 
                onClick={() => navigate('/customer/wishlist')}
                className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition relative"
              >
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
            )}

            {/* User Account */}
            <button 
              onClick={() => {
                if (user) {
                  navigate(user.role === 'customer' ? '/customer/dashboard' : '/shop/dashboard');
                } else {
                  navigate('/login');
                }
              }}
              className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>

            {/* Cart */}
            <button 
              onClick={onCartOpen}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form 
          onSubmit={handleSearch}
          className="lg:hidden mt-3"
        >
          <div className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              className="px-4 bg-gray-900 text-white rounded-r-lg"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <button 
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              Home
            </button>
            <button 
              onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              Products
            </button>
            {user && (
              <>
                <button 
                  onClick={() => { 
                    navigate(user.role === 'customer' ? '/customer/dashboard' : '/shop/dashboard'); 
                    setMobileMenuOpen(false); 
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                >
                  Dashboard
                </button>
                {user.role === 'customer' && (
                  <button 
                    onClick={() => { navigate('/customer/wishlist'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    Wishlist
                  </button>
                )}
              </>
            )}
            <button 
              onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              About
            </button>
            <button 
              onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;