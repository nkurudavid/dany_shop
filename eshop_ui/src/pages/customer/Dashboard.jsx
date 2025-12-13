import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Heart, User, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { ORDER_STATUS } from '../../utils/constants';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, ordersRes] = await Promise.all([
                axiosInstance.get(CUSTOMER_ENDPOINTS.DASHBOARD),
                axiosInstance.get(CUSTOMER_ENDPOINTS.ORDERS),
            ]);

            setDashboardData(dashboardRes.data);
            setRecentOrders((ordersRes.data.results || []).slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard:', error);
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

    const getStatusIcon = (status) => {
        switch (status) {
            case ORDER_STATUS.DELIVERED:
                return CheckCircle;
            case ORDER_STATUS.CANCELLED:
                return XCircle;
            case ORDER_STATUS.SHIPPED:
                return Package;
            default:
                return Clock;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.first_name}! 👋
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your account</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Orders */}
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white" hover>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold">
                                    {dashboardData?.total_orders || recentOrders.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    {/* Pending Orders */}
                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white" hover>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Pending</p>
                                <p className="text-3xl font-bold">
                                    {dashboardData?.pending_orders || recentOrders.filter(o => o.status === ORDER_STATUS.PENDING).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    {/* Delivered Orders */}
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white" hover>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Delivered</p>
                                <p className="text-3xl font-bold">
                                    {dashboardData?.delivered_orders || recentOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    {/* Total Spent */}
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white" hover>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Total Spent</p>
                                <p className="text-3xl font-bold">
                                    ${dashboardData?.total_spent || recentOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card hover onClick={() => navigate('/products')}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Continue Shopping</h3>
                                <p className="text-sm text-gray-600">Browse our products</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover onClick={() => navigate('/customer/wishlist')}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">My Wishlist</h3>
                                <p className="text-sm text-gray-600">View saved items</p>
                            </div>
                        </div>
                    </Card>

                    <Card hover onClick={() => navigate('/customer/profile')}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">My Profile</h3>
                                <p className="text-sm text-gray-600">Update your info</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                        <Button
                            onClick={() => navigate('/customer/orders')}
                            variant="outline"
                            size="sm"
                        >
                            View All
                        </Button>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                            <Button
                                onClick={() => navigate('/products')}
                                variant="primary"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                return (
                                    <div
                                        key={order.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                                        onClick={() => navigate(`/customer/orders/${order.id}`)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            Order #{order.order_number}
                                                        </h3>
                                                        <Badge variant={getStatusColor(order.status)} size="sm">
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {order.order_items?.length || 0} items • ${parseFloat(order.total_amount).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(order.created_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/customer/orders/${order.id}`);
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;