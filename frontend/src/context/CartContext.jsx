import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService.js';

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    totalDiscount: 0,
    shippingCost: 0,
    tax: 0,
    finalTotal: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(new Set()); // Track loading per product

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async (showOrderLoading = false) => {
    try {
      if (showOrderLoading) {
        setOrderSummaryLoading(true);
      } else {
        setLoading(true);
      }
      
      const cart = await cartService.getCart();
      if (cart.success) {
        setCartItems(cart.items);
        setOrderSummary(cart.orderSummary);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
      setOrderSummaryLoading(false);
    }
  };

  const addToCart = async (productId, options = {}) => {
    const { quantity = 1 } = options;
    
    try {
      setAddToCartLoading(prev => new Set(prev).add(productId));
      setOrderSummaryLoading(true);
      
      const cart = await cartService.addToCart(productId, options);
      if (cart.success) {
        setCartItems(cart.items);
        setOrderSummary(cart.orderSummary);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    } finally {
      setAddToCartLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      setOrderSummaryLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setOrderSummaryLoading(true);
      const cart = await cartService.removeFromCart(productId);
      if (cart.success) {
        setCartItems(cart.items);
        setOrderSummary(cart.orderSummary);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    } finally {
      setOrderSummaryLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setOrderSummaryLoading(true);
      const cart = await cartService.updateCartItem(productId, quantity);
      if (cart.success) {
        setCartItems(cart.items);
        setOrderSummary(cart.orderSummary);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      return false;
    } finally {
      setOrderSummaryLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setOrderSummaryLoading(true);
      const result = await cartService.clearCart();
      if (result.success) {
        setCartItems([]);
        setOrderSummary({
          subtotal: 0,
          totalDiscount: 0,
          shippingCost: 0,
          tax: 0,
          finalTotal: 0,
          itemCount: 0
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    } finally {
      setOrderSummaryLoading(false);
    }
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getCartCount = () => {
    return orderSummary?.itemCount || 0;
  };

  const isAddingToCart = (productId) => {
    return addToCartLoading.has(productId);
  };

  const value = {
    cartItems,
    orderSummary,
    loading,
    orderSummaryLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartCount,
    isAddingToCart,
    refreshCart: () => loadCart(true)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
