import prisma from "../config/prisma.js";
import { enrichCartItems, calculateOrderSummary, validateCartStock, getDefaultVariant } from "../utils/cartUtils.js";
import { BadRequestError, NotFoundError } from "../middlewares/errors/AppError.js";

export class CartService {
    static initializeCart(session) {
        if (!session.cart) {
            session.cart = {
                items: [],
                createdAt: new Date(),
                lastUpdated: new Date()
            };
        }
    }

    static async getCartData(session) {
        this.initializeCart(session);
        
        const cartItems = session.cart.items;
        if (cartItems.length === 0) {
            return {
                items: [],
                orderSummary: calculateOrderSummary([])
            };
        }

        const productIds = cartItems.map(item => item.productId);
        const variantIds = cartItems.map(item => item.variantId).filter(Boolean);
        
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                deactivated: false
            },
            include: {
                variants: {
                    where: { id: { in: variantIds } }
                }
            }
        });

        const enrichedCart = enrichCartItems(cartItems, products);
        const orderSummary = calculateOrderSummary(enrichedCart);

        return {
            items: enrichedCart,
            orderSummary
        };
    }

    static async addItemToCart(session, productId, variantId, quantity = 1) {
        this.initializeCart(session);

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: true,
                defaultVariant: true
            }
        });

        if (!product || product.deactivated) {
            throw new NotFoundError('Product not found or is no longer available');
        }

        const finalVariantId = variantId || getDefaultVariant(product);
        if (!finalVariantId) {
            throw new BadRequestError('No variants available for this product');
        }

        const variant = product.variants.find(v => v.id === finalVariantId);
        if (!variant) {
            throw new BadRequestError('Selected variant not found');
        }

        if (variant.stock < quantity) {
            throw new BadRequestError(`Insufficient stock. Only ${variant.stock} items available`);
        }

        const existingItemIndex = session.cart.items.findIndex(
            item => item.productId === productId && item.variantId === finalVariantId
        );

        if (existingItemIndex >= 0) {
            const newQuantity = session.cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > variant.stock) {
                throw new BadRequestError(`Cannot add more items. Maximum available: ${variant.stock}`);
            }
            session.cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            session.cart.items.push({
                productId,
                variantId: finalVariantId,
                quantity,
                addedAt: new Date()
            });
        }

        session.cart.lastUpdated = new Date();
        return true;
    }

    static async updateCartItem(session, productId, variantId, quantity) {
        this.initializeCart(session);

        const itemIndex = session.cart.items.findIndex(
            item => item.productId === productId && (!variantId || item.variantId === variantId)
        );

        if (itemIndex === -1) {
            throw new NotFoundError('Item not found in cart');
        }

        if (quantity <= 0) {
            session.cart.items.splice(itemIndex, 1);
        } else {
            const variant = await prisma.productVariant.findUnique({
                where: { id: session.cart.items[itemIndex].variantId }
            });
            
            if (!variant) {
                throw new NotFoundError('Product variant not found');
            }
            
            if (quantity > variant.stock) {
                throw new BadRequestError(`Insufficient stock. Only ${variant.stock} items available`);
            }

            session.cart.items[itemIndex].quantity = quantity;
        }

        session.cart.lastUpdated = new Date();
        return true;
    }

    static removeCartItem(session, productId) {
        this.initializeCart(session);

        const itemIndex = session.cart.items.findIndex(
            item => item.productId === productId
        );

        if (itemIndex === -1) {
            throw new NotFoundError('Item not found in cart');
        }

        session.cart.items.splice(itemIndex, 1);
        session.cart.lastUpdated = new Date();
        return true;
    }

    static clearCart(session) {
        if (session.cart) {
            session.cart.items = [];
            session.cart.lastUpdated = new Date();
        }
        return true;
    }

    static async getCheckoutPreview(session) {
        const cartData = await this.getCartData(session);
        
        if (cartData.items.length === 0) {
            throw new BadRequestError('Cart is empty');
        }

        const productIds = session.cart.items.map(item => item.productId);
        const variantIds = session.cart.items.map(item => item.variantId).filter(Boolean);
        
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                variants: { where: { id: { in: variantIds } } }
            }
        });

        const stockIssues = validateCartStock(session.cart.items, products);
        if (stockIssues.length > 0) {
            throw new BadRequestError('Stock issues found', stockIssues);
        }

        return {
            items: cartData.items,
            summary: cartData.orderSummary,
            policies: {
                freeShippingThreshold: 999,
                returnPolicy: '7 days return policy',
                exchangePolicy: 'Exchange within 7 days'
            }
        };
    }
}
