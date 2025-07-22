import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatPrice } from '../utils/priceUtils.js';
import axios from '../api/axios.js';

function OrderTrackingPage() {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trackingForm, setTrackingForm] = useState({
        orderNumber: orderNumber || '',
        email: ''
    });

    useEffect(() => {
        if (orderNumber) {
            setTrackingForm(prev => ({ ...prev, orderNumber }));
        }
    }, [orderNumber]);

    const handleInputChange = (e) => {
        setTrackingForm({
            ...trackingForm,
            [e.target.name]: e.target.value
        });
    };

    const trackOrder = async (e) => {
        if (e) e.preventDefault();
        
        if (!trackingForm.orderNumber) {
            setError('Please enter order number');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const emailParam = trackingForm.email ? `?email=${trackingForm.email}` : '';
            const response = await axios.get(`/orders/track/${trackingForm.orderNumber}${emailParam}`);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Failed to track order:', error);
            setError(error.response?.data?.message || 'Failed to track order');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
            case 'PROCESSING': return 'text-purple-600 bg-purple-100';
            case 'SHIPPED': return 'text-indigo-600 bg-indigo-100';
            case 'OUT_FOR_DELIVERY': return 'text-orange-600 bg-orange-100';
            case 'DELIVERED': return 'text-green-600 bg-green-100';
            case 'CANCELLED': return 'text-red-600 bg-red-100';
            case 'RETURNED': return 'text-red-600 bg-red-100';
            case 'REFUNDED': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'CONFIRMED': return '✅';
            case 'PROCESSING': return '📦';
            case 'SHIPPED': return '🚚';
            case 'OUT_FOR_DELIVERY': return '🚛';
            case 'DELIVERED': return '✅';
            case 'CANCELLED': return '❌';
            case 'RETURNED': return '↩️';
            case 'REFUNDED': return '💰';
            default: return '❓';
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
                    <p className="text-gray-600">Enter your order details to track your order status</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={trackOrder} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Number
                                </label>
                                <input
                                    type="text"
                                    name="orderNumber"
                                    value={trackingForm.orderNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., ORD001234"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address (Optional)
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={trackingForm.email}
                                    onChange={handleInputChange}
                                    placeholder="your@email.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Tracking...' : 'Track Order'}
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                </div>

                {order && (
                    <>
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Order #{order.orderNumber}
                                    </h2>
                                    <p className="text-gray-600">
                                        Placed on {formatDateTime(order.createdAt)}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-gray-800">Total Amount</p>
                                    <p className="text-xl font-bold text-green-600">{formatPrice(order.finalTotal)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Payment Method</p>
                                    <p className="text-gray-600">{order.paymentMethod.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Payment Status</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        order.paymentStatus === 'COMPLETED' ? 'text-green-600 bg-green-100' : 
                                        order.paymentStatus === 'PENDING' ? 'text-yellow-600 bg-yellow-100' :
                                        'text-red-600 bg-red-100'
                                    }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {order.statusHistory && order.statusHistory.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Timeline</h3>
                                
                                <div className="space-y-4">
                                    {order.statusHistory.map((history, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(history.status)}`}>
                                                {getStatusIcon(history.status)}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-800">
                                                        {history.status.replace('_', ' ')}
                                                    </h4>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateTime(history.createdAt)}
                                                    </span>
                                                </div>
                                                {history.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {order.orderItems && order.orderItems.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                                
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                                            {item.product?.image && (
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.productName}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-grow">
                                                <h4 className="font-medium text-gray-800">{item.productName}</h4>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="text-sm text-gray-600">Price: {formatPrice(item.price)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        {order.totalDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Total Discount</span>
                                                <span>-{formatPrice(order.totalDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax (GST)</span>
                                            <span>{formatPrice(order.tax)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                            <span>Total</span>
                                            <span>{formatPrice(order.finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h3>
                            <div className="text-gray-600">
                                <p className="font-medium">{order.customerName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                                </p>
                                {order.shippingAddress.landmark && (
                                    <p>Landmark: {order.shippingAddress.landmark}</p>
                                )}
                                <p className="mt-2">
                                    📧 {order.customerEmail} <br />
                                    📞 {order.customerPhone}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
                            <p className="text-gray-600 mb-4">
                                If you have any questions about your order, please contact our support team.
                            </p>
                            <div className="flex justify-center space-x-6">
                                <a 
                                    href="mailto:support@bandhuchai.com"
                                    className="text-green-600 hover:text-green-700"
                                >
                                    📧 support@bandhuchai.com
                                </a>
                                <span className="text-gray-600">
                                    📞 +91-8805635049
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderTrackingPage;
