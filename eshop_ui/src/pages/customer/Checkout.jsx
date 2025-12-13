import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, CreditCard, Package, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        shipping_address: '',
        order_note: '',
        payment_method: PAYMENT_METHODS.COD,
    });

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/products');
        }

        // Pre-fill shipping address from user profile
        if (user?.profile) {
            const address = [
                user.profile.street,
                user.profile.sector,
                user.profile.district,
                user.profile.province,
                user.profile.country,
                user.profile.postal_code,
            ].filter(Boolean).join(', ');

            if (address) {
                setFormData(prev => ({
                    ...prev,
                    shipping_address: address,
                }));
            }
        }
    }, [cart, user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.shipping_address.trim()) {
            setError('Please enter a shipping address');
            return;
        }

        if (cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        try {
            setLoading(true);

            // Prepare order data
            const orderData = {
                shipping_address: formData.shipping_address,
                order_note: formData.order_note || '',
                payment_method: formData.payment_method,
                items: cart.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            // If online payment, add payment details (mock for now)
            if (formData.payment_method !== PAYMENT_METHODS.COD) {
                orderData.payment_details = {
                    payment_id: `PAY-${Date.now()}`,
                    amount: cartTotal.toFixed(2),
                    status: 'pending',
                };
            }

            // Create order
            const { data } = await axiosInstance.post(CUSTOMER_ENDPOINTS.CREATE_ORDER, orderData);

            // Clear cart
            clearCart();

            // Show success message
            toast.success('Order placed successfully!');

            // Redirect to order detail
            navigate(`/customer/orders/${data.id}`);
        } catch (err) {
            console.error('Order creation failed:', err);
            setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const shippingCost = 0; // Free shipping
    const total = cartTotal + shippingCost;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-blue-500 transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Checkout
                    </h1>
                    <p className="text-gray-600">Complete your order</p>
                </div>

                {error && (
                    <div className="mb-6">
                        <Alert type="error" message={error} onClose={() => setError('')} />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    1
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-gray-600">{user?.email}</p>
                                    {user?.profile?.phone_number && (
                                        <p className="text-gray-600">{user.profile.phone_number}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    2
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                            </div>
                            <Textarea
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleChange}
                                placeholder="Enter your complete shipping address"
                                rows={4}
                                required
                            />
                        </Card>

                        {/* Order Notes */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    3
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Order Notes (Optional)</h2>
                            </div>
                            <Textarea
                                name="order_note"
                                value={formData.order_note}
                                onChange={handleChange}
                                placeholder="Any special instructions for your order?"
                                rows={3}
                            />
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    4
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                            </div>
                            <div className="space-y-3">
                                {/* Cash on Delivery */}
                                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={PAYMENT_METHODS.COD}
                                        checked={formData.payment_method === PAYMENT_METHODS.COD}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-500 mt-0.5"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">Cash on Delivery</span>
                                            <Package className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Pay when you receive your order
                                        </p>
                                    </div>
                                </label>

                                {/* Online Payment */}
                                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={PAYMENT_METHODS.ONLINE}
                                        checked={formData.payment_method === PAYMENT_METHODS.ONLINE}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-500 mt-0.5"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">Online Payment</span>
                                            <CreditCard className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Pay securely online with card or mobile money
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {formData.payment_method === PAYMENT_METHODS.ONLINE && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        You will be redirected to the payment page after placing your order.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.product_images?.[0] ? (
                                                <img
                                                    src={`data:${item.product_images[0].mime_type};base64,${item.product_images[0].image_base64}`}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                {item.product_name}
                                            </h4>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-blue-500">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <Button
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={loading || cart.length === 0}
                                variant="primary"
                                size="lg"
                                fullWidth
                                icon={CheckCircle}
                                className="mt-6"
                            >
                                Place Order
                            </Button>

                            {/* Security Info */}
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="ml-3">
                                        <p className="text-sm text-green-800 font-medium">Secure Checkout</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Your information is protected with 256-bit SSL encryption
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Return Policy */}
                            <div className="mt-4 text-center text-xs text-gray-500">
                                <p>30-day return policy</p>
                                <p>Free returns on all orders</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;