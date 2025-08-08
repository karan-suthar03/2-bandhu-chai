import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { NotFoundError, ValidationError } from "../../middlewares/errors/AppError.js";
import { sendSuccess } from '../../utils/responseUtils.js';
import { validateRequired, validateId } from '../../utils/validationUtils.js';

const deactivateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productId = validateId(id, 'Product ID');

    const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!existingProduct) {
        throw new NotFoundError('Product not found');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { deactivated: true, featured: false }
    });

    return sendSuccess(res, { data: updatedProduct }, 'Product deactivated successfully');
});

const activateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productId = validateId(id, 'Product ID');

    const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!existingProduct) {
        throw new NotFoundError('Product not found');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { deactivated: false }
    });

    return sendSuccess(res, { data: updatedProduct }, 'Product activated successfully');
});

const bulkDeactivateProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    const missingFields = validateRequired(['productIds'], req.body);
    if (missingFields.length > 0) {
        throw new ValidationError('Product IDs are required');
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new ValidationError('Product IDs must be a non-empty array');
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

    return sendSuccess(res, {
        data: {
            deactivatedCount: deactivateResult.count,
            deactivatedIds: validProductIds
        }
    }, `${deactivateResult.count} products deactivated successfully`);
});

const bulkActivateProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    const missingFields = validateRequired(['productIds'], req.body);
    if (missingFields.length > 0) {
        throw new ValidationError('Product IDs are required');
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
        throw new ValidationError('Product IDs must be a non-empty array');
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

    return sendSuccess(res, {
        data: {
            activatedCount: activateResult.count,
            activatedIds: validProductIds
        }
    }, `${activateResult.count} products activated successfully`);
});

export {
    deactivateProduct,
    activateProduct,
    bulkDeactivateProducts,
    bulkActivateProducts
};
