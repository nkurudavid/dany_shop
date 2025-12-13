import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, Package, Truck, Shield, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { SHOP_PUBLIC_ENDPOINTS, CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(SHOP_PUBLIC_ENDPOINTS.PRODUCT_DETAIL(id));
            setProduct(data);
        } catch (error) {
            console.error('Failed to load product:', error);
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product.in_stock) {
            toast.error('Product is out of stock');
            return;
        }
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
    };

    const handleToggleWishlist = async () => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            if (isInWishlist) {
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
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading product details..." />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <Button onClick={() => navigate('/products')}>
                        Back to Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center text-gray-600 hover:text-blue-500 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div>
                        <Card padding="none">
                            <div className="bg-gray-100 aspect-square rounded-t-lg overflow-hidden">
                                {product.product_images && product.product_images.length > 0 ? (
                                    <img
                                        src={`data:${product.product_images[selectedImage].mime_type};base64,${product.product_images[selectedImage].image_base64}`}
                                        alt={product.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-32 h-32 text-gray-300" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {product.product_images && product.product_images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-4">
                                    {product.product_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`border-2 rounded-lg overflow-hidden aspect-square ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                                                }`}
                                        >
                                            <img
                                                src={`data:${img.mime_type};base64,${img.image_base64}`}
                                                alt={`${product.product_name} ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Product Info */}
                    <div>
                        <Card>
                            {/* Category Badge */}
                            <div className="mb-4">
                                <Badge variant="info">
                                    {product.category_name || 'Uncategorized'}
                                </Badge>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {product.product_name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            className={`w-5 h-5 ${index < Math.floor(parseFloat(product.average_rating || 0))
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-gray-200 text-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    ({product.average_rating || '0.0'})
                                </span>
                                {product.reviews && product.reviews.length > 0 && (
                                    <span className="text-gray-500">
                                        {product.reviews.length} reviews
                                    </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-blue-500">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                    {product.unit && (
                                        <span className="text-gray-500">per {product.unit}</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.in_stock ? (
                                    <Badge variant="success" size="lg">
                                        ✓ In Stock ({product.quantity} available)
                                    </Badge>
                                ) : (
                                    <Badge variant="danger" size="lg">
                                        ✗ Out of Stock
                                    </Badge>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-gray-100 transition"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="px-6 font-semibold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            disabled={!product.in_stock || quantity >= product.quantity}
                                            className="p-3 hover:bg-gray-100 transition disabled:opacity-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mb-6">
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
                                    onClick={handleToggleWishlist}
                                    variant="outline"
                                    size="lg"
                                    icon={Heart}
                                    className={isInWishlist ? 'text-red-500 border-red-500' : ''}
                                >
                                    <span className="sr-only">Add to Wishlist</span>
                                </Button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-6 h-6 text-blue-500" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Free Shipping</div>
                                        <div className="text-gray-500">On orders over $50</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-green-500" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Secure Payment</div>
                                        <div className="text-gray-500">100% protected</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6 text-purple-500" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Easy Returns</div>
                                        <div className="text-gray-500">30-day policy</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Reviews Section */}
                {product.reviews && product.reviews.length > 0 && (
                    <Card>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                        <div className="space-y-6">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`w-4 h-4 ${index < review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-gray-200 text-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-gray-900">{review.user_name}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.created_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;