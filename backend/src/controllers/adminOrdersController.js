import prisma from "../config/prisma.js";
import { NotFoundError, ValidationError } from "../middlewares/errors/AppError.js";

export const getAdminOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', search = '' } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        
        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip: offset,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    price: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        res.json({
            success: true,
            data: orders,
            total,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Admin orders fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

export const getAdminOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true,
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
            throw new NotFoundError('Order not found');
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Admin order fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
                ...(status === 'SHIPPED' && { shippedAt: new Date() }),
                ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
                ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                status,
                notes: notes || `Order status updated to ${status}`
            }
        });

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Order status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            customerName, 
            customerEmail, 
            customerPhone, 
            shippingAddress, 
            finalTotal,
            discountAmount,
            shippingCharge 
        } = req.body;

        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }

        if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
            throw new ValidationError('Order can only be updated when status is PENDING or CONFIRMED');
        }

        const updateData = {};
        if (customerName !== undefined) updateData.customerName = customerName.trim();
        if (customerEmail !== undefined) updateData.customerEmail = customerEmail.trim();
        if (customerPhone !== undefined) updateData.customerPhone = customerPhone.trim();
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress.trim();
        if (finalTotal !== undefined) updateData.finalTotal = parseFloat(finalTotal);
        if (discountAmount !== undefined) updateData.discountAmount = parseFloat(discountAmount);
        if (shippingCharge !== undefined) updateData.shippingCharge = parseFloat(shippingCharge);

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Order update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order'
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue,
            recentOrders,
            topProducts
        ] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { finalTotal: true }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    customerName: true,
                    finalTotal: true,
                    status: true,
                    createdAt: true
                }
            }),
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }).then(async (items) => {
                const productIds = items.map(item => item.productId);
                const products = await prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true, imageUrl: true }
                });
                
                return items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        product,
                        totalSold: item._sum.quantity
                    };
                });
            })
        ]);

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue: totalRevenue._sum.finalTotal || 0,
                recentOrders,
                topProducts
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};
