import React from 'react';
import { Plus, Minus, Trash2, Package } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <div className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition">
      {/* Product Image */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        {item.product_images && item.product_images[0] ? (
          <img
            src={`data:${item.product_images[0].mime_type};base64,${item.product_images[0].image_base64}`}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate mb-1">
          {item.product_name}
        </h4>
        <p className="text-xs md:text-sm text-gray-500 mb-2">
          ${parseFloat(item.price).toFixed(2)} × {item.quantity}
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          
          <span className="w-8 md:w-10 text-center text-sm md:text-base font-medium">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          
          <button
            onClick={() => onRemove(item.id)}
            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-gray-900 text-sm md:text-base">
          ${subtotal}
        </p>
      </div>
    </div>
  );
};

export default CartItem;