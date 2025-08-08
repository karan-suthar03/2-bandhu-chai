import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';

const getAdminProducts = asyncHandler(async (req, res) => {
    console.log('getAdminProducts called with query params:', req.query);
    
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            _sort = 'createdAt', 
            _order = 'desc',
            id,
            name,
            category,
            description,
            badge,
            minPrice,
            maxPrice,
            minStock,
            maxStock,
            featured,
            organic,
            isNew,
            fastDelivery,
            deactivated
        } = req.query;
            
        const offset = (page - 1) * limit;

        console.log('Query params:', { page, limit, search, _sort, _order, id, name, category, description, badge, minPrice, maxPrice, minStock, maxStock, featured, organic, isNew, fastDelivery, deactivated });

        let where = {};
        const conditions = [];

    if (id && id.trim()) {
        const productId = parseInt(id.trim());
        if (!isNaN(productId)) {
            conditions.push({ id: productId });
        }
    }

    if (search && search.trim()) {
        conditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { badge: { contains: search, mode: 'insensitive' } }
            ]
        });
    }

    if (name && name.trim()) {
        conditions.push({ name: { contains: name.trim(), mode: 'insensitive' } });
    }

    if (category && category.trim()) {
        conditions.push({ category: { contains: category.trim(), mode: 'insensitive' } });
    }

    if (description && description.trim()) {
        conditions.push({ description: { contains: description.trim(), mode: 'insensitive' } });
    }

    if (badge && badge.trim()) {
        conditions.push({ badge: { contains: badge.trim(), mode: 'insensitive' } });
    }

    if (minPrice || maxPrice) {
        const priceCondition = {};
        if (minPrice) priceCondition.gte = parseFloat(minPrice);
        if (maxPrice) priceCondition.lte = parseFloat(maxPrice);
        
        conditions.push({
            variants: {
                some: {
                    price: priceCondition
                }
            }
        });
    }

    if (minStock || maxStock) {
        const stockCondition = {};
        if (minStock) stockCondition.gte = parseInt(minStock);
        if (maxStock) stockCondition.lte = parseInt(maxStock);
        
        conditions.push({
            variants: {
                some: {
                    stock: stockCondition
                }
            }
        });
    }

    if (featured !== undefined && featured !== '') {
        conditions.push({ featured: featured === 'true' });
    }

    if (organic !== undefined && organic !== '') {
        conditions.push({ organic: organic === 'true' });
    }

    if (isNew !== undefined && isNew !== '') {
        conditions.push({ isNew: isNew === 'true' });
    }

    if (fastDelivery !== undefined && fastDelivery !== '') {
        conditions.push({ fastDelivery: fastDelivery === 'true' });
    }

    if (deactivated !== undefined && deactivated !== '') {
        conditions.push({ deactivated: deactivated === 'true' });
    }

    if (conditions.length > 0) {
        where = { AND: conditions };
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    const sortFieldMap = {
        'id': 'id',
        'name': 'name',
        'category': 'category',
        'rating': 'rating',
        'featured': 'featured',
        'badge': 'badge',
        'organic': 'organic',
        'isNew': 'isNew',
        'fastDelivery': 'fastDelivery',
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt'
    };

    const sortField = sortFieldMap[_sort] || 'createdAt';
    const sortOrder = _order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    console.log(`Sorting by: ${sortField} ${sortOrder}`);

    let orderBy = { [sortField]: sortOrder };

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip: offset,
            take: parseInt(limit),
            orderBy: orderBy,
            include: {
                variants: {
                    select: {
                        id: true,
                        size: true,
                        price: true,
                        oldPrice: true,
                        discount: true,
                        stock: true,
                        sku: true
                    }
                },
                defaultVariant: {
                    select: {
                        id: true,
                        size: true,
                        price: true,
                        oldPrice: true,
                        discount: true,
                        stock: true,
                        sku: true
                    }
                }
            }
        }),
        prisma.product.count({ where })
    ]);

    const processedProducts = products.map(product => {
        if (product.images && Array.isArray(product.images)) {
            product.images = product.images.map(img => {
                if (typeof img === 'string') {
                    try {
                        return JSON.parse(img);
                    } catch (e) {
                        console.warn('Failed to parse image JSON string:', img);
                        return img;
                    }
                }
                return img;
            });
        }
        if (product.image && typeof product.image === 'string') {
            try {
                product.image = JSON.parse(product.image);
            } catch (e) {
                console.warn('Failed to parse image JSON string:', product.image);
            }
        }

        const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
        const minPrice = Math.min(...product.variants.map(v => v.price));
        const maxPrice = Math.max(...product.variants.map(v => v.price));
        const variantCount = product.variants.length;

        return {
            ...product,
            variantSummary: {
                totalStock,
                priceRange: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`,
                variantCount: `${variantCount} size${variantCount > 1 ? 's' : ''}`,
                lowStock: totalStock < 10
            },
            variants: product.variants,
            defaultVariant: product.defaultVariant
        };
    });

    console.log(`Found ${products.length} products, total: ${total}`);

    return sendSuccess(res, {
        data: processedProducts,
        total,
        pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
        }
    });
    } catch (error) {
        console.error('Error in getAdminProducts:', {
            message: error.message,
            stack: error.stack,
            query: req.query
        });
        throw error;
    }
});

const getAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('getAdminProduct called with ID:', id);

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                variants: {
                    select: {
                        id: true,
                        size: true,
                        price: true,
                        oldPrice: true,
                        discount: true,
                        stock: true,
                        sku: true
                    }
                },
                defaultVariant: {
                    select: {
                        id: true,
                        size: true,
                        price: true,
                        oldPrice: true,
                        discount: true,
                        stock: true,
                        sku: true
                    }
                }
            }
        });

        console.log('Product found:', product ? 'Yes' : 'No');
        if (product) {
            console.log('Product details:', { id: product.id, name: product.name, variants: product.variants?.length });
        }

        if (!product) {
            console.log('Product not found, returning 404');
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.images && Array.isArray(product.images)) {
            product.images = product.images.map(img => {
                if (typeof img === 'string') {
                    try {
                        const parsed = JSON.parse(img);
                        console.warn('Had to parse images array item as string in getAdminProduct - this should not happen with Prisma JSON fields');
                        return parsed;
                    } catch (e) {
                        console.error('Failed to parse image JSON string:', img);
                        return img;
                    }
                }
                return img;
            });
        }

        if (product.image && typeof product.image === 'string') {
            try {
                product.image = JSON.parse(product.image);
                console.warn('Had to parse image field as string in getAdminProduct - this should not happen with Prisma JSON fields');
            } catch (e) {
                console.error('Failed to parse image JSON string:', product.image);
            }
        }

        console.log('Sending successful response for product:', product.id);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getAdminProduct:', {
            message: error.message,
            stack: error.stack,
            productId: req.params.id
        });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

export {
    getAdminProducts,
    getAdminProduct
};
