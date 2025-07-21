import { formatPrice } from "../../utils/priceUtils.js";

function OrderSummary({ 
    cartItems, 
    subtotal, 
    totalDiscount, 
    shippingCost, 
    tax, 
    finalTotal 
}) {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 rounded-t-xl">
                    <h2 className="text-xl font-bold text-[#3a1f1f]">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[#5b4636]">Subtotal ({cartItems.length} items)</span>
                            <span className="font-semibold text-[#3a1f1f]">₹{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{formatPrice(totalDiscount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#5b4636]">Shipping</span>
                            <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-[#3a1f1f]'}`}>
                                {shippingCost === 0 ? 'FREE' : `₹${formatPrice(shippingCost)}`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#5b4636]">Tax (GST 18%)</span>
                            <span className="font-semibold text-[#3a1f1f]">₹{formatPrice(tax)}</span>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-[#3a1f1f]">Total</span>
                            <span className="text-2xl font-bold text-[#e67e22]">₹{formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent"
                            />
                            <button className="px-4 py-2 bg-[#e67e22] text-white rounded-lg hover:bg-[#d35400] transition font-medium cursor-pointer">
                                Apply
                            </button>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-800 font-semibold">Great savings!</span>
                        </div>
                        <p className="text-sm text-green-700">
                            You saved ₹{formatPrice(totalDiscount)} on this order!
                        </p>
                        {shippingCost === 0 && (
                            <p className="text-sm text-green-700 mt-1">
                                Free shipping applied (₹99 saved)
                            </p>
                        )}
                    </div>
                    <button className="w-full bg-[#e67e22] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d35400] transition-all transform hover:scale-105 shadow-lg cursor-pointer">
                        Proceed to Checkout
                    </button>
                    <div className="text-center">
                        <p className="text-sm text-[#5b4636] mb-3">We accept</p>
                        <div className="flex justify-center space-x-3">
                            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                            <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">MC</span>
                            </div>
                            <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">UPI</span>
                            </div>
                            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">GPay</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-[#5b4636]">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secure 256-bit SSL encrypted checkout</span>
                    </div>
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
