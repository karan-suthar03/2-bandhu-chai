import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError } from "../middlewares/errors/AppError.js";

async function createOrder(req, res) {
    const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod = 'CASH_ON_DELIVERY',
        notes
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
        throw new BadRequestError('Please provide all required information: customer name, email, phone number, and complete shipping address');
    }

    if (!req.session.cart || !req.session.cart.items || req.session.cart.items.length === 0) {
        throw new BadRequestError('Your cart is empty. Please add some products before placing an order.');
    }

    const cartItems = req.session.cart.items;
    const productIds = cartItems.map(item => item.productId);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
        throw new BadRequestError('Some products in your cart are no longer available. Please review your cart and try again.');
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) continue;

        if (product.stock < cartItem.quantity) {
            throw new BadRequestError(`Sorry, we don't have enough stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}. Please update your cart and try again.`);
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
    const tax = Math.round(subtotal * 0.18);
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
}

async function getOrderConfirmation(req, res) {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: {
                    product: {
                        select: {
                            image: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    res.json({
        success: true,
        data: {
            order: {
                id: order.id,
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
}

async function getOrder(req, res) {
    const orderId = parseInt(req.params.orderId);

    if (!orderId || isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    res.json({
        success: true,
        order
    });
}

async function getOrderByNumber(req, res) {
    const { orderId } = req.params;
    console.log(orderId);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
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
            statusHistory: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!order) {
        throw new NotFoundError('Order not found. Please check your order number and try again.');
    }

    const statusMessages = {
        'PENDING': 'Order received - Awaiting confirmation',
        'CONFIRMED': 'Order confirmed - Preparing for shipment',
        'PROCESSING': 'Order is being processed',
        'SHIPPED': 'Order shipped - On the way',
        'DELIVERED': 'Order delivered successfully',
        'CANCELLED': 'Order cancelled'
    };

    res.json({
        success: true,
        order: {
            id: order.id,
            status: order.status,
            statusMessage: statusMessages[order.status] || 'Processing',
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus || 'PENDING',
            orderItems: order.orderItems.map(item => ({
                id: item.id,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                product: item.product
            })),
            subtotal: order.subtotal,
            totalDiscount: order.totalDiscount,
            shippingCost: order.shippingCost,
            tax: order.tax,
            finalTotal: order.finalTotal,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            statusHistory: order.statusHistory,
            estimatedDelivery: order.status === 'SHIPPED' ? '1-3 business days' : '3-7 business days (after confirmation)'
        }
    });
}

async function updateOrderStatus(req, res) {
    const orderId = parseInt(req.params.orderId);
    const { status, notes } = req.body;

    if (!orderId || isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
        throw new BadRequestError('Invalid status');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        throw new BadRequestError('Cannot update status of delivered or cancelled orders');
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: { status }
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId,
                status,
                notes: notes || `Order status updated to ${status}`
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Order status updated successfully',
        order: updatedOrder
    });
}

async function getAllOrders(req, res) {
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
}

async function cancelOrder(req, res) {
    const orderId = parseInt(req.params.orderId);
    const { reason } = req.body;

    if (!orderId || isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: true
        }
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    if (order.status === 'DELIVERED') {
        throw new BadRequestError('Cannot cancel a delivered order. Please contact support for returns.');
    }

    if (order.status === 'CANCELLED') {
        throw new BadRequestError('Order is already cancelled');
    }

    if (order.status === 'SHIPPED') {
        throw new BadRequestError('Cannot cancel a shipped order. Please contact support.');
    }

    await prisma.$transaction(async (tx) => {
        await tx.order.update({
            where: { id: orderId },
            data: { 
                status: 'CANCELLED',
                notes: reason ? `Cancelled: ${reason}` : 'Order cancelled by user'
            }
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId,
                status: 'CANCELLED',
                notes: reason || 'Order cancelled by user'
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
    });

    res.json({
        success: true,
        message: 'Order cancelled successfully. Stock has been restored.'
    });
}

export {
    createOrder,
    getOrderConfirmation,
    getOrder,
    getOrderByNumber,
    updateOrderStatus,
    getAllOrders,
    cancelOrder
};
