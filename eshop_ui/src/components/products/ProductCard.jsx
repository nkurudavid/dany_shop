import React, { useState } from 'react';
import { Heart, Eye, Star, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!product.in_stock) {
            toast.error('Product is out of stock');
            return;
        }
        addToCart(product);
    };

    const handleToggleWishlist = async (e) => {
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            if (isInWishlist) {
                // Remove from wishlist - you'll need wishlist ID
                toast.success('Removed from wishlist');
                setIsInWishlist(false);
            } else {
                await axiosInstance.post(CUSTOMER_ENDPOINTS.WISHLIST, {
                    product: product.id
                });
                toast.success('Added to wishlist');
                setIsInWishlist(true);
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        if (onQuickView) {
            onQuickView(product);
        }
    };

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-100">
                <div className="aspect-w-1 aspect-h-1 w-full h-48 sm:h-56 md:h-64">
                    {product.product_images && product.product_images.length > 0 ? (
                        <img
                            src={`data:${product.product_images[0].mime_type};base64,${product.product_images[0].image_base64}`}
                            alt={product.product_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-300" />
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {!product.in_stock && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                            Out of Stock
                        </span>
                    )}
                    {product.discount && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                            {product.discount}% OFF
                        </span>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handleToggleWishlist}
                        disabled={loading}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition disabled:opacity-50"
                        aria-label="Add to wishlist"
                    >
                        <Heart
                            className={`w-4 h-4 md:w-5 md:h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                    </button>
                    <button
                        onClick={handleQuickView}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition"
                        aria-label="Quick view"
                    >
                        <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    </button>
                </div>

                {/* Stock Overlay */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-4">
                {/* Category */}
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {product.category_name || 'Uncategorized'}
                </p>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base line-clamp-2 group-hover:text-blue-500 transition">
                    {product.product_name}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                            <Star
                                key={index}
                                className={`w-3 h-3 md:w-4 md:h-4 ${index < Math.floor(parseFloat(product.average_rating || 0))
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                        ({product.average_rating || '0.0'})
                    </span>
                    {product.reviews && product.reviews.length > 0 && (
                        <span className="text-xs text-gray-500">
                            {product.reviews.length} reviews
                        </span>
                    )}
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-bold text-gray-900">
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.unit && (
                            <span className="text-xs text-gray-500">per {product.unit}</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!product.in_stock}
                        className="flex items-center gap-1 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base font-semibold"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;