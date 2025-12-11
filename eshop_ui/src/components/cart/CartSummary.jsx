import React from 'react';
import { useCart } from '../../hooks/useCart';
import Card from '../common/Card';

const CartSummary = ({ shippingCost = 0, discount = 0 }) => {
  const { cartTotal, cartCount } = useCart();
  
  const shipping = shippingCost;
  const subtotal = cartTotal;
  const discountAmount = discount;
  const total = subtotal + shipping - discountAmount;

  return (
    <Card className="sticky top-24">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        Order Summary
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm md:text-base">
          <span className="text-gray-600">Subtotal ({cartCount} items)</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm md:text-base">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm md:text-base">
            <span className="text-gray-600">Discount</span>
            <span className="font-semibold text-green-600">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl md:text-2xl font-bold text-blue-500">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs md:text-sm text-blue-800">
        <p className="font-medium mb-1">✓ Free shipping on orders over $50</p>
        <p>✓ 30-day return policy</p>
      </div>
    </Card>
  );
};

export default CartSummary;