import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import { useCart } from '../../hooks/useCart';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(CUSTOMER_ENDPOINTS.WISHLIST);
            setWishlist(data.results || []);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (wishlistItemId) => {
        try {
            setRemovingId(wishlistItemId);
            await axiosInstance.delete(CUSTOMER_ENDPOINTS.WISHLIST_DELETE(wishlistItemId));
            setWishlist(wishlist.filter(item => item.id !== wishlistItemId));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            toast.error('Failed to remove item');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (product) => {
        if (!product.in_stock) {
            toast.error('Product is out of stock');
            return;
        }
        addToCart(product);
    };

    const handleAddAllToCart = () => {
        const inStockItems = wishlist.filter(item => item.product.in_stock);
        if (inStockItems.length === 0) {
            toast.error('No items in stock');
            return;
        }
        inStockItems.forEach(item => addToCart(item.product));
        toast.success(`Added ${inStockItems.length} items to cart`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading wishlist..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            My Wishlist
                        </h1>
                        <p className="text-gray-600">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    {wishlist.length > 0 && (
                        <Button
                            onClick={handleAddAllToCart}
                            variant="primary"
                            icon={ShoppingCart}
                        >
                            Add All to Cart
                        </Button>
                    )}
                </div>

                {/* Wishlist Items */}
                {wishlist.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Save items you love to your wishlist and shop them later
                            </p>
                            <Button
                                onClick={() => navigate('/products')}
                                variant="primary"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <Card key={item.id} className="group">
                                {/* Product Image */}
                                <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square">
                                    {item.product.product_images && item.product.product_images.length > 0 ? (
                                        <img
                                            src={`data:${item.product.product_images[0].mime_type};base64,${item.product.product_images[0].image_base64}`}
                                            alt={item.product.product_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-16 h-16 text-gray-300" />
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        disabled={removingId === item.id}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>

                                    {/* Stock Badge */}
                                    {!item.product.in_stock && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="space-y-3">
                                    <div>
                                        <h3
                                            onClick={() => navigate(`/products/${item.product.id}`)}
                                            className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-500 transition"
                                        >
                                            {item.product.product_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                            {item.product.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-blue-500">
                                            ${parseFloat(item.product.price).toFixed(2)}
                                        </span>
                                        {item.product.average_rating && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="text-yellow-400 mr-1">★</span>
                                                {item.product.average_rating}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleAddToCart(item.product)}
                                            disabled={!item.product.in_stock}
                                            variant="primary"
                                            size="sm"
                                            fullWidth
                                            icon={ShoppingCart}
                                        >
                                            Add to Cart
                                        </Button>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        Added {new Date(item.added_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;