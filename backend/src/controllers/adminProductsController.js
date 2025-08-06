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

        res.json({
            success: true,
            data: processedProducts,
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

        if (!product) {
            throw new NotFoundError('Product not found');
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

    const variantUrls = settledResults.reduce((acc, {key, imageUrl}) => {
        acc[`${key}Url`] = imageUrl;
        return acc;
    }, {});
    return variantUrls;
}

export const createProduct = async (req, res) => {
    const {
        name, category, badge, description, longDescription, features,
        isNew, featured, organic, fastDelivery,
        variants: variantsData
    } = req.body;

    try {
        const mainImageVariantsUrls = await uploadVariants(req.files.mainImage[0]);

        let additionalImagesVariantsUrls = [];
        if (req.areFilesPresent && req.files.gallery && req.files.gallery.length > 0) {
            additionalImagesVariantsUrls = await Promise.all(
                req.files.gallery.map(img => uploadVariants(img))
            );
        }

        const product = await prisma.$transaction(async (tx) => {

            const createdProduct = await tx.product.create({
                data: {
                    name,
                    category,
                    description,
                    longDescription: req.body.fullDescription,
                    badge: badge || null,
                    features: features ? JSON.parse(features) : [],
                    isNew: isNew === 'true',
                    featured: featured === 'true',
                    organic: organic === 'true',
                    fastDelivery: fastDelivery === 'true',
                    image: mainImageVariantsUrls,
                    images: additionalImagesVariantsUrls,

                    variants: {
                        create: variantsData.map(variant => {
                            const price = parseFloat(variant.price);
                            const oldPrice = variant.oldPrice ? parseFloat(variant.oldPrice) : null;
                            let discount = null;
                            if (oldPrice && oldPrice > price) {
                                discount = (oldPrice - price) / oldPrice;
                            } else if (variant.discount) {
                                discount = parseFloat(variant.discount);
                            }
                            
                            return {
                                size: variant.size,
                                price: price,
                                oldPrice: oldPrice,
                                stock: parseInt(variant.stock),
                                discount: discount,
                                sku: variant.sku,
                            };
                        })
                    }
                },
                include: {
                    variants: true,
                }
            });

            const defaultVariantData = variantsData.find(v => v.isDefault === true);
            if (!defaultVariantData) {
                throw new Error("Default variant was not specified in the request.");
            }

            const defaultVariant = createdProduct.variants.find(v => v.sku === defaultVariantData.sku);
            if (!defaultVariant) {
                throw new Error("Could not find the created default variant by SKU. SKUs might be missing or duplicated.");
            }

            const updatedProduct = await tx.product.update({
                where: { id: createdProduct.id },
                data: {
                    defaultVariantId: defaultVariant.id,
                },
                include: {
                    variants: true,
                }
            });

            return updatedProduct;
        });

        console.log('Transaction successful.');
        res.status(201).json({
            message: 'Product created successfully',
            product: product
        });

    } catch (err) {
        console.error('Error in createProduct flow:', err);
        if (err.code === 'P2028') {
            res.status(500).json({ error: 'A critical operation timed out.', details: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create product.', details: err.message });
        }
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            description, 
            longDescription,
            category, 
            badge,
            features,
            isNew,
            organic,
            fastDelivery,
            featured,
            deactivated,
            variants,
            defaultVariantId
        } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                variants: true,
                defaultVariant: true
            }
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        if (variants && Array.isArray(variants)) {
            if (variants.length === 0) {
                throw new ValidationError('At least one variant is required');
            }

            for (const variant of variants) {
                if (!variant.size?.trim()) {
                    throw new ValidationError('Each variant must have a size');
                }
                if (!variant.price || variant.price <= 0) {
                    throw new ValidationError('Each variant must have a valid price');
                }
                if (variant.stock < 0) {
                    throw new ValidationError('Variant stock cannot be negative');
                }
                if (variant.oldPrice && variant.oldPrice < variant.price) {
                    throw new ValidationError('Old price cannot be less than current price');
                }
            }

            if (defaultVariantId) {
                const hasDefaultVariant = variants.some(v => 
                    (v.id && v.id === defaultVariantId) || v.isDefault
                );
                if (!hasDefaultVariant) {
                    throw new ValidationError('Default variant must be one of the provided variants');
                }
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const updateData = {};
            if (name !== undefined) updateData.name = name.trim();
            if (description !== undefined) updateData.description = description.trim();
            if (longDescription !== undefined) updateData.longDescription = longDescription?.trim() || null;
            if (category !== undefined) updateData.category = category.trim();
            if (badge !== undefined) updateData.badge = badge?.trim() || '';
            if (features !== undefined) updateData.features = features || [];
            if (isNew !== undefined) updateData.isNew = Boolean(isNew);
            if (organic !== undefined) updateData.organic = Boolean(organic);
            if (fastDelivery !== undefined) updateData.fastDelivery = Boolean(fastDelivery);
            if (featured !== undefined) updateData.featured = Boolean(featured);
            if (deactivated !== undefined) updateData.deactivated = Boolean(deactivated);

            const updatedProduct = await tx.product.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            if (variants && Array.isArray(variants)) {
                const existingVariantIds = existingProduct.variants.map(v => v.id);
                const newVariantIds = variants.filter(v => v.id && !v.id.toString().startsWith('temp_')).map(v => v.id);
                const variantsToDelete = existingVariantIds.filter(id => !newVariantIds.includes(id));
                
                if (variantsToDelete.length > 0) {
                    await tx.productVariant.deleteMany({
                        where: {
                            id: { in: variantsToDelete },
                            productId: parseInt(id)
                        }
                    });
                }

                let newDefaultVariantId = defaultVariantId;
                for (const variant of variants) {
                    const variantData = {
                        size: variant.size.trim(),
                        price: parseFloat(variant.price),
                        oldPrice: variant.oldPrice ? parseFloat(variant.oldPrice) : null,
                        stock: parseInt(variant.stock) || 0,
                        sku: variant.sku || '',
                        discount: variant.discount || 0
                    };

                    if (variant.id && !variant.id.toString().startsWith('temp_')) {
                        const updatedVariant = await tx.productVariant.update({
                            where: { id: parseInt(variant.id) },
                            data: variantData
                        });

                        if (variant.isDefault || variant.id === defaultVariantId) {
                            newDefaultVariantId = updatedVariant.id;
                        }
                    } else {
                        const newVariant = await tx.productVariant.create({
                            data: {
                                ...variantData,
                                productId: parseInt(id)
                            }
                        });

                        if (variant.isDefault || variants.length === 1) {
                            newDefaultVariantId = newVariant.id;
                        }
                    }
                }

                if (newDefaultVariantId) {
                    await tx.product.update({
                        where: { id: parseInt(id) },
                        data: { defaultVariantId: parseInt(newDefaultVariantId) }
                    });
                }
            }

            return await tx.product.findUnique({
                where: { id: parseInt(id) },
                include: {
                    variants: true,
                    defaultVariant: true
                }
            });
        });

        let processedImage = result.image;
        let processedImages = result.images;

        if (processedImage && typeof processedImage === 'string') {
            try {
                processedImage = JSON.parse(processedImage);
            } catch (e) {
                console.warn('Failed to parse image JSON string in response:', processedImage);
            }
        }

        if (processedImages && Array.isArray(processedImages)) {
            processedImages = processedImages.map(img => {
                if (typeof img === 'string') {
                    try {
                        return JSON.parse(img);
                    } catch (e) {
                        console.warn('Failed to parse image JSON string in response:', img);
                        return img;
                    }
                }
                return img;
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                ...result,
                image: processedImage,
                images: processedImages
            }
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

export const updateProductCategorization = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            category,
            badge,
            features,
            isNew,
            featured,
            organic,
            fastDelivery,
            deactivated
        } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = {};
        if (category !== undefined) updateData.category = category;
        if (badge !== undefined) updateData.badge = badge;
        if (features !== undefined) updateData.features = features;
        if (isNew !== undefined) updateData.isNew = isNew;
        if (featured !== undefined) updateData.featured = featured;
        if (organic !== undefined) updateData.organic = organic;
        if (fastDelivery !== undefined) updateData.fastDelivery = fastDelivery;
        if (deactivated !== undefined) updateData.deactivated = deactivated;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Product categorization updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Product categorization update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product categorization',
            error: error.message
        });
    }
};

export const updateProductCoreDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name,
            description,
            fullDescription,
            stock
        } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (fullDescription !== undefined) updateData.longDescription = fullDescription;
        if (stock !== undefined) updateData.stock = stock;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Product core details updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Product core details update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product core details',
            error: error.message
        });
    }
};

export const updateProductPricing = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            price,
            oldPrice,
            stock,
            discount
        } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = {};
        if (price !== undefined) updateData.price = price;
        if (oldPrice !== undefined) updateData.oldPrice = oldPrice;
        if (stock !== undefined) updateData.stock = stock;
        if (discount !== undefined) updateData.discount = discount;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Product pricing updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Product pricing update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product pricing',
            error: error.message
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
                console.log('Main image uploaded successfully, storing in updateData.image:', JSON.stringify(mainImageVariantsUrls, null, 2));
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

           let currentProductImages = [];
            if (existingProduct.images && Array.isArray(existingProduct.images)) {
                currentProductImages = existingProduct.images.map(img => {
                    if (typeof img === 'string') {
                        try {
                            return JSON.parse(img);
                        } catch (e) {
                            return img;
                        }
                    }
                    return img;
                });
            }

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

                const currentImageMap = new Map();
                currentProductImages.forEach((img) => {
                    if (typeof img === 'string') {
                        currentImageMap.set(img, img);
                    } else if (img && typeof img === 'object') {
                        // Map all URL variants to the full object
                        if (img.largeUrl) currentImageMap.set(img.largeUrl, img);
                        if (img.mediumUrl) currentImageMap.set(img.mediumUrl, img);
                        if (img.smallUrl) currentImageMap.set(img.smallUrl, img);
                        if (img.extraLargeUrl) currentImageMap.set(img.extraLargeUrl, img);
                    }
                });

                galleryOrder.forEach(item => {
                    if (typeof item === 'string' && item.startsWith('new_')) {
                        const newImg = newImageMap.get(item);
                        if (newImg) {
                            finalGalleryImages.push(newImg);
                        }
                    } else if (typeof item === 'string') {
                        const existingImg = currentImageMap.get(item);
                        if (existingImg) {
                            finalGalleryImages.push(existingImg);
                        } else {
                            finalGalleryImages.push(item);
                        }
                    } else {
                        // Handle objects directly
                        finalGalleryImages.push(item);
                    }
                });
                
                uploadResults.push(`Gallery reordered: ${finalGalleryImages.length} images in custom order`);
            } else if (existingImages.length > 0) {
                finalGalleryImages = [...currentProductImages, ...newUploadedImages];
                
                uploadResults.push(`Gallery updated: kept ${currentProductImages.length} existing images`);
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

        console.log('Raw response from database update:');
        console.log('- image type:', typeof updatedProduct.image);
        console.log('- image value:', updatedProduct.image);
        console.log('- images type:', typeof updatedProduct.images);
        console.log('- images length:', updatedProduct.images?.length);
        if (updatedProduct.images?.length > 0) {
            console.log('- first image in array type:', typeof updatedProduct.images[0]);
            console.log('- first image in array value:', updatedProduct.images[0]);
        }

        let processedImage = updatedProduct.image;
        let processedImages = updatedProduct.images;

        if (processedImage && typeof processedImage === 'string') {
            try {
                processedImage = JSON.parse(processedImage);
                console.warn('Had to parse image field as string - this should not happen with Prisma JSON fields');
            } catch (e) {
                console.error('Failed to parse image JSON string in response:', processedImage);
            }
        }

        if (processedImages && Array.isArray(processedImages)) {
            processedImages = processedImages.map(img => {
                if (typeof img === 'string') {
                    try {
                        const parsed = JSON.parse(img);
                        console.warn('Had to parse images array item as string - this should not happen with Prisma JSON fields');
                        return parsed;
                    } catch (e) {
                        console.error('Failed to parse image JSON string in response:', img);
                        return img;
                    }
                }
                return img;
            });
        }

        const responseData = {
            id: updatedProduct.id,
            image: processedImage,
            images: processedImages,
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

export const getAllVariants = async (req, res) => {
    try {
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

        res.json({
            success: true,
            data: processedVariants,
            total,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get variants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch variants',
            error: error.message
        });
    }
};
