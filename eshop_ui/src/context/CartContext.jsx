import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`Increased ${product.product_name} quantity in cart`);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.product_name} added to cart!`, {
        icon: '🛒',
      });
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
    toast.success('Cart updated');
  };

  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    setCart(cart.filter(item => item.id !== productId));
    
    if (product) {
      toast.success(`${product.product_name} removed from cart`, {
        icon: '🗑️',
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared', {
      icon: '🧹',
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};