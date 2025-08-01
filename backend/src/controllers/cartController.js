import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError } from "../middlewares/errors/AppError.js";

async function getCart(req, res) {
    const sessionId = req.session.id;
    
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            createdAt: new Date(),
            lastUpdated: new Date()
        };
    }

    const cartItems = req.session.cart.items;
    if (cartItems.length === 0) {
        return res.json({ 
            success: true, 
            cart: { 
                items: [], 
                orderSummary: {
                    subtotal: 0,
                    totalDiscount: 0,
                    shippingCost: 0,
                    tax: 0,
                    finalTotal: 0,
                    itemCount: 0
                }
            },
            sessionId: sessionId 
        });
    }

    const productIds = cartItems.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds },
            deactivated: false
        }
    });

    const enrichedCart = products.map(product => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        return {
            ...product,
            quantity: cartItem.quantity,
            addedAt: cartItem.addedAt
        };
    });

    const subtotal = enrichedCart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
    
    const totalDiscount = enrichedCart.reduce((sum, item) => 
        sum + ((item.oldPrice - item.price) * item.quantity), 0
    );
    
    const shippingCost = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const finalTotal = subtotal + shippingCost + tax;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const orderSummary = {
        subtotal,
        totalDiscount,
        shippingCost,
        tax,
        finalTotal,
        itemCount
    };

    res.json({
        success: true,
        cart: {
            items: enrichedCart,
            orderSummary
        },
        sessionId: sessionId
    });
}

async function addToCart(req, res) {
    const productId = parseInt(req.body.productId);
    const quantity = parseInt(req.body.quantity) || 1;

    if (!productId || isNaN(productId)) {
        throw new BadRequestError('Valid product ID is required');
    }

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product || product.deactivated) {
        throw new NotFoundError('Product not found or is no longer available');
    }

    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            createdAt: new Date(),
            lastUpdated: new Date()
        };
    }

    const existingItemIndex = req.session.cart.items.findIndex(
        item => item.productId === productId
    );

    if (existingItemIndex >= 0) {
        req.session.cart.items[existingItemIndex].quantity += quantity;
        req.session.cart.items[existingItemIndex].updatedAt = new Date();
    } else {
        req.session.cart.items.push({
            productId,
            quantity,
            addedAt: new Date(),
            updatedAt: new Date()
        });
    }

    req.session.cart.lastUpdated = new Date();

    res.json({
        success: true,
        message: 'Item added to cart',
        cartItemCount: req.session.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
}

async function updateCartItem(req, res) {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    if (!productId || isNaN(productId)) {
        throw new BadRequestError('Invalid product ID');
    }

    if (!req.session.cart) {
        throw new NotFoundError('Cart not found');
    }

    const itemIndex = req.session.cart.items.findIndex(
        item => item.productId === productId
    );

    if (itemIndex === -1) {
        throw new NotFoundError('Item not found in cart');
    }

    if (quantity <= 0) {
        req.session.cart.items.splice(itemIndex, 1);
    } else {
        req.session.cart.items[itemIndex].quantity = quantity;
        req.session.cart.items[itemIndex].updatedAt = new Date();
    }

    req.session.cart.lastUpdated = new Date();

    res.json({
        success: true,
        message: 'Cart updated',
        cartItemCount: req.session.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
}

async function removeFromCart(req, res) {
    const productId = parseInt(req.params.productId);

    if (!productId || isNaN(productId)) {
        throw new BadRequestError('Invalid product ID');
    }

    if (!req.session.cart) {
        throw new NotFoundError('Cart not found');
    }

    req.session.cart.items = req.session.cart.items.filter(
        item => item.productId !== productId
    );

    req.session.cart.lastUpdated = new Date();

    res.json({
        success: true,
        message: 'Item removed from cart',
        cartItemCount: req.session.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
}

async function clearCart(req, res) {
    if (req.session.cart) {
        req.session.cart.items = [];
        req.session.cart.lastUpdated = new Date();
    }

    res.json({
        success: true,
        message: 'Cart cleared'
    });
}

async function syncCart(req, res) {
    const { items } = req.body;

    if (!Array.isArray(items)) {
        throw new BadRequestError('Invalid cart data');
    }

    const validItems = items.map(item => ({
        ...item,
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity) || 1
    })).filter(item => !isNaN(item.productId) && item.productId > 0);

    if (validItems.length === 0) {
        throw new BadRequestError('No valid items in cart');
    }

    const productIds = validItems.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
        throw new BadRequestError('Some products not found');
    }

    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            createdAt: new Date(),
            lastUpdated: new Date()
        };
    }

    req.session.cart.items = validItems.map(item => ({
        ...item,
        updatedAt: new Date()
    }));
    req.session.cart.lastUpdated = new Date();

    res.json({
        success: true,
        message: 'Cart synced',
        cartItemCount: validItems.reduce((sum, item) => sum + item.quantity, 0)
    });
}

async function getCheckoutPreview(req, res) {
    if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
    }

    const cartItems = req.session.cart.items;
    const productIds = cartItems.map(item => item.productId);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
        throw new BadRequestError('Some products are no longer available');
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const checkoutItems = [];
    const stockIssues = [];

    for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) continue;

        if (product.stock < cartItem.quantity) {
            stockIssues.push({
                productId: product.id,
                productName: product.name,
                requested: cartItem.quantity,
                available: product.stock
            });
        }

        const itemTotal = product.price * cartItem.quantity;
        const itemDiscount = product.oldPrice ? (product.oldPrice - product.price) * cartItem.quantity : 0;

        subtotal += itemTotal;
        totalDiscount += itemDiscount;

        checkoutItems.push({
            ...product,
            quantity: cartItem.quantity,
            itemTotal,
            itemDiscount
        });
    }

    if (stockIssues.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Stock issues found',
            stockIssues
        });
    }

    const shippingCost = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const finalTotal = subtotal + shippingCost + tax;

    const checkoutPreview = {
        items: checkoutItems,
        summary: {
            subtotal,
            totalDiscount,
            shippingCost,
            tax,
            finalTotal,
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        },
        policies: {
            freeShippingThreshold: 999,
            taxRate: 18,
            returnPolicy: '7 days return policy',
            exchangePolicy: 'Exchange within 7 days'
        }
    };

    res.json({
        success: true,
        checkoutPreview
    });
}

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    getCheckoutPreview
};
