import prisma from "../config/prisma.js";
import { NotFoundError, ValidationError } from "../middlewares/errors/AppError.js";

export const getAdminOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            _sort = 'createdAt',
            _order = 'desc',
            id,
            customerName,
            customerEmail,
            customerPhone,
            status,
            paymentStatus,
            paymentMethod,
            minTotal,
            maxTotal,
            createdAt,
            confirmedAt,
            shippedAt,
            deliveredAt
        } = req.query;

        const pageNum = parseInt(page, 10);
        const perPage = parseInt(limit, 10);
        const offset = (pageNum - 1) * perPage;

        let where = {};
        const conditions = [];

        if (search && search.trim()) {
            conditions.push({
                OR: [
                    { customerName: { contains: search.trim(), mode: 'insensitive' } },
                    { customerEmail: { contains: search.trim(), mode: 'insensitive' } },
                    { customerPhone: { contains: search.trim(), mode: 'insensitive' } },
                    { id: { contains: search.trim(), mode: 'insensitive' } }
                ]
            });
        }

        if (id && id.trim()) {
            conditions.push({ id: { contains: id.trim(), mode: 'insensitive' } });
        }
        if (customerName && customerName.trim()) {
            conditions.push({ customerName: { contains: customerName.trim(), mode: 'insensitive' } });
        }
        if (customerEmail && customerEmail.trim()) {
            conditions.push({ customerEmail: { contains: customerEmail.trim(), mode: 'insensitive' } });
        }
        if (customerPhone && customerPhone.trim()) {
            conditions.push({ customerPhone: { contains: customerPhone.trim(), mode: 'insensitive' } });
        }
        if (status && status.trim()) {
            conditions.push({ status: status.trim() });
        }
        if (paymentStatus && paymentStatus.trim()) {
            conditions.push({ paymentStatus: paymentStatus.trim() });
        }
        if (paymentMethod && paymentMethod.trim()) {
            conditions.push({ paymentMethod: paymentMethod.trim() });
        }

        if (minTotal) {
            conditions.push({ finalTotal: { gte: parseFloat(minTotal) } });
        }
        if (maxTotal) {
            conditions.push({ finalTotal: { lte: parseFloat(maxTotal) } });
        }

        const applyDateFilter = (field, value) => {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                const startOfDay = new Date(date);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setUTCHours(23, 59, 59, 999);
                conditions.push({ [field]: { gte: startOfDay, lte: endOfDay } });
            }
        };

        if (createdAt) applyDateFilter('createdAt', createdAt);
        if (confirmedAt) applyDateFilter('confirmedAt', confirmedAt);
        if (shippedAt) applyDateFilter('shippedAt', shippedAt);
        if (deliveredAt) applyDateFilter('deliveredAt', deliveredAt);

        if (conditions.length > 0) {
            where = { AND: conditions };
        }

        const sortFieldMap = {
            id: 'id',
            customerName: 'customerName',
            customerEmail: 'customerEmail',
            customerPhone: 'customerPhone',
            status: 'status',
            paymentStatus: 'paymentStatus',
            paymentMethod: 'paymentMethod',
            subtotal: 'subtotal',
            totalDiscount: 'totalDiscount',
            shippingCost: 'shippingCost',
            tax: 'tax',
            finalTotal: 'finalTotal',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            confirmedAt: 'confirmedAt',
            shippedAt: 'shippedAt',
            deliveredAt: 'deliveredAt',
            cancelledAt: 'cancelledAt'
        };
        const sortField = sortFieldMap[_sort] || 'createdAt';
        const sortOrder = _order.toLowerCase() === 'asc' ? 'asc' : 'desc';
        const orderBy = { [sortField]: sortOrder };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip: offset,
                take: perPage,
                orderBy,
                include: {
                    orderItems: { include: { product: true } }
                }
            }),
            prisma.order.count({ where })
        ]);

        const totalPages = Math.ceil(total / perPage) || 1;

        res.json({
            success: true,
            data: orders,
            total,
            pagination: {
                current: pageNum,
                pages: totalPages,
                limit: perPage
            }
        });
    } catch (error) {
        console.error('Admin orders fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
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
                                image: true,
                                images: true,
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


        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
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
                                image: true,
                                images: true
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
            totalDiscount,
            shippingCost,
            subtotal,
            tax
        } = req.body;

        if (customerName !== undefined && (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0)) {
            throw new ValidationError('Customer name must be a non-empty string');
        }

        if (customerEmail !== undefined && (!customerEmail || typeof customerEmail !== 'string' || customerEmail.trim().length === 0)) {
            throw new ValidationError('Customer email must be a non-empty string');
        }

        if (customerEmail !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerEmail.trim())) {
                throw new ValidationError('Invalid email format');
            }
        }

        if (customerPhone !== undefined && (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length === 0)) {
            throw new ValidationError('Customer phone must be a non-empty string');
        }

        if (shippingAddress !== undefined) {
            if (typeof shippingAddress !== 'object' || shippingAddress === null) {
                throw new ValidationError('Shipping address must be an object');
            }
            
            const requiredAddressFields = ['street', 'city', 'state', 'pincode'];
            for (const field of requiredAddressFields) {
                if (!shippingAddress[field] || typeof shippingAddress[field] !== 'string' || shippingAddress[field].trim().length === 0) {
                    throw new ValidationError(`Shipping address ${field} is required and must be a non-empty string`);
                }
            }
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }

        const updateData = {};
        if (customerName !== undefined) updateData.customerName = customerName.trim();
        if (customerEmail !== undefined) updateData.customerEmail = customerEmail.trim();
        if (customerPhone !== undefined) updateData.customerPhone = customerPhone.trim();
        if (shippingAddress !== undefined) {
            const cleanAddress = {
                street: shippingAddress.street?.trim() || '',
                city: shippingAddress.city?.trim() || '',
                state: shippingAddress.state?.trim() || '',
                pincode: shippingAddress.pincode?.trim() || '',
                landmark: shippingAddress.landmark?.trim() || ''
            };
            updateData.shippingAddress = cleanAddress;
        }
        
        // Handle pricing fields with correct field names
        if (finalTotal !== undefined) updateData.finalTotal = parseFloat(finalTotal);
        if (totalDiscount !== undefined) updateData.totalDiscount = parseFloat(totalDiscount);
        if (shippingCost !== undefined) updateData.shippingCost = parseFloat(shippingCost);
        if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal);
        if (tax !== undefined) updateData.tax = parseFloat(tax);

        // Validate pricing logic if multiple pricing fields are being updated
        if (Object.keys(updateData).some(key => ['finalTotal', 'totalDiscount', 'shippingCost', 'subtotal', 'tax'].includes(key))) {
            // Get current values for missing fields
            const currentSubtotal = updateData.subtotal ?? existingOrder.subtotal;
            const currentDiscount = updateData.totalDiscount ?? existingOrder.totalDiscount;
            const currentShipping = updateData.shippingCost ?? existingOrder.shippingCost;
            const currentTax = updateData.tax ?? existingOrder.tax;
            const currentFinalTotal = updateData.finalTotal ?? existingOrder.finalTotal;

            // Basic validation
            if (currentDiscount > currentSubtotal) {
                throw new ValidationError('Discount cannot be greater than subtotal');
            }

            // Allow some tolerance for rounding differences
            const expectedTotal = currentSubtotal - currentDiscount + currentShipping + currentTax;
            const difference = Math.abs(expectedTotal - currentFinalTotal);
            if (difference > 0.01) {
                console.warn(`Price calculation mismatch: Expected ${expectedTotal}, got ${currentFinalTotal}, difference: ${difference}`);
                // Log warning but don't fail - admin might have intentional adjustments
            }
        }

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
                                image: true,
                                images: true
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
        console.error('Order update error:', {
            message: error.message,
            stack: error.stack,
            orderId: req.params.id,
            requestBody: req.body
        });
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            ...(process.env.NODE_ENV === 'development' && { 
                error: error.message,
                details: error.stack 
            })
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
                    select: { id: true, name: true, image: true, images: true }
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

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }

        if (!['PENDING', 'CANCELLED'].includes(existingOrder.status)) {
            throw new ValidationError('Only PENDING or CANCELLED orders can be deleted');
        }

        await prisma.$transaction([
            prisma.orderItem.deleteMany({
                where: { orderId: id }
            }),
            prisma.statusHistory.deleteMany({
                where: { orderId: id }
            }),
            prisma.order.delete({
                where: { id }
            })
        ]);

        res.json({
            success: true,
            message: 'Order deleted successfully',
            data: { id }
        });
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Order deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order'
        });
    }
};

export const bulkDeleteOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            throw new ValidationError('Order IDs are required');
        }

        const existingOrders = await prisma.order.findMany({
            where: { id: { in: orderIds } },
            select: { id: true, status: true }
        });

        if (existingOrders.length === 0) {
            throw new NotFoundError('No orders found');
        }

        const deletableOrders = existingOrders.filter(order =>
            ['PENDING', 'CANCELLED'].includes(order.status)
        );
        const nonDeletableOrders = existingOrders.filter(order =>
            !['PENDING', 'CANCELLED'].includes(order.status)
        );

        let deletedCount = 0;

        if (deletableOrders.length > 0) {
            const deletableOrderIds = deletableOrders.map(order => order.id);

            await prisma.$transaction([
                prisma.orderItem.deleteMany({
                    where: { orderId: { in: deletableOrderIds } }
                }),
                prisma.statusHistory.deleteMany({
                    where: { orderId: { in: deletableOrderIds } }
                }),
                prisma.order.deleteMany({
                    where: { id: { in: deletableOrderIds } }
                })
            ]);

            deletedCount = deletableOrders.length;
        }

        res.json({
            success: true,
            message: `Bulk operation completed. ${deletedCount} orders deleted, ${nonDeletableOrders.length} orders skipped (only PENDING/CANCELLED orders can be deleted)`,
            data: {
                deletedCount,
                skippedCount: nonDeletableOrders.length,
                deletedIds: deletableOrders.map(order => order.id),
                skippedIds: nonDeletableOrders.map(order => order.id)
            }
        });
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Bulk order deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete orders'
        });
    }
};
