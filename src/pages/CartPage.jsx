import { useState } from "react";
import productImage from "../assets/product.jpg";

function CartPage() {
    const [cartItems] = useState([
        {
            id: 1,
            name: "Organic Assam Black Tea",
            price: 699,
            oldPrice: 899,
            image: productImage,
            quantity: 2,
            size: "250g",
            inStock: true,
            discount: 22
        },
        {
            id: 2,
            name: "Premium Green Tea",
            price: 849,
            oldPrice: 999,
            image: productImage,
            quantity: 1,
            size: "500g",
            inStock: true,
            discount: 15
        },
        {
            id: 3,
            name: "Herbal Fusion Tea",
            price: 599,
            oldPrice: 749,
            image: productImage,
            quantity: 3,
            size: "300g",
            inStock: false,
            discount: 20
        }
    ]);

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalDiscount = cartItems.reduce((total, item) => total + ((item.oldPrice - item.price) * item.quantity), 0);
    const shippingCost = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const finalTotal = subtotal + shippingCost + tax;

    return (
        <>
            <main className="min-h-screen pt-20 bg-gray-50">
                {}
                <section className="bg-white py-8 px-4 border-b">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-[#3a1f1f] mb-2">Shopping Cart</h1>
                                <p className="text-[#5b4636]">Review your items and proceed to checkout</p>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-[#e67e22] text-white rounded-full flex items-center justify-center text-sm font-bold mb-1">
                                        1
                                    </div>
                                    <span className="text-xs text-[#e67e22] font-medium">Cart</span>
                                </div>
                                <div className="w-12 h-0.5 bg-gray-300"></div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold mb-1">
                                        2
                                    </div>
                                    <span className="text-xs text-gray-500">Checkout</span>
                                </div>
                                <div className="w-12 h-0.5 bg-gray-300"></div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold mb-1">
                                        3
                                    </div>
                                    <span className="text-xs text-gray-500">Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {}
                                    <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-[#3a1f1f]">
                                                Cart Items ({cartItems.length})
                                            </h2>
                                            <button className="text-[#e67e22] hover:text-[#d35400] font-medium text-sm transition">
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    {}
                                    <div className="divide-y divide-gray-200">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                                                <div className="flex items-center space-x-4">
                                                    {}
                                                    <div className="relative">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        {!item.inStock && (
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-xs font-medium">Out of Stock</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {}
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-[#3a1f1f] mb-1">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-[#5b4636] mb-2">Size: {item.size}</p>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-lg font-bold text-[#3a1f1f]">
                                                                ₹{item.price}
                                                            </span>
                                                            {item.oldPrice && (
                                                                <>
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        ₹{item.oldPrice}
                                                                    </span>
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                        {item.discount}% off
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {}
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                                            <button className="p-2 hover:bg-gray-100 transition">
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                                </svg>
                                                            </button>
                                                            <span className="px-4 py-2 font-semibold text-[#3a1f1f] min-w-[3rem] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button className="p-2 hover:bg-gray-100 transition">
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {}
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-[#3a1f1f]">
                                                            ₹{item.price * item.quantity}
                                                        </p>
                                                        {item.oldPrice && (
                                                            <p className="text-sm text-gray-500 line-through">
                                                                ₹{item.oldPrice * item.quantity}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {}
                                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {}
                                    <div className="p-6 bg-gray-50 border-t">
                                        <button className="flex items-center space-x-2 text-[#e67e22] hover:text-[#d35400] font-medium transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            <span>Continue Shopping</span>
                                        </button>
                                    </div>
                                </div>

                                {}
                                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Recommended for you</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[1, 2].map((item) => (
                                            <div key={item} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition">
                                                <img src={productImage} alt="Recommended Tea" className="w-16 h-16 object-cover rounded-lg" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[#3a1f1f] text-sm">Earl Grey Tea</h4>
                                                    <p className="text-xs text-[#5b4636] mb-1">Classic blend with bergamot</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-bold text-[#3a1f1f]">₹549</span>
                                                        <span className="text-xs text-gray-500 line-through">₹699</span>
                                                    </div>
                                                </div>
                                                <button className="text-[#e67e22] hover:text-[#d35400] text-sm font-medium">
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    {}
                                    <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 rounded-t-xl">
                                        <h2 className="text-xl font-bold text-[#3a1f1f]">Order Summary</h2>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {}
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-[#5b4636]">Subtotal ({cartItems.length} items)</span>
                                                <span className="font-semibold text-[#3a1f1f]">₹{subtotal}</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-₹{totalDiscount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#5b4636]">Shipping</span>
                                                <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-[#3a1f1f]'}`}>
                                                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#5b4636]">Tax (GST 18%)</span>
                                                <span className="font-semibold text-[#3a1f1f]">₹{tax}</span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-[#3a1f1f]">Total</span>
                                                <span className="text-2xl font-bold text-[#e67e22]">₹{finalTotal}</span>
                                            </div>
                                        </div>

                                        {}
                                        <div className="border-t pt-4">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent"
                                                />
                                                <button className="px-4 py-2 bg-[#e67e22] text-white rounded-lg hover:bg-[#d35400] transition font-medium">
                                                    Apply
                                                </button>
                                            </div>
                                        </div>

                                        {}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-green-800 font-semibold">Great savings!</span>
                                            </div>
                                            <p className="text-sm text-green-700">
                                                You saved ₹{totalDiscount} on this order!
                                            </p>
                                            {shippingCost === 0 && (
                                                <p className="text-sm text-green-700 mt-1">
                                                    Free shipping applied (₹99 saved)
                                                </p>
                                            )}
                                        </div>

                                        {}
                                        <button className="w-full bg-[#e67e22] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d35400] transition-all transform hover:scale-105 shadow-lg">
                                            Proceed to Checkout
                                        </button>

                                        {}
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

                                        {}
                                        <div className="flex items-center justify-center space-x-2 text-sm text-[#5b4636]">
                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Secure 256-bit SSL encrypted checkout</span>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Delivery Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 000 2v9a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 000-2H6z" />
                                            </svg>
                                            <span className="text-[#5b4636]">Free delivery on orders above ₹999</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-[#5b4636]">Delivery in 2-3 business days</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-[#5b4636]">Easy returns within 7 days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default CartPage;
