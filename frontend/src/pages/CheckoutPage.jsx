import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/priceUtils.js';
import axios from '../api/axios.js';

function CheckoutPage() {
    const {clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutPreview, setCheckoutPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingAddress: {
            street: '',
            city: '',
            state: 'Maharashtra',
            pincode: '',
            landmark: ''
        },
        paymentMethod: 'CASH_ON_DELIVERY',
        notes: ''
    });

    useEffect(() => {
        const fetchCheckoutPreview = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/cart/checkout-preview');
                setCheckoutPreview(response.data.checkoutPreview);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch checkout preview:', error);
                setError(error.response?.data?.message || 'Failed to load checkout details');
                if (error.response?.status === 400) {
                    // Cart is empty or has issues, redirect to cart
                    navigate('/cart');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCheckoutPreview();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('shippingAddress.')) {
            const addressField = name.split('.')[1];
            setFormData({
                ...formData,
                shippingAddress: {
                    ...formData.shippingAddress,
                    [addressField]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        const { customerName, customerEmail, customerPhone, shippingAddress } = formData;
        
        if (!customerName.trim()) return 'Full name is required';
        if (!customerEmail.trim()) return 'Email is required';
        if (!customerPhone.trim()) return 'Phone number is required';
        if (!shippingAddress.street.trim()) return 'Street address is required';
        if (!shippingAddress.city.trim()) return 'City is required';
        if (!shippingAddress.pincode.trim()) return 'Pincode is required';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) return 'Please enter a valid email address';
        
        // Phone validation (basic)
        const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
        if (!phoneRegex.test(customerPhone)) return 'Please enter a valid phone number';
        
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/orders', formData);
            
            if (response.data.success) {
                clearCart();

                navigate(`/order-success/${response.data.order.orderNumber}`, {
                    state: { orderData: response.data }
                });
            }
        } catch (error) {
            console.error('Order submission error:', error);
            setError(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p>Loading checkout details...</p>
                </div>
            </div>
        );
    }

    if (!checkoutPreview) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Unable to load checkout details</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Checkout Details</h2>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.street"
                                            value={formData.shippingAddress.street}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="shippingAddress.city"
                                                value={formData.shippingAddress.city}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pincode *
                                            </label>
                                            <input
                                                type="text"
                                                name="shippingAddress.pincode"
                                                value={formData.shippingAddress.pincode}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State
                                        </label>
                                        <select
                                            name="shippingAddress.state"
                                            value={formData.shippingAddress.state}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="West Bengal">West Bengal</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.landmark"
                                            value={formData.shippingAddress.landmark}
                                            onChange={handleChange}
                                            placeholder="Near mall, hospital, etc."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH_ON_DELIVERY"
                                            checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <span>Cash on Delivery (COD)</span>
                                    </label>
                                    
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="UPI"
                                            checked={formData.paymentMethod === 'UPI'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <span>UPI Payment</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Notes (Optional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Any special instructions for delivery..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {checkoutPreview.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 py-3 border-b">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-grow">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatPrice(item.itemTotal)}</p>
                                        {item.itemDiscount > 0 && (
                                            <p className="text-sm text-green-600">
                                                Save {formatPrice(item.itemDiscount)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(checkoutPreview.summary.subtotal)}</span>
                            </div>
                            
                            {checkoutPreview.summary.totalDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Total Discount</span>
                                    <span>-{formatPrice(checkoutPreview.summary.totalDiscount)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>
                                    {checkoutPreview.summary.shippingCost === 0 ? 'FREE' : formatPrice(checkoutPreview.summary.shippingCost)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span>Tax (GST)</span>
                                <span>{formatPrice(checkoutPreview.summary.tax)}</span>
                            </div>
                            
                            <div className="flex justify-between text-xl font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>{formatPrice(checkoutPreview.summary.finalTotal)}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t text-sm text-gray-600">
                            <p className="mb-2">• {checkoutPreview.policies.returnPolicy}</p>
                            <p className="mb-2">• {checkoutPreview.policies.exchangePolicy}</p>
                            <p>• Free shipping on orders above {formatPrice(checkoutPreview.policies.freeShippingThreshold)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
