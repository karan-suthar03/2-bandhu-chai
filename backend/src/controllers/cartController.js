import { CartService } from "../services/cartService.js";
import { sendSuccess, sendBadRequest } from "../utils/responseUtils.js";
import { validateId } from "../utils/validationUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getCart = asyncHandler(async (req, res) => {
    const cartData = await CartService.getCartData(req.session);
    
    return sendSuccess(res, {
        cart: cartData,
        sessionId: req.session.id
    });
});

const addToCart = asyncHandler(async (req, res) => {
    const productId = validateId(req.body.productId, 'Product ID');
    const variantId = req.body.variantId ? validateId(req.body.variantId, 'Variant ID') : null;
    const quantity = parseInt(req.body.quantity) || 1;

    await CartService.addItemToCart(req.session, productId, variantId, quantity);
    
    const cartData = await CartService.getCartData(req.session);
    return sendSuccess(res, {
        cart: cartData,
        message: 'Item added to cart successfully'
    });
});

const updateCartItem = asyncHandler(async (req, res) => {
    const productId = validateId(req.params.productId, 'Product ID');
    const { quantity, variantId } = req.body;
    const parsedVariantId = variantId ? validateId(variantId, 'Variant ID') : null;

    await CartService.updateCartItem(req.session, productId, parsedVariantId, quantity);
    
    const cartData = await CartService.getCartData(req.session);
    return sendSuccess(res, {
        cart: cartData,
        message: 'Cart item updated successfully'
    });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const productId = validateId(req.params.productId, 'Product ID');

    await CartService.removeCartItem(req.session, productId);
    
    const cartData = await CartService.getCartData(req.session);
    return sendSuccess(res, {
        cart: cartData,
        message: 'Item removed from cart successfully'
    });
});

const clearCart = asyncHandler(async (req, res) => {
    CartService.clearCart(req.session);
    
    return sendSuccess(res, {
        cart: {
            items: [],
            orderSummary: {
                subtotal: 0,
                totalDiscount: 0,
                shippingCost: 0,
                finalTotal: 0,
                itemCount: 0
            }
        },
        message: 'Cart cleared successfully'
    });
});

const syncCart = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items)) {
        return sendBadRequest(res, 'Invalid cart data - items must be an array');
    }

    CartService.clearCart(req.session);
    
    for (const item of items) {
        try {
            const productId = validateId(item.productId, 'Product ID');
            const quantity = parseInt(item.quantity) || 1;
            const variantId = item.variantId ? validateId(item.variantId, 'Variant ID') : null;
            
            await CartService.addItemToCart(req.session, productId, variantId, quantity);
        } catch (error) {
            console.warn(`Skipping invalid cart item:`, error.message);
        }
    }

    const cartData = await CartService.getCartData(req.session);
    return sendSuccess(res, {
        cart: cartData,
        message: 'Cart synchronized successfully'
    });
});

const getCheckoutPreview = asyncHandler(async (req, res) => {
    const checkoutPreview = await CartService.getCheckoutPreview(req.session);
    
    return sendSuccess(res, {
        checkoutPreview
    });
});

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    getCheckoutPreview
};
