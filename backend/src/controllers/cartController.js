import prisma from "../config/prisma.js";

class CartController {

    async getCart(req, res) {
        try {
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
                    id: { in: productIds }
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
            const tax = Math.round(subtotal * 0.18); // 18% GST
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

        } catch (error) {
            console.error('Get cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cart'
            });
        }
    }

    // Add item to cart
    async addToCart(req, res) {
        try {
            const productId = parseInt(req.body.productId);
            const quantity = parseInt(req.body.quantity) || 1;

            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid product ID is required'
                });
            }

            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
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

        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add item to cart'
            });
        }
    }

    async updateCartItem(req, res) {
        try {
            const productId = parseInt(req.params.productId); // Convert to integer
            const { quantity } = req.body;

            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }

            if (!req.session.cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }

            const itemIndex = req.session.cart.items.findIndex(
                item => item.productId === productId
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart'
                });
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

        } catch (error) {
            console.error('Update cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update cart'
            });
        }
    }

    async removeFromCart(req, res) {
        try {
            const productId = parseInt(req.params.productId);

            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }

            if (!req.session.cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
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

        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove item from cart'
            });
        }
    }

    async clearCart(req, res) {
        try {
            if (req.session.cart) {
                req.session.cart.items = [];
                req.session.cart.lastUpdated = new Date();
            }

            res.json({
                success: true,
                message: 'Cart cleared'
            });

        } catch (error) {
            console.error('Clear cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear cart'
            });
        }
    }

    async syncCart(req, res) {
        try {
            const { items } = req.body;

            if (!Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cart data'
                });
            }

            // Convert productIds to integers and validate
            const validItems = items.map(item => ({
                ...item,
                productId: parseInt(item.productId),
                quantity: parseInt(item.quantity) || 1
            })).filter(item => !isNaN(item.productId) && item.productId > 0);

            if (validItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid items in cart'
                });
            }

            const productIds = validItems.map(item => item.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } }
            });

            if (products.length !== productIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some products not found'
                });
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

        } catch (error) {
            console.error('Sync cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sync cart'
            });
        }
    }

    async getCheckoutPreview(req, res) {
        try {
            if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cart is empty'
                });
            }

            const cartItems = req.session.cart.items;
            const productIds = cartItems.map(item => item.productId);

            const products = await prisma.product.findMany({
                where: { id: { in: productIds } }
            });

            if (products.length !== productIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some products are no longer available'
                });
            }

            let subtotal = 0;
            let totalDiscount = 0;
            const checkoutItems = [];
            const stockIssues = [];

            for (const cartItem of cartItems) {
                const product = products.find(p => p.id === cartItem.productId);
                if (!product) continue;

                // Check stock availability
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
            const tax = Math.round(subtotal * 0.18); // 18% GST
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
                    taxRate: 18, // GST percentage
                    returnPolicy: '7 days return policy',
                    exchangePolicy: 'Exchange within 7 days'
                }
            };

            res.json({
                success: true,
                checkoutPreview
            });

        } catch (error) {
            console.error('Get checkout preview error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get checkout preview'
            });
        }
    }
}

export default new CartController();
