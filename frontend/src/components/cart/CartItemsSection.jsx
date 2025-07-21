import CartItem from "./CartItem.jsx";
import productImage from "../../assets/product.jpg";

function CartItemsSection({ 
    cartItems, 
    loading, 
    onQuantityUpdate, 
    onRemoveFromCart, 
    onProductClick, 
    onClearCart 
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#3a1f1f]">
                            Cart Items (0)
                        </h2>
                    </div>
                </div>
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e67e22] mx-auto mb-4"></div>
                    <p className="text-[#5b4636]">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#3a1f1f]">
                            Cart Items (0)
                        </h2>
                    </div>
                </div>
                <div className="p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#3a1f1f] mb-2">Your cart is empty</h3>
                    <p className="text-[#5b4636] mb-4">Add some delicious tea to get started!</p>
                    <a href="/shop" className="inline-block bg-[#e67e22] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d35400] transition cursor-pointer">
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="bg-gradient-to-r from-[#f7ebc9] to-[#e8d5a3] px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#3a1f1f]">
                            Cart Items ({cartItems.length})
                        </h2>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClearCart();
                            }}
                            className="text-[#e67e22] hover:text-[#d35400] font-medium text-sm transition cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onQuantityUpdate={onQuantityUpdate}
                            onRemove={onRemoveFromCart}
                            onProductClick={onProductClick}
                        />
                    ))}
                </div>

                <div className="p-6 bg-gray-50 border-t">
                    <button className="flex items-center space-x-2 text-[#e67e22] hover:text-[#d35400] font-medium transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Continue Shopping</span>
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Recommended for you</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                        <div key={item} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                            <img src={productImage} alt="Recommended Tea" className="w-16 h-16 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-[#3a1f1f] text-sm">Earl Grey Tea</h4>
                                <p className="text-xs text-[#5b4636] mb-1">Classic blend with bergamot</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-[#3a1f1f]">₹549</span>
                                    <span className="text-xs text-gray-500 line-through">₹699</span>
                                </div>
                            </div>
                            <button className="text-[#e67e22] hover:text-[#d35400] text-sm font-medium cursor-pointer">
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default CartItemsSection;
