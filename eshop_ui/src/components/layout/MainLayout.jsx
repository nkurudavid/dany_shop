import React, { useState } from 'react';
import TopBar from './TopBar';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';

const MainLayout = ({ children }) => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header onCartOpen={() => setCartOpen(true)} />
      <Navbar />

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      <Footer />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
};

export default MainLayout;