import { OrderService } from "../services/orderService.js";
import { sendSuccess, sendNotFound, sendBadRequest, createPaginatedResponse, sendResponse } from "../utils/responseUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import prisma from "../config/prisma.js";

const getAdminOrders = asyncHandler(async (req, res) => {
    const result = await OrderService.getOrders(req.query);
    
    return sendResponse(res, 200, createPaginatedResponse(result.orders, result.pagination));
});

const getAdminOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    
    const order = await OrderService.getOrderById(orderId, true);
    
    if (!order) {
        return sendNotFound(res, 'Order not found');
    }
    
    return sendSuccess(res, { data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const { status, notes } = req.body;

    if (!status) {
        return sendBadRequest(res, 'Status is required');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return sendBadRequest(res, `Invalid status. Valid statuses: ${validStatuses.join(', ')}`);
    }

    try {
        const updatedOrder = await OrderService.updateOrderStatus(orderId, status, notes);
        return sendSuccess(res, { order: updatedOrder }, 'Order status updated successfully');
    } catch (error) {
        if (error.message === 'Order not found') {
            return sendNotFound(res, 'Order not found');
        }
        throw error;
    }
});

const updateOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const updateData = req.body;

    const { id, createdAt, updatedAt, orderItems, statusHistory, ...allowedUpdates } = updateData;

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: allowedUpdates,
        include: {
            orderItems: true,
            statusHistory: { orderBy: { createdAt: 'desc' } }
        }
    });

    return sendSuccess(res, { order: updatedOrder }, 'Order updated successfully');
});

const deleteOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    
    try {
        await OrderService.deleteOrder(orderId);
        return sendSuccess(res, {}, 'Order deleted successfully');
    } catch (error) {
        if (error.code === 'P2025') {
            return sendNotFound(res, 'Order not found');
        }
        throw error;
    }
});

const bulkDeleteOrders = asyncHandler(async (req, res) => {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return sendBadRequest(res, 'Order IDs array is required');
    }

    const result = await OrderService.bulkDeleteOrders(orderIds);
    
    return sendSuccess(res, { 
        deletedCount: result.count 
    }, `${result.count} orders deleted successfully`);
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        pendingOrders,
        deliveredOrders
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } })
    ]);

    const topProducts = await prisma.orderItem.groupBy({
        by: ['productVariantId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    });

    const topVariantIds = topProducts.map(item => item.productVariantId);
    const variantDetails = await prisma.productVariant.findMany({
        where: { id: { in: topVariantIds } },
        select: {
            id: true,
            size: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        }
    });

    const topProductsWithDetails = topProducts.map(item => {
        const variant = variantDetails.find(v => v.id === item.productVariantId);
        return {
            product: variant?.product,
            variant: {
                id: variant?.id,
                size: variant?.size
            },
            totalSold: item._sum.quantity
        };
    });

    const stats = {
        totalOrders,
        pendingOrders,
        completedOrders: deliveredOrders,
        topProducts: topProductsWithDetails
    };

    return sendSuccess(res, { stats });
});

export {
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    bulkDeleteOrders,
    getDashboardStats
};
