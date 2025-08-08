import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { NotFoundError, ValidationError } from "../../middlewares/errors/AppError.js";
import { sendSuccess } from '../../utils/responseUtils.js';
import { validateId } from '../../utils/validationUtils.js';

const updateProduct = asyncHandler(async (req, res) => {
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

    const productId = validateId(id, 'Product ID');

    const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
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
        await tx.product.update({
            where: { id: productId },
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
                        productId: productId
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
                            productId: productId
                        }
                    });

                    if (variant.isDefault || variants.length === 1) {
                        newDefaultVariantId = newVariant.id;
                    }
                }
            }

            if (newDefaultVariantId) {
                await tx.product.update({
                    where: { id: productId },
                    data: { defaultVariantId: parseInt(newDefaultVariantId) }
                });
            }
        }

        return await tx.product.findUnique({
            where: { id: productId },
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

    return sendSuccess(res, {
        data: {
            ...result,
            image: processedImage,
            images: processedImages
        }
    }, 'Product updated successfully');
});

const updateProductCategorization = asyncHandler(async (req, res) => {
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

    const productId = validateId(id, 'Product ID');

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new NotFoundError('Product not found');
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
        where: { id: productId },
        data: updateData
    });

    return sendSuccess(res, { data: updatedProduct }, 'Product categorization updated successfully');
});

const updateProductCoreDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        name,
        description,
        fullDescription,
        stock
    } = req.body;

    const productId = validateId(id, 'Product ID');

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (fullDescription !== undefined) updateData.longDescription = fullDescription;
    if (stock !== undefined) updateData.stock = stock;

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData
    });

    return sendSuccess(res, { data: updatedProduct }, 'Product core details updated successfully');
});

const updateProductPricing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        price,
        oldPrice,
        stock,
        discount
    } = req.body;

    const productId = validateId(id, 'Product ID');

    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice;
    if (stock !== undefined) updateData.stock = stock;
    if (discount !== undefined) updateData.discount = discount;

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData
    });

    return sendSuccess(res, { data: updatedProduct }, 'Product pricing updated successfully');
});

export {
    updateProduct,
    updateProductCategorization,
    updateProductCoreDetails,
    updateProductPricing
};
