import prisma from "../config/prisma.js";
import {NotFoundError, ValidationError} from "../middlewares/errors/AppError.js";
import {uploadFile} from "../services/s3Service.js";

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

async function uploadVariants(mainImage) {
    const variants = mainImage.variants;

    const variantEntries = Object.entries(variants);

    const uploadPromises = variantEntries.map(([key, variantObject]) => {
        const params = {
            fileName: variantObject.filename,
            buffer: variantObject.buffer,
            mimetype: variantObject.mimetype,
            encoding: variantObject.encoding
        };
        return uploadFile(params).then(imageUrl => {
            console.log(`Uploaded ${key} variant. URL:`, imageUrl);
            return { key, imageUrl };
        });
    });

    const settledResults = await Promise.all(uploadPromises);

    return settledResults.reduce((acc, {key, imageUrl}) => {
        acc[`${key}Url`] = imageUrl;
        return acc;
    }, {});
}

export const createProduct = async (req, res) => {
    try {
        let mainImage = req.files?.mainImage[0];

        let mainImageVariantsUrls = await uploadVariants(mainImage);

        console.log('Main image upload URL:', mainImageVariantsUrls);
        let additionalImagesVariantsUrls = [];

        if (req.areFilesPresent && req.files.gallery && req.files.gallery.length > 0) {
            const allUploadsPromise = req.files.gallery.map(img => {
                return uploadVariants(img).then(variantsUrls => {
                    console.log('Additional image variants uploaded:', variantsUrls);
                    return variantsUrls;
                });
            });

            additionalImagesVariantsUrls = await Promise.all(allUploadsPromise);
        } else {
            console.log('No gallery images to upload.');
        }

        let data = {
            name: req.body.name,
            price: req.body.price,
            oldPrice: req.body.oldPrice ? parseFloat(req.body.oldPrice) : null,
            discount: req.body.discount ? parseFloat(req.body.discount) : null,
            stock: req.body.stock,
            category: req.body.category,
            description: req.body.description,
            badge: req.body.badge || null,
            image: mainImageVariantsUrls,
            images: additionalImagesVariantsUrls,
            features: req.body.features ? JSON.parse(req.body.features) : [],
            longDescription: req.body.fullDescription,
            isNew: !!req.body.isNew,
            organic: !!req.body.organic,
            fastDelivery: !!req.body.fastDelivery,
            featured: !!req.body.featured,
            deactivated: !!req.body.deactivated,
        }

        let createdProduct = await prisma.product.create({
            data
        })

        res.status(201).json({
            message: 'Product created',
            createdProduct
        });
    } catch (err) {
        console.error('Error in createProduct:', err);
        res.status(500).json({ error: 'Failed to create product' });
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
            featured,
            deactivated
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
        if (deactivated !== undefined) updateData.deactivated = Boolean(deactivated);

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

export const updateProductMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = {};
        const uploadResults = [];

        if (req.files?.mainImage?.[0]) {
            console.log('Processing main image update...');
            const mainImage = req.files.mainImage[0];
            
            try {
                const mainImageVariantsUrls = await uploadVariants(mainImage);
                updateData.image = mainImageVariantsUrls;
                uploadResults.push(`Main image updated: ${Object.keys(mainImageVariantsUrls).length} variants uploaded`);
                console.log('Main image uploaded successfully:', mainImageVariantsUrls);
            } catch (uploadError) {
                console.error('Main image upload failed:', uploadError);
                throw new Error(`Main image upload failed: ${uploadError.message}`);
            }
        }

        if (req.mediaUpdate) {
            const { galleryOrder, existingImages, hasNewGalleryImages } = req.mediaUpdate;
            
            console.log('Processing gallery update...');
            console.log('Existing images:', existingImages.length);
            console.log('New images:', req.files?.gallery?.length || 0);
            console.log('Gallery order:', galleryOrder);

            let finalGalleryImages = [];

            let newUploadedImages = [];
            if (hasNewGalleryImages && req.files?.gallery && req.files.gallery.length > 0) {
                console.log(`Uploading ${req.files.gallery.length} new gallery images...`);
                
                try {
                    const galleryPromises = req.files.gallery.map(async (img, index) => {
                        console.log(`Uploading gallery image ${index + 1}/${req.files.gallery.length}`);
                        const variants = await uploadVariants(img);
                        return variants;
                    });
                    
                    newUploadedImages = await Promise.all(galleryPromises);
                    uploadResults.push(`Gallery images uploaded: ${newUploadedImages.length} new images`);
                    console.log('New gallery images uploaded successfully:', newUploadedImages.length, 'images');
                } catch (uploadError) {
                    console.error('Gallery images upload failed:', uploadError);
                    throw new Error(`Gallery images upload failed: ${uploadError.message}`);
                }
            }

            if (galleryOrder && galleryOrder.length > 0) {
                console.log('Applying custom gallery order...');
                
                const newImageMap = new Map();
                newUploadedImages.forEach((img, index) => {
                    newImageMap.set(`new_${index}`, img);
                });

                galleryOrder.forEach(item => {
                    if (typeof item === 'string' && item.startsWith('new_')) {
                        const newImg = newImageMap.get(item);
                        if (newImg) {
                            finalGalleryImages.push(newImg);
                        }
                    } else {
                        finalGalleryImages.push(item);
                    }
                });
                
                uploadResults.push(`Gallery reordered: ${finalGalleryImages.length} images in custom order`);
            } else if (existingImages.length > 0) {
                finalGalleryImages = [...existingImages, ...newUploadedImages];
                
                uploadResults.push(`Gallery updated: kept ${existingImages.length} existing images`);
                if (newUploadedImages.length > 0) {
                    uploadResults.push(`Added ${newUploadedImages.length} new images`);
                }
            } else {
                finalGalleryImages = newUploadedImages;
            }

            updateData.images = finalGalleryImages;
            console.log(`Final gallery contains ${finalGalleryImages.length} images`);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid media files or updates provided'
            });
        }

        console.log('Updating product in database...');
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        const responseData = {
            id: updatedProduct.id,
            image: updatedProduct.image,
            images: updatedProduct.images,
            metadata: {
                uploadResults,
                mediaUpdate: req.mediaUpdate,
                updatedAt: updatedProduct.updatedAt
            }
        };

        console.log('Product media updated successfully');
        res.json({
            success: true,
            message: 'Product media updated successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Product media update error:', error);
        
        let errorMessage = 'Failed to update product media';
        let statusCode = 500;
        
        if (error.message.includes('upload failed')) {
            errorMessage = error.message;
            statusCode = 422; // Unprocessable Entity
        } else if (error.message.includes('validation')) {
            errorMessage = error.message;
            statusCode = 400; // Bad Request
        } else if (error.message.includes('not found')) {
            errorMessage = 'Product not found';
            statusCode = 404;
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { deactivated: true, featured: false }
        });

        res.json({
            success: true,
            message: 'Product deactivated successfully',
            data: updatedProduct
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product deactivation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate product'
        });
    }
};

export const activateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { deactivated: false }
        });

        res.json({
            success: true,
            message: 'Product activated successfully',
            data: updatedProduct
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        console.error('Product activation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate product'
        });
    }
};

export const bulkDeactivateProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new ValidationError('Product IDs are required');
        }

        const validProductIds = productIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        
        if (validProductIds.length === 0) {
            throw new ValidationError('No valid product IDs provided');
        }

        const existingProducts = await prisma.product.findMany({
            where: { id: { in: validProductIds } }
        });

        if (existingProducts.length === 0) {
            throw new NotFoundError('No products found');
        }

        const deactivateResult = await prisma.product.updateMany({
            where: { id: { in: validProductIds } },
            data: { deactivated: true }
        });

        res.json({
            success: true,
            message: `${deactivateResult.count} products deactivated successfully`,
            data: {
                deactivatedCount: deactivateResult.count,
                deactivatedIds: validProductIds
            }
        });
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Bulk product deactivation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate products'
        });
    }
};

export const bulkActivateProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new ValidationError('Product IDs are required');
        }

        const validProductIds = productIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        
        if (validProductIds.length === 0) {
            throw new ValidationError('No valid product IDs provided');
        }

        const existingProducts = await prisma.product.findMany({
            where: { id: { in: validProductIds } }
        });

        if (existingProducts.length === 0) {
            throw new NotFoundError('No products found');
        }

        const activateResult = await prisma.product.updateMany({
            where: { id: { in: validProductIds } },
            data: { deactivated: false }
        });

        res.json({
            success: true,
            message: `${activateResult.count} products activated successfully`,
            data: {
                activatedCount: activateResult.count,
                activatedIds: validProductIds
            }
        });
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error('Bulk product activation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate products'
        });
    }
};
