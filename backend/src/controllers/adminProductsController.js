import prisma from "../config/prisma.js";
import { NotFoundError, ValidationError } from "../middlewares/errors/AppError.js";

export const getAdminProducts = async (req, res) => {
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
            fastDelivery
        } = req.query;
        
        const offset = (page - 1) * limit;

        console.log('Query params:', { page, limit, search, _sort, _order, id, name, category, description, badge, minPrice, maxPrice, minStock, maxStock, featured, organic, isNew, fastDelivery });

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

        if (minPrice) {
            conditions.push({ price: { gte: parseFloat(minPrice) } });
        }

        if (maxPrice) {
            conditions.push({ price: { lte: parseFloat(maxPrice) } });
        }

        if (minStock) {
            conditions.push({ stock: { gte: parseInt(minStock) } });
        }

        if (maxStock) {
            conditions.push({ stock: { lte: parseInt(maxStock) } });
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

        if (conditions.length > 0) {
            where = { AND: conditions };
        }

        console.log('Where clause:', JSON.stringify(where, null, 2));

        const sortFieldMap = {
            'id': 'id',
            'name': 'name',
            'category': 'category',
            'price': 'price',
            'rating': 'rating',
            'stock': 'stock',
            'featured': 'featured',
            'badge': 'badge',
            'oldPrice': 'oldPrice',
            'discount': 'discount',
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
                orderBy: orderBy
            }),
            prisma.product.count({ where })
        ]);

        console.log(`Found ${products.length} products, total: ${total}`);

        res.json({
            success: true,
            data: products,
            total,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Admin products fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

export const getAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Admin product fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            longDescription,
            price, 
            oldPrice,
            discount,
            category, 
            badge,
            rating,
            stock,
            image, 
            images,
            features,
            sizes,
            specifications,
            isNew,
            organic,
            fastDelivery,
            featured
        } = req.body;

        if (!name || !description || !price || !category) {
            throw new ValidationError('Name, description, price, and category are required');
        }

        if (price < 0) {
            throw new ValidationError('Price cannot be negative');
        }

        if (stock !== undefined && stock < 0) {
            throw new ValidationError('Stock cannot be negative');
        }

        if (oldPrice && oldPrice < price) {
            throw new ValidationError('Old price cannot be less than current price');
        }

        if (discount && (discount < 0 || discount > 100)) {
            throw new ValidationError('Discount must be between 0 and 100');
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description.trim(),
                longDescription: longDescription?.trim() || null,
                price: parseFloat(price),
                oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                discount: discount ? parseFloat(discount) : null,
                category: category.trim(),
                badge: badge?.trim() || '',
                rating: rating ? parseFloat(rating) : 0.0,
                stock: parseInt(stock) || 0,
                image: image?.trim() || '',
                images: images || [],
                features: features || [],
                sizes: sizes || null,
                specifications: specifications || null,
                isNew: Boolean(isNew),
                organic: Boolean(organic),
                fastDelivery: Boolean(fastDelivery),
                featured: Boolean(featured)
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            description, 
            longDescription,
            price, 
            oldPrice,
            discount,
            category, 
            badge,
            rating,
            stock,
            image, 
            images,
            features,
            sizes,
            specifications,
            isNew,
            organic,
            fastDelivery,
            featured
        } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        if (price !== undefined && price < 0) {
            throw new ValidationError('Price cannot be negative');
        }

        if (stock !== undefined && stock < 0) {
            throw new ValidationError('Stock cannot be negative');
        }

        if (oldPrice && price && oldPrice < price) {
            throw new ValidationError('Old price cannot be less than current price');
        }

        if (discount && (discount < 0 || discount > 100)) {
            throw new ValidationError('Discount must be between 0 and 100');
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (longDescription !== undefined) updateData.longDescription = longDescription?.trim() || null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? parseFloat(oldPrice) : null;
        if (discount !== undefined) updateData.discount = discount ? parseFloat(discount) : null;
        if (category !== undefined) updateData.category = category.trim();
        if (badge !== undefined) updateData.badge = badge?.trim() || '';
        if (rating !== undefined) updateData.rating = parseFloat(rating);
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (image !== undefined) updateData.image = image?.trim() || '';
        if (images !== undefined) updateData.images = images || [];
        if (features !== undefined) updateData.features = features || [];
        if (sizes !== undefined) updateData.sizes = sizes || null;
        if (specifications !== undefined) updateData.specifications = specifications || null;
        if (isNew !== undefined) updateData.isNew = Boolean(isNew);
        if (organic !== undefined) updateData.organic = Boolean(organic);
        if (fastDelivery !== undefined) updateData.fastDelivery = Boolean(fastDelivery);
        if (featured !== undefined) updateData.featured = Boolean(featured);

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
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
        console.error('Product update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        const orderItems = await prisma.orderItem.findFirst({
            where: { productId: parseInt(id) }
        });

        if (orderItems) {
            const updatedProduct = await prisma.product.update({
                where: { id: parseInt(id) },
                data: { featured: false, stock: 0 }
            });

            return res.json({
                success: true,
                message: 'Product marked as inactive (cannot delete product with existing orders)',
                data: updatedProduct
            });
        }

        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: { id: parseInt(id) }
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};
