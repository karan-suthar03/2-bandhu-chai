import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';

const getAllVariants = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        search = '',
        productId,
        size,
        minPrice,
        maxPrice,
        minStock,
        maxStock,
        lowStock = false,
        outOfStock = false,
        _sort = 'product.name',
        _order = 'asc'
    } = req.query;
        
    const offset = (page - 1) * limit;

    let where = {};
    const conditions = [];

    if (search && search.trim()) {
        conditions.push({
            OR: [
                { 
                    product: {
                        name: { contains: search, mode: 'insensitive' }
                    }
                },
                { 
                    product: {
                        category: { contains: search, mode: 'insensitive' }
                    }
                },
                { size: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } }
            ]
        });
    }

    if (productId && productId.trim()) {
        const id = parseInt(productId.trim());
        if (!isNaN(id)) {
            conditions.push({ productId: id });
        }
    }

    if (size && size.trim()) {
        conditions.push({ size: { contains: size.trim(), mode: 'insensitive' } });
    }

    if (minPrice || maxPrice) {
        const priceCondition = {};
        if (minPrice) priceCondition.gte = parseFloat(minPrice);
        if (maxPrice) priceCondition.lte = parseFloat(maxPrice);
        conditions.push({ price: priceCondition });
    }

    if (minStock || maxStock) {
        const stockCondition = {};
        if (minStock) stockCondition.gte = parseInt(minStock);
        if (maxStock) stockCondition.lte = parseInt(maxStock);
        conditions.push({ stock: stockCondition });
    }

    if (lowStock === 'true') {
        conditions.push({ 
            stock: { 
                gt: 0,
                lt: 10 
            } 
        });
    }

    if (outOfStock === 'true') {
        conditions.push({ stock: { lte: 0 } });
    }

    if (conditions.length > 0) {
        where = { AND: conditions };
    }

    let orderBy;
    switch (_sort) {
        case 'product.name':
            orderBy = { product: { name: _order } };
            break;
        case 'size':
            orderBy = { size: _order };
            break;
        case 'price':
            orderBy = { price: _order };
            break;
        case 'stock':
            orderBy = { stock: _order };
            break;
        case 'sku':
            orderBy = { sku: _order };
            break;
        default:
            orderBy = { product: { name: 'asc' } };
    }

    const [variants, total] = await Promise.all([
        prisma.productVariant.findMany({
            where,
            skip: offset,
            take: parseInt(limit),
            orderBy,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        image: true,
                        badge: true,
                        deactivated: true
                    }
                }
            }
        }),
        prisma.productVariant.count({ where })
    ]);

    const processedVariants = variants.map(variant => {
        let productImage = variant.product.image;
        let smallImageUrl = null;
        
        if (productImage && typeof productImage === 'string') {
            try {
                productImage = JSON.parse(productImage);
            } catch (e) {
                console.warn('Failed to parse image JSON string:', productImage);
            }
        }

        if (productImage && typeof productImage === 'object') {
            smallImageUrl = productImage.smallUrl || productImage.url || null;
        }

        return {
            ...variant,
            product: {
                ...variant.product,
                image: productImage,
                smallImageUrl: smallImageUrl
            },
            stockStatus: variant.stock <= 0 ? 'Out of Stock' : 
                       variant.stock < 10 ? 'Low Stock' : 'In Stock',
            stockLevel: variant.stock <= 0 ? 'danger' : 
                      variant.stock < 10 ? 'warning' : 'success'
        };
    });

    return sendSuccess(res, {
        data: processedVariants,
        total,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
});

export {
    getAllVariants
};
