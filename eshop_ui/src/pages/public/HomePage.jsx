import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Shield, Truck, ArrowRight } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { SHOP_PUBLIC_ENDPOINTS } from '../../api/endpoints';
import ProductGrid from '../../components/products/ProductGrid';
import ProductQuickView from '../../components/products/ProductQuickView';
import Button from '../../components/common/Button';

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            const { data } = await axiosInstance.get(SHOP_PUBLIC_ENDPOINTS.PRODUCTS);
            // Get first 8 products for homepage
            setProducts((data.results || []).slice(0, 8));
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                            <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-4">
                                🎉 Special Offer - Up to 50% Off
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Shop Amazing Products at Unbeatable Prices
                            </h1>
                            <p className="text-lg md:text-xl mb-8 opacity-90">
                                Discover our curated collection of premium products. Quality you can trust, prices you'll love.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => navigate('/products')}
                                    variant="secondary"
                                    size="lg"
                                    icon={ShoppingBag}
                                >
                                    Shop Now
                                </Button>
                                <Button
                                    onClick={() => navigate('/products')}
                                    variant="outline"
                                    size="lg"
                                    className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-blue-600"
                                >
                                    View All Products
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">1000+</div>
                                        <div className="text-sm opacity-90">Products</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">5000+</div>
                                        <div className="text-sm opacity-90">Happy Customers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">50+</div>
                                        <div className="text-sm opacity-90">Categories</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">4.8★</div>
                                        <div className="text-sm opacity-90">Average Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
                                <p className="text-gray-600 text-sm">Free delivery on orders over $50</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
                                <p className="text-gray-600 text-sm">100% secure payment methods</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Products</h3>
                                <p className="text-gray-600 text-sm">Curated selection of premium items</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Featured Products
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover our handpicked selection of trending products that our customers love
                        </p>
                    </div>

                    <ProductGrid
                        products={products}
                        loading={loading}
                        onQuickView={setSelectedProduct}
                    />

                    <div className="text-center mt-12">
                        <Button
                            onClick={() => navigate('/products')}
                            variant="primary"
                            size="lg"
                            icon={ArrowRight}
                            iconPosition="right"
                        >
                            View All Products
                        </Button>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-gray-600">Browse our wide range of product categories</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { name: 'Electronics', emoji: '💻', color: 'from-blue-500 to-blue-600' },
                            { name: 'Fashion', emoji: '👔', color: 'from-pink-500 to-pink-600' },
                            { name: 'Home & Garden', emoji: '🏠', color: 'from-green-500 to-green-600' },
                            { name: 'Sports', emoji: '⚽', color: 'from-orange-500 to-orange-600' },
                            { name: 'Books', emoji: '📚', color: 'from-purple-500 to-purple-600' },
                            { name: 'Beauty', emoji: '💄', color: 'from-red-500 to-red-600' },
                            { name: 'Toys', emoji: '🎮', color: 'from-yellow-500 to-yellow-600' },
                            { name: 'Automotive', emoji: '🚗', color: 'from-gray-700 to-gray-800' },
                        ].map((category, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(`/products?category=${category.name}`)}
                                className={`bg-gradient-to-br ${category.color} text-white rounded-xl p-6 md:p-8 hover:scale-105 transition-transform duration-300 shadow-lg`}
                            >
                                <div className="text-4xl md:text-5xl mb-3">{category.emoji}</div>
                                <div className="font-semibold text-sm md:text-base">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and enjoy amazing deals on quality products
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/signup')}
                            variant="secondary"
                            size="lg"
                        >
                            Create Account
                        </Button>
                        <Button
                            onClick={() => navigate('/products')}
                            variant="outline"
                            size="lg"
                            className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-blue-600"
                        >
                            Browse Products
                        </Button>
                    </div>
                </div>
            </section>

            {/* Quick View Modal */}
            <ProductQuickView
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default HomePage;