import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-8 mb-6">
        <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      
      <p className="text-sm md:text-base text-gray-500 text-center mb-8 max-w-md">
        Looks like you haven't added anything to your cart yet. 
        Start shopping to fill it up!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate('/products')}
          variant="primary"
          size="lg"
        >
          Start Shopping
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="lg"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default EmptyCart;