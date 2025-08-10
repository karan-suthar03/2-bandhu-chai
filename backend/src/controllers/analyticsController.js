import { sendSuccess } from "../utils/responseUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import prisma from "../config/prisma.js";

const getSystemAnalytics = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        completedOrders,
        lowStockProducts
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.productVariant.count({
            where: { 
                stock: { lt: 10 },
                product: { deactivated: false }
            }
        })
    ]);

    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const analytics = {
        orderCompletionRate,
        lowStockCount: lowStockProducts
    };

    return sendSuccess(res, { analytics });
});

const getLowStockProducts = asyncHandler(async (req, res) => {
    const lowStockThreshold = parseInt(req.query.threshold) || 10;
    
    const lowStockVariants = await prisma.productVariant.findMany({
        where: {
            stock: { lt: lowStockThreshold },
            product: { deactivated: false }
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        },
        orderBy: {
            stock: 'asc'
        }
    });

    const products = lowStockVariants.map(variant => ({
        id: variant.product.id,
        name: `${variant.product.name} (${variant.size})`,
        stock: variant.stock,
        image: variant.product.image,
        price: variant.price,
        variantId: variant.id,
        size: variant.size
    }));

    return sendSuccess(res, { data: products });
});

export {
    getSystemAnalytics,
    getLowStockProducts
};
