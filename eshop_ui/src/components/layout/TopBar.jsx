import React from 'react';
import { Phone, Mail, MapPin, Clock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 text-xs lg:text-sm">
          {/* Left side - Contact Info */}
          <div className="flex items-center space-x-4 lg:space-x-6 text-gray-600">
            <a 
              href="tel:+0608008015582" 
              className="flex items-center space-x-1 hover:text-blue-500 transition"
            >
              <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">+060 (800) 801-582</span>
            </a>
            <a 
              href="mailto:support@shoppro.com" 
              className="flex items-center space-x-1 hover:text-blue-500 transition"
            >
              <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">support@shoppro.com</span>
            </a>
          </div>

          {/* Right side - User Links */}
          <div className="flex items-center space-x-4 text-gray-600">
            <button className="flex items-center space-x-1 hover:text-blue-500 transition">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Store Location</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Daily Deal</span>
            </button>
            {user ? (
              <button 
                onClick={() => navigate(user.role === 'customer' ? '/customer/dashboard' : '/shop/dashboard')}
                className="flex items-center space-x-1 hover:text-blue-500 transition"
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>My Account</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
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

export default TopBar;