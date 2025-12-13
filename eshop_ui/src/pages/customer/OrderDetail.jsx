import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { ORDER_STATUS } from '../../utils/constants';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(CUSTOMER_ENDPOINTS.ORDER_DETAIL(id));
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.DELIVERED:
                return 'success';
            case ORDER_STATUS.CANCELLED:
                return 'danger';
            case ORDER_STATUS.SHIPPED:
                return 'info';
            case ORDER_STATUS.PROCESSING:
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const getOrderTimeline = () => {
        const timeline = [
            { label: 'Order Placed', completed: true, date: order?.created_date },
            { label: 'Processing', completed: order?.status !== ORDER_STATUS.PENDING, date: null },
            { label: 'Shipped', completed: [ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(order?.status), date: null },
            { label: 'Delivered', completed: order?.status === ORDER_STATUS.DELIVERED, date: null },
        ];

        if (order?.status === ORDER_STATUS.CANCELLED) {
            return [
                { label: 'Order Placed', completed: true, date: order?.created_date },
                { label: 'Cancelled', completed: true, cancelled: true, date: order?.updated_date },
            ];
        }

        return timeline;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading order details..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <Button onClick={() => navigate('/customer/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="flex items-center text-gray-600 hover:text-blue-500 transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Order #{order.order_number}
                        </h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.created_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <Badge variant={getStatusColor(order.status)} size="lg">
                        {order.status}
                    </Badge>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Timeline */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
                            <div className="relative">
                                {getOrderTimeline().map((step, index) => (
                                    <div key={index} className="flex items-start mb-8 last:mb-0">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                                                    ? step.cancelled
                                                        ? 'bg-red-500'
                                                        : 'bg-green-500'
                                                    : 'bg-gray-300'
                                                }`}>
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            {index < getOrderTimeline().length - 1 && (
                                                <div className={`absolute top-10 left-5 w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}></div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className={`font-semibold ${step.completed
                                                    ? step.cancelled
                                                        ? 'text-red-600'
                                                        : 'text-gray-900'
                                                    : 'text-gray-500'
                                                }`}>
                                                {step.label}
                                            </h3>
                                            {step.date && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(step.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
                            <div className="space-y-4">
                                {order.order_items?.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.product?.product_images?.[0] ? (
                                                <img
                                                    src={`data:${item.product.product_images[0].mime_type};base64,${item.product.product_images[0].image_base64}`}
                                                    alt={item.product.product_name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.product?.product_name}</h3>
                                            <p className="text-sm text-gray-600">
                                                ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                ${parseFloat(item.subtotal || (item.price * item.quantity)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-blue-500 text-xl">
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {order.shipping_address}
                            </p>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <div className="flex items-center space-x-2 mb-4">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                            </div>
                            <p className="text-gray-600">{order.payment_method || 'Cash on Delivery'}</p>
                            {order.payment && (
                                <div className="mt-2">
                                    <Badge variant={order.payment.status ? 'success' : 'warning'}>
                                        {order.payment.status ? 'Paid' : 'Pending'}
                                    </Badge>
                                </div>
                            )}
                        </Card>

                        {/* Order Note */}
                        {order.order_note && (
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Note</h3>
                                <p className="text-gray-600">{order.order_note}</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;