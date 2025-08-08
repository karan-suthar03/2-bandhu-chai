import prisma from "../config/prisma.js";

export class OrderService {
    static async getOrders(filters = {}) {
        const {
            page = 1,
            limit = 10,
            search,
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
        } = filters;

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
                    orderItems: { 
                        include: { 
                            variant: {
                                include: {
                                    product: true
                                }
                            }
                        } 
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        const totalPages = Math.ceil(total / perPage) || 1;

        return {
            orders,
            pagination: {
                current: pageNum,
                pages: totalPages,
                limit: perPage,
                total
            }
        };
    }

    static async getOrderById(orderId, includeItems = true) {
        const includeOptions = {};
        
        if (includeItems) {
            includeOptions.orderItems = {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    images: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            };
            includeOptions.statusHistory = {
                orderBy: { createdAt: 'desc' }
            };
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: includeOptions
        });

        return order;
    }

    static async updateOrderStatus(orderId, newStatus, notes = null) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const updateData = { status: newStatus };
        const statusField = `${newStatus.toLowerCase()}At`;

        if (['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(newStatus)) {
            updateData[statusField] = new Date();
        }

        const [updatedOrder] = await Promise.all([
            prisma.order.update({
                where: { id: orderId },
                data: updateData
            }),
            prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: newStatus,
                    notes,
                    createdAt: new Date()
                }
            })
        ]);

        return updatedOrder;
    }

    static async createOrder(orderData, cartItems, sessionId) {
        const {
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            paymentMethod = 'CASH_ON_DELIVERY',
            notes
        } = orderData;

        const productIds = cartItems.map(item => item.productId);
        const variantIds = cartItems.map(item => item.variantId).filter(Boolean);

        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                variants: { where: { id: { in: variantIds } } }
            }
        });

        if (products.length !== [...new Set(productIds)].length) {
            throw new Error('Some products in your cart are no longer available. Please review your cart and try again.');
        }

        let subtotal = 0;
        let totalDiscount = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
            const product = products.find(p => p.id === cartItem.productId);
            if (!product) continue;

            const variant = product.variants.find(v => v.id === cartItem.variantId);
            if (!variant) {
                throw new Error(`Product variant no longer available for "${product.name}". Please review your cart and try again.`);
            }

            if (variant.stock < cartItem.quantity) {
                throw new Error(`Sorry, we don't have enough stock for "${product.name}" (${variant.size}). Available: ${variant.stock}, Requested: ${cartItem.quantity}. Please update your cart and try again.`);
            }

            const itemTotal = variant.price * cartItem.quantity;
            const itemDiscount = variant.oldPrice ? (variant.oldPrice - variant.price) * cartItem.quantity : 0;

            subtotal += itemTotal;
            totalDiscount += itemDiscount;

            orderItems.push({
                productVariantId: variant.id,
                productName: `${product.name} (${variant.size})`,
                price: variant.price,
                oldPrice: variant.oldPrice,
                quantity: cartItem.quantity
            });
        }

        const shippingCost = subtotal > 999 ? 0 : 99;
        const tax = Math.round(subtotal * 0.18);
        const finalTotal = subtotal + shippingCost + tax;

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    sessionId,
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
                    orderItems: true
                }
            });

            for (const cartItem of cartItems) {
                await tx.productVariant.update({
                    where: { id: cartItem.variantId },
                    data: {
                        stock: {
                            decrement: cartItem.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        return order;
    }

    static async deleteOrder(orderId) {
        return await prisma.order.delete({
            where: { id: orderId }
        });
    }

    static async bulkDeleteOrders(orderIds) {
        return await prisma.order.deleteMany({
            where: {
                id: { in: orderIds }
            }
        });
    }
}
