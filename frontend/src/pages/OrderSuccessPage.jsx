import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/priceUtils.js';
import axios from '../api/axios.js';

function OrderSuccessPage() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.state?.orderData) {
            const orderData = location.state.orderData;
            setConfirmation({
                title: orderData.userMessage.title,
                message: orderData.userMessage.message,
                nextSteps: orderData.userMessage.nextSteps,
                supportInfo: {
                    email: 'support@bandhuchai.com',
                    phone: '+91-XXXXXXXXXX',
                    message: orderData.userMessage.contactInfo
                },
                order: orderData.order
            });
            setLoading(false);
        } else if (orderId) {
            fetchOrderConfirmation();
        } else {
            setError('Order ID not found');
            setLoading(false);
        }
    }, [orderId, location.state]);

    const fetchOrderConfirmation = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/orders/confirmation/${orderId}`);
            setConfirmation(response.data.confirmation);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch order confirmation:', error);
            setError(error.response?.data?.message || 'Failed to load order confirmation');
        } finally {
            setLoading(false);
        }
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handleTrackOrder = () => {
        navigate(`/track-order/${orderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order confirmation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleContinueShopping}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {confirmation?.title || 'Order Confirmed!'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {confirmation?.message || 'Thank you for your order!'}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="border-b pb-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Order #{confirmation?.order?.id || orderId}
                                </h2>
                                <p className="text-gray-600">
                                    {confirmation?.order?.statusMessage || 'Order received - Awaiting confirmation'}
                                </p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-right">
                                <p className="text-2xl font-bold text-green-600">
                                    {confirmation?.order?.finalTotal ? formatPrice(confirmation.order.finalTotal) : ''}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {confirmation?.order?.paymentMethod || 'Cash on Delivery'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
                            <div className="text-gray-600 space-y-1">
                                <p>{confirmation?.order?.customerName}</p>
                                <p>{confirmation?.order?.customerEmail}</p>
                                <p>{confirmation?.order?.customerPhone}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Delivery Information</h3>
                            <div className="text-gray-600 space-y-1">
                                {confirmation?.order?.shippingAddress && (
                                    <>
                                        <p>{confirmation.order.shippingAddress.street}</p>
                                        <p>
                                            {confirmation.order.shippingAddress.city}, {confirmation.order.shippingAddress.state} {confirmation.order.shippingAddress.pincode}
                                        </p>
                                        {confirmation.order.shippingAddress.landmark && (
                                            <p>Landmark: {confirmation.order.shippingAddress.landmark}</p>
                                        )}
                                    </>
                                )}
                                <p className="font-medium text-green-600">
                                    {confirmation?.order?.estimatedDelivery || '3-7 business days'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {confirmation?.order?.items && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                            <div className="space-y-3">
                                {confirmation.order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center space-x-3">
                                            {item.image.smallUrl && (
                                                <img 
                                                    src={item.image.smallUrl}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                {item.size && (
                                                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-medium">{formatPrice(item.total)}</p>
                                    </div>
                                ))}
                            </div>

                            {confirmation.order.summary && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(confirmation.order.summary.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>
                                                {confirmation.order.summary.shippingCost === 0 ? 'FREE' : formatPrice(confirmation.order.summary.shippingCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                            <span>Total</span>
                                            <span>{formatPrice(confirmation.order.summary.finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        📞 We'll Contact You Soon!
                    </h3>
                    <p className="text-blue-700">
                        Our team will contact you through email or phone within 24 hours to confirm your order details and delivery schedule.
                    </p>
                </div>

                {confirmation?.nextSteps && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
                        <div className="space-y-3">
                            {confirmation.nextSteps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-700">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {confirmation?.supportInfo && (
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
                        <p className="text-gray-600 mb-3">{confirmation.supportInfo.message}</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a 
                                href={`mailto:${confirmation.supportInfo.email}`}
                                className="text-green-600 hover:text-green-700"
                            >
                                📧 {confirmation.supportInfo.email}
                            </a>
                            <span className="text-gray-600">
                                📞 {confirmation.supportInfo.phone}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleTrackOrder}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Track Order
                    </button>
                    <button
                        onClick={handleContinueShopping}
                        className="bg-white border border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccessPage;
