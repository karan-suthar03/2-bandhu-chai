import {useEffect, useState, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import {useCart} from "../context/CartContext.jsx";
import {getCartItems} from "../api/products.js";
import CartItemsSection from "../components/cart/CartItemsSection.jsx";
import OrderSummary from "../components/cart/OrderSummary.jsx";

function CartPage() {
    const { cartItems: cartIds, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastFetchedIds, setLastFetchedIds] = useState('');

    const cartIdsString = useMemo(() => {
        return cartIds.map(item => item.id).sort().join(',');
    }, [cartIds]);

    useEffect(() => {
        const fetchCartItems = async () => {

            if (cartIdsString === lastFetchedIds) {
                return;
            }

            if (cartIds.length === 0) {
                setCartItems([]);
                setLoading(false);
                setLastFetchedIds('');
                return;
            }

            try {
                setLoading(true);
                const productIds = cartIds.map(item => item.id);
                const products = await getCartItems(productIds);
                
                if (products && products.length > 0) {

                    const savedQuantities = localStorage.getItem('cart-quantities');
                    const quantities = savedQuantities ? JSON.parse(savedQuantities) : {};
                    
                    const cartItemsWithQuantity = products.map(product => ({
                        ...product,
                        quantity: quantities[product.id] || 1,
                    }));
                    setCartItems(cartItemsWithQuantity);
                } else {
                    console.error("No products found in the cart");
                    setCartItems([]);
                }
                setLastFetchedIds(cartIdsString);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [cartIdsString, lastFetchedIds, cartIds]);


    const handleRemoveFromCart = (productId) => {

        removeFromCart(productId);

        setCartItems(prev => prev.filter(item => item.id !== productId));

        const newIds = cartIds.filter(item => item.id !== productId).map(item => item.id).sort().join(',');
        setLastFetchedIds(newIds);


        const savedQuantities = localStorage.getItem('cart-quantities');
        if (savedQuantities) {
            const quantities = JSON.parse(savedQuantities);
            delete quantities[productId];
            localStorage.setItem('cart-quantities', JSON.stringify(quantities));
        }
    };


    const handleClearCart = () => {
        clearCart();
        setCartItems([]);
        setLastFetchedIds('');
        // Clear quantities from localStorage
        localStorage.removeItem('cart-quantities');
    };

    const handleQuantityUpdate = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setCartItems(prev => {
            const updatedItems = prev.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            
            // Store quantities in localStorage
            const quantities = {};
            updatedItems.forEach(item => {
                quantities[item.id] = item.quantity;
            });
            localStorage.setItem('cart-quantities', JSON.stringify(quantities));
            
            return updatedItems;
        });
    };
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

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
                                    cartItems={cartItems}
                                    subtotal={subtotal}
                                    totalDiscount={totalDiscount}
                                    shippingCost={shippingCost}
                                    tax={tax}
                                    finalTotal={finalTotal}
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
