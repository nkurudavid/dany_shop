import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { CUSTOMER_ENDPOINTS } from '../../api/endpoints';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { ORDER_STATUS } from '../../utils/constants';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(CUSTOMER_ENDPOINTS.ORDERS);
            setOrders(data.results || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let result = [...orders];

        // Filter by search term
        if (searchTerm) {
            result = result.filter(order =>
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(result);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading orders..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Search by order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Orders' },
                                { value: ORDER_STATUS.PENDING, label: 'Pending' },
                                { value: ORDER_STATUS.PROCESSING, label: 'Processing' },
                                { value: ORDER_STATUS.SHIPPED, label: 'Shipped' },
                                { value: ORDER_STATUS.DELIVERED, label: 'Delivered' },
                                { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
                            ]}
                            icon={Filter}
                        />
                    </div>
                </Card>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Start shopping to see your orders here'}
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
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card key={order.id} hover onClick={() => navigate(`/customer/orders/${order.id}`)}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    Order #{order.order_number}
                                                </h3>
                                                <Badge variant={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    {order.order_items?.length || 0} items • Total: ${parseFloat(order.total_amount).toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Payment: {order.payment_method || 'COD'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Ordered on {new Date(order.created_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/customer/orders/${order.id}`);
                                            }}
                                            variant="primary"
                                            size="sm"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;