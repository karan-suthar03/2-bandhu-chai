import { formatPrice } from "../../utils/priceUtils.js";
import { useNavigate } from 'react-router-dom';

function OrderSummary({ orderSummary, loading = false }) {
    const navigate = useNavigate();
    
    // Prevent errors if orderSummary is undefined/null
    const safeOrderSummary = orderSummary || {
        subtotal: 0,
        totalDiscount: 0,
        shippingCost: 0,
        finalTotal: 0,
        itemCount: 0
    };

    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            <div className="space-y-3">
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between">
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="h-12 bg-gray-300 rounded w-full"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 rounded-t-xl">
                    <h2 className="text-xl font-bold text-[#3a1f1f]">Order Total</h2>
                    {loading && (
                        <div className="mt-2">
                            <div className="inline-flex items-center text-sm text-[#5b4636]">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e67e22] mr-2"></div>
                                Updating...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[#5b4636]">Subtotal ({safeOrderSummary.itemCount} items)</span>
                                    <span className="font-semibold text-[#3a1f1f]">{formatPrice(safeOrderSummary.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatPrice(safeOrderSummary.totalDiscount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#5b4636]">Shipping</span>
                                    <span className={`font-semibold ${safeOrderSummary.shippingCost === 0 ? 'text-green-600' : 'text-[#3a1f1f]'}`}>
                                        {safeOrderSummary.shippingCost === 0 ? 'FREE' : formatPrice(safeOrderSummary.shippingCost)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-[#3a1f1f]">Total</span>
                                    <span className="text-2xl font-bold text-[#e67e22]">{formatPrice(safeOrderSummary.finalTotal)}</span>
                                </div>
                            </div>

                            {safeOrderSummary.subtotal > 0 && safeOrderSummary.subtotal < 999 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">
                                        Add {formatPrice(999 - safeOrderSummary.subtotal)} more for free shipping!
                                    </p>
                                </div>
                            )}

                            {safeOrderSummary.totalDiscount > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-800 font-semibold">Great savings!</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        You saved {formatPrice(safeOrderSummary.totalDiscount)} on this order!
                                    </p>
                                    {safeOrderSummary.shippingCost === 0 && (
                                        <p className="text-sm text-green-700 mt-1">
                                            Free shipping applied (₹99 saved)
                                        </p>
                                    )}
                                </div>
                            )}

                            <button 
                                className="w-full bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white font-bold py-4 px-4 rounded-xl hover:from-[#d35400] hover:to-[#c0392b] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                disabled={loading || safeOrderSummary.itemCount === 0}
                                onClick={() => navigate('/checkout')}
                            >
                                {loading ? 'Updating...' : 'Place Order'}
                            </button>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-amber-800 mb-1">Simple Order Process</h3>
                                        <p className="text-sm text-amber-700">
                                            Provide your details and we'll contact you to arrange payment and delivery. 
                                            No advance payment required!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center space-x-2 text-sm text-[#5b4636]">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Safe & secure order processing</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/*<div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">*/}
            {/*    <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Delivery Information</h3>*/}
            {/*    <div className="space-y-3">*/}
            {/*        <div className="flex items-center space-x-3">*/}
            {/*            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">*/}
            {/*                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />*/}
            {/*                <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 000 2v9a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 000-2H6z" />*/}
            {/*            </svg>*/}
            {/*            <span className="text-[#5b4636]">Free delivery on orders above ₹999</span>*/}
            {/*        </div>*/}
            {/*        <div className="flex items-center space-x-3">*/}
            {/*            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">*/}
            {/*                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />*/}
            {/*            </svg>*/}
            {/*            <span className="text-[#5b4636]">Delivery in 2-3 business days</span>*/}
            {/*        </div>*/}
            {/*        <div className="flex items-center space-x-3">*/}
            {/*            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">*/}
            {/*                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />*/}
            {/*            </svg>*/}
            {/*            <span className="text-[#5b4636]">Easy returns within 7 days</span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}

export default OrderSummary;
