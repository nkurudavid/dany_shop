import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ProductQuickView = ({ product, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    if (!product) return null;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        onClose();
    };

    const handleViewDetails = () => {
        navigate(`/products/${product.id}`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square">
                        {product.product_images && product.product_images.length > 0 ? (
                            <img
                                src={`data:${product.product_images[selectedImage].mime_type};base64,${product.product_images[selectedImage].image_base64}`}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-20 h-20 text-gray-300" />
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.product_images && product.product_images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.product_images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`border-2 rounded-lg overflow-hidden ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                                        }`}
                                >
                                    <img
                                        src={`data:${img.mime_type};base64,${img.image_base64}`}
                                        alt={`${product.product_name} ${idx + 1}`}
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.category_name || 'Uncategorized'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {product.product_name}
                    </h2>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                                <Star
                                    key={index}
                                    className={`w-4 h-4 ${index < Math.floor(parseFloat(product.average_rating || 0))
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-200 text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">
                            ({product.average_rating || '0.0'})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-3xl font-bold text-blue-500">
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.unit && (
                            <span className="text-sm text-gray-500 ml-2">per {product.unit}</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.in_stock ? (
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                ✓ In Stock ({product.quantity} available)
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                ✗ Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={!product.in_stock || quantity >= product.quantity}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-4">
                        <Button
                            onClick={handleAddToCart}
                            disabled={!product.in_stock}
                            variant="primary"
                            size="lg"
                            fullWidth
                            icon={ShoppingCart}
                        >
                            Add to Cart
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            icon={Heart}
                        >
                            <span className="sr-only">Add to Wishlist</span>
                        </Button>
                    </div>

                    <Button
                        onClick={handleViewDetails}
                        variant="ghost"
                        fullWidth
                    >
                        View Full Details
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProductQuickView;