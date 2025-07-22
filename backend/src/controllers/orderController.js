import prisma from "../config/prisma.js";

class OrderController {

    async createOrder(req, res) {
        try {
            const {
                customerName,
                customerEmail,
                customerPhone,
                shippingAddress,
                paymentMethod = 'CASH_ON_DELIVERY',
                notes
            } = req.body;

            if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required information: customer name, email, phone number, and complete shipping address'
                });
            }

            if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Your cart is empty. Please add some products before placing an order.'
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
                    message: 'Some products in your cart are no longer available. Please review your cart and try again.'
                });
            }

            let subtotal = 0;
            let totalDiscount = 0;
            const orderItems = [];

            for (const cartItem of cartItems) {
                const product = products.find(p => p.id === cartItem.productId);
                if (!product) continue;

                if (product.stock < cartItem.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sorry, we don't have enough stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}. Please update your cart and try again.`
                    });
                }

                const itemTotal = product.price * cartItem.quantity;
                const itemDiscount = product.oldPrice ? (product.oldPrice - product.price) * cartItem.quantity : 0;

                subtotal += itemTotal;
                totalDiscount += itemDiscount;

                orderItems.push({
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    quantity: cartItem.quantity
                });
            }

            const shippingCost = subtotal > 999 ? 0 : 99;
            const tax = Math.round(subtotal * 0.18); // 18% GST
            const finalTotal = subtotal + shippingCost + tax;

            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data: {
                        sessionId: req.session.id,
                        customerName,
                        customerEmail,
                        customerPhone,
                        shippingAddress,
                        paymentMethod,
                        subtotal,
                        totalDiscount,
                        shippingCost,
                        tax,
                        finalTotal,
                        notes,
                        orderItems: {
                            create: orderItems
                        },
                        statusHistory: {
                            create: {
                                status: 'PENDING',
                                notes: 'Order created'
                            }
                        }
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        },
                        statusHistory: true
                    }
                });

                for (const item of orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });
                }

                return newOrder;
            });

            req.session.cart = {
                items: [],
                createdAt: new Date(),
                lastUpdated: new Date()
            };

            res.status(201).json({
                success: true,
                message: 'Order placed successfully! 🎉',
                userMessage: {
                    title: 'Thank you for your order!',
                    message: 'Your order has been placed successfully. We will contact you through email or call you within 24 hours to confirm your order details and delivery schedule.',
                    contactInfo: 'If you have any questions, please contact us at support@bandhuchai.com or call us at +91-XXXXXXXXXX',
                    nextSteps: [
                        'You will receive an order confirmation email shortly',
                        'Our team will contact you within 24 hours',
                        'We will confirm your delivery address and preferred time',
                        'Your order will be processed and shipped once confirmed'
                    ]
                },
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    statusMessage: 'Order received - Awaiting confirmation',
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    customerPhone: order.customerPhone,
                    finalTotal: order.finalTotal,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt,
                    estimatedDelivery: '3-7 business days (after confirmation)'
                }
            });

        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({
                success: false,
                message: 'Sorry, we encountered an issue while processing your order. Please try again or contact our support team.'
            });
        }
    }

    async getOrderConfirmation(req, res) {
        try {
            const { orderNumber } = req.params;

            const order = await prisma.order.findUnique({
                where: { orderNumber },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                confirmation: {
                    title: 'Order Confirmed! 🎉',
                    message: 'Thank you for choosing Bandhu Chai! Your order has been successfully placed.',
                    contactMessage: 'We will contact you within 24 hours through email or phone to confirm your order details and delivery schedule.',
                    order: {
                        orderNumber: order.orderNumber,
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        customerPhone: order.customerPhone,
                        status: order.status,
                        statusMessage: 'Order received - Awaiting confirmation',
                        items: order.orderItems.map(item => ({
                            name: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.price * item.quantity,
                            image: item.product?.image
                        })),
                        summary: {
                            subtotal: order.subtotal,
                            shippingCost: order.shippingCost,
                            tax: order.tax,
                            finalTotal: order.finalTotal
                        },
                        paymentMethod: order.paymentMethod,
                        shippingAddress: order.shippingAddress,
                        createdAt: order.createdAt,
                        estimatedDelivery: '3-7 business days (after confirmation)'
                    },
                    nextSteps: [
                        'You will receive an order confirmation email shortly',
                        'Our team will contact you within 24 hours',
                        'We will confirm your delivery address and preferred time',
                        'Your order will be processed and shipped once confirmed'
                    ],
                    supportInfo: {
                        email: 'support@bandhuchai.com',
                        phone: '+91-XXXXXXXXXX',
                        message: 'If you have any questions, please don\'t hesitate to contact us.'
                    }
                }
            });

        } catch (error) {
            console.error('Get order confirmation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order confirmation'
            });
        }
    }

    async getOrder(req, res) {
        try {
            const { orderId } = req.params;

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    category: true
                                }
                            }
                        }
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                order
            });

        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order'
            });
        }
    }

    async getOrderByNumber(req, res) {
        try {
            const { orderNumber } = req.params;
            const { email } = req.query;

            const whereCondition = { orderNumber };
            if (email && email.trim() !== '') {
                whereCondition.customerEmail = email;
            }

            const order = await prisma.order.findFirst({
                where: whereCondition,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    category: true
                                }
                            }
                        }
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                order
            });

        } catch (error) {
            console.error('Get order by number error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order'
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, notes } = req.body;

            const validStatuses = [
                'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
                'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'
            ];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            const updatedOrder = await prisma.$transaction(async (tx) => {
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status,
                        confirmedAt: status === 'CONFIRMED' ? new Date() : order.confirmedAt,
                        shippedAt: status === 'SHIPPED' ? new Date() : order.shippedAt,
                        deliveredAt: status === 'DELIVERED' ? new Date() : order.deliveredAt,
                        cancelledAt: status === 'CANCELLED' ? new Date() : order.cancelledAt,
                    }
                });

                await tx.orderStatusHistory.create({
                    data: {
                        orderId,
                        status,
                        notes
                    }
                });

                if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
                    const orderItems = await tx.orderItem.findMany({
                        where: { orderId }
                    });

                    for (const item of orderItems) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                stock: {
                                    increment: item.quantity
                                }
                            }
                        });
                    }
                }

                return updated;
            });

            res.json({
                success: true,
                message: 'Order status updated successfully',
                order: updatedOrder
            });

        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update order status'
            });
        }
    }

    async getAllOrders(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            const whereClause = status ? { status } : {};

            const orders = await prisma.order.findMany({
                where: whereClause,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            orderItems: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: parseInt(skip),
                take: parseInt(limit)
            });

            const totalOrders = await prisma.order.count({
                where: whereClause
            });

            res.json({
                success: true,
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Get all orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get orders'
            });
        }
    }

    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: true
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            const nonCancellableStatuses = ['DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
            if (nonCancellableStatuses.includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Order cannot be cancelled as it is ${order.status.toLowerCase()}`
                });
            }

            const cancelledOrder = await prisma.$transaction(async (tx) => {
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'CANCELLED',
                        cancelledAt: new Date()
                    }
                });

                await tx.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: 'CANCELLED',
                        notes: reason || 'Order cancelled by customer'
                    }
                });

                for (const item of order.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                }

                return updated;
            });

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                order: cancelledOrder
            });

        } catch (error) {
            console.error('Cancel order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel order'
            });
        }
    }
}

export default new OrderController();
