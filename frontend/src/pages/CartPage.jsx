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
            <main className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 via-white to-[#faf8f3]">
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
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-[#e67e22] mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                <h1 className="text-4xl font-bold text-[#3a1f1f] mb-3">Your Tea Selection</h1>
                                <p className="text-[#5b4636] text-lg max-w-2xl mx-auto">
                                    Review your carefully selected premium teas and place your order. 
                                    We'll contact you to arrange payment and delivery.
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-center space-x-2 text-sm text-[#5b4636]">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No payment required now • Free consultation call • Flexible delivery</span>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        {!loading && cartItems.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#f7ebc9] to-[#e8d5a3] flex items-center justify-center">
                                    <svg className="w-16 h-16 text-[#e67e22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-[#3a1f1f] mb-4">Start Your Tea Journey</h2>
                                <p className="text-[#5b4636] text-lg mb-8 max-w-md mx-auto">
                                    Discover our collection of premium teas crafted for the perfect cup
                                </p>
                                <a 
                                    href="/shop" 
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white px-8 py-4 rounded-xl font-bold hover:from-[#d35400] hover:to-[#c0392b] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <span>Browse Our Teas</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                                    <div className="lg:col-span-1">
                                        <div className="sticky top-8">
                                            <OrderSummary
                                                orderSummary={orderSummary}
                                                loading={orderSummaryLoading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

export default CartPage;
