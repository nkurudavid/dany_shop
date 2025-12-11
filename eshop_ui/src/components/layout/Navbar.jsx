import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Beauty & Health',
    'Toys & Games',
    'Automotive',
  ];

  return (
    <nav className="bg-gray-900 text-white hidden lg:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
              className="flex items-center space-x-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 transition"
            >
              <MenuIcon className="w-5 h-5" />
              <span className="font-semibold">CATEGORIES</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showCategories && (
              <div
                className="absolute top-full left-0 w-64 bg-white shadow-lg z-50 rounded-b-lg"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <div className="py-2">
                  {categories.map((category, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(`/products?category=${category}`);
                        setShowCategories(false);
                      }}
                      className="w-full text-left px-6 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <div className="flex items-center space-x-8 ml-8">
            <button
              onClick={() => navigate('/')}
              className="py-4 hover:text-blue-400 transition font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </button>

            <button
              onClick={() => navigate('/products')}
              className="py-4 hover:text-blue-400 transition font-medium relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </button>

            <button
              onClick={() => navigate('/about')}
              className="py-4 hover:text-blue-400 transition font-medium relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="py-4 hover:text-blue-400 transition font-medium relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;