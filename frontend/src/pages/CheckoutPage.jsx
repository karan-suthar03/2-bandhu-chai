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

                navigate(`/order-success/${response.data.order.id}`, {
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#3a1f1f] mb-2">Complete Your Order</h1>
                    <p className="text-[#5b4636]">Just a few details and we'll get your tea ready for delivery</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Your Details</h2>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                                
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
                                <h3 className="text-lg font-semibold mb-4">Payment & Delivery</h3>
                                
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h4 className="font-semibold text-amber-800 mb-1">How it works</h4>
                                            <p className="text-sm text-amber-700">
                                                After placing your order, we'll call you to confirm details and arrange payment & delivery at your convenience.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH_ON_DELIVERY"
                                            checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <div className="flex-grow">
                                            <span className="font-medium">Cash on Delivery</span>
                                            <p className="text-sm text-gray-600">Pay when you receive your tea</p>
                                        </div>
                                    </label>
                                    
                                    <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="UPI"
                                            checked={formData.paymentMethod === 'UPI'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <div className="flex-grow">
                                            <span className="font-medium">UPI/Online Payment</span>
                                            <p className="text-sm text-gray-600">Pay via UPI, cards, or net banking</p>
                                        </div>
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
                                className="w-full bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white py-4 px-6 rounded-xl font-bold hover:from-[#d35400] hover:to-[#c0392b] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Placing Your Order...
                                    </div>
                                ) : (
                                    'Confirm Order'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6 text-[#3a1f1f]">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {checkoutPreview.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                                    <img 
                                        src={item.image.smallUrl}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="flex-grow">
                                        <h4 className="font-medium text-[#3a1f1f]">{item.name}</h4>
                                        <p className="text-sm text-[#5b4636]">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-[#3a1f1f]">₹{formatPrice(item.itemTotal)}</p>
                                        {item.itemDiscount > 0 && (
                                            <p className="text-sm text-green-600">
                                                Save ₹{formatPrice(item.itemDiscount)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-[#5b4636]">
                                <span>Subtotal</span>
                                <span>₹{formatPrice(checkoutPreview.summary.subtotal)}</span>
                            </div>
                            
                            {checkoutPreview.summary.totalDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Total Discount</span>
                                    <span>-₹{formatPrice(checkoutPreview.summary.totalDiscount)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-[#5b4636]">
                                <span>Shipping</span>
                                <span className={checkoutPreview.summary.shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                                    {checkoutPreview.summary.shippingCost === 0 ? 'FREE' : `₹${formatPrice(checkoutPreview.summary.shippingCost)}`}
                                </span>
                            </div>
                            
                            <div className="flex justify-between text-[#5b4636]">
                                <span>Tax (GST 18%)</span>
                                <span>₹{formatPrice(checkoutPreview.summary.tax)}</span>
                            </div>
                            
                            <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 text-[#e67e22]">
                                <span>Total Amount</span>
                                <span>₹{formatPrice(checkoutPreview.summary.finalTotal)}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    What happens next?
                                </h3>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• We'll call you within 24 hours</li>
                                    <li>• Confirm your order details</li>
                                    <li>• Arrange convenient payment & delivery</li>
                                    <li>• Fresh tea delivered to your door</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
