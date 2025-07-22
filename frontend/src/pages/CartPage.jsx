import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {useCart} from "../context/CartContext.jsx";
import CartItemsSection from "../components/cart/CartItemsSection.jsx";
import OrderSummary from "../components/cart/OrderSummary.jsx";

function CartPage() {
    const { cartItems, orderSummary, loading, orderSummaryLoading, removeFromCart, clearCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleRemoveFromCart = async (productId) => {
        try {
            const success = await removeFromCart(productId);
            if (!success) {
                setError('Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            setError('Failed to remove item from cart');
        }
    };

    const handleClearCart = async () => {
        try {
            const success = await clearCart();
            if (!success) {
                setError('Failed to clear cart');
            }
        } catch (error) {
            console.error('Clear cart error:', error);
            setError('Failed to clear cart');
        }
    };

    const handleQuantityUpdate = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            return handleRemoveFromCart(productId);
        }
        
        try {
            const success = await updateQuantity(productId, newQuantity);
            if (!success) {
                setError('Failed to update quantity');
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            setError('Failed to update quantity');
        }
    };
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <>
            <main className="min-h-screen pt-32 bg-gray-50">
                {error && (
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                            <button 
                                className="ml-2 text-sm underline"
                                onClick={() => setError(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}
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
                                <CartItemsSection
                                    cartItems={cartItems}
                                    loading={loading}
                                    onQuantityUpdate={handleQuantityUpdate}
                                    onRemoveFromCart={handleRemoveFromCart}
                                    onProductClick={handleProductClick}
                                    onClearCart={handleClearCart}
                                />
                            </div>

                            {!loading && cartItems.length > 0 && (
                                <OrderSummary
                                    orderSummary={orderSummary}
                                    loading={orderSummaryLoading}
                                />
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default CartPage;
