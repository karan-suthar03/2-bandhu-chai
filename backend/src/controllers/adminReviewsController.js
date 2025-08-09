import prisma from "../config/prisma.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
    sendSuccess,
    sendBadRequest,
    sendNotFound,
    createPaginatedResponse,
    sendResponse
} from "../utils/responseUtils.js";
import { validateId } from "../utils/validationUtils.js";

const getAdminReviews = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        search = '',
        verified = '',
        rating = '',
        productId = '',
        _sort = 'createdAt',
        _order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {};

    if (typeof search === 'string' && search.trim()) {
        whereClause.OR = [
            { reviewerName: { contains: search, mode: 'insensitive' } },
            { reviewerEmail: { contains: search, mode: 'insensitive' } },
            { comment: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (verified !== '' && verified != null) {
        if (typeof verified === 'boolean') {
            whereClause.isVerified = verified;
        } else if (typeof verified === 'string') {
            const v = verified.toLowerCase();
            if (v === 'true' || v === 'false') {
                whereClause.isVerified = v === 'true';
            }
        }
    }

    if (rating !== '' && rating != null && !isNaN(parseInt(rating))) {
        whereClause.rating = parseInt(rating);
    }

    if (productId !== '' && productId != null && !isNaN(parseInt(productId))) {
        whereClause.productId = parseInt(productId);
    }

    const sortableFields = new Set(['createdAt', 'rating', 'reviewerName', 'isVerified']);
    const sortField = sortableFields.has(_sort) ? _sort : 'createdAt';
    const sortDirection = String(_order).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: whereClause,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        deactivated: true
                    }
                }
            },
            skip,
            take: limitNum,
            orderBy: {
                [sortField]: sortDirection
            }
        }),
        prisma.review.count({ where: whereClause })
    ]);

    const pagination = {
        page: pageNum,
        limit: limitNum,
        total
    };

    return sendResponse(res, 200, createPaginatedResponse(reviews, pagination));
});

const getAdminReview = asyncHandler(async (req, res) => {
    const reviewId = validateId(req.params.id, 'Review ID');
    
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    deactivated: true
                }
            }
        }
    });

    if (!review) {
        return sendNotFound(res, 'Review not found');
    }

    return sendSuccess(res, { review });
});

const updateReviewVerification = asyncHandler(async (req, res) => {
    const reviewId = validateId(req.params.id, 'Review ID');
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
        return sendBadRequest(res, 'isVerified must be a boolean value');
    }

    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        return sendNotFound(res, 'Review not found');
    }

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { isVerified },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    deactivated: true
                }
            }
        }
    });

    return sendSuccess(res, { 
        review: updatedReview 
    }, `Review ${isVerified ? 'verified' : 'unverified'} successfully`);
});

const deleteReview = asyncHandler(async (req, res) => {
    const reviewId = validateId(req.params.id, 'Review ID');

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { product: true }
    });

    if (!review) {
        return sendNotFound(res, 'Review not found');
    }

    await prisma.$transaction(async (tx) => {
        await tx.review.delete({
            where: { id: reviewId }
        });

        const remainingReviews = await tx.review.groupBy({
            by: ['rating'],
            _count: { rating: true },
            where: { productId: review.productId }
        });

        let total = 0;
        let sum = 0;
        for (const r of remainingReviews) {
            total += r._count.rating;
            sum += r.rating * r._count.rating;
        }

        const average = total > 0 ? sum / total : 0;

        await tx.product.update({
            where: { id: review.productId },
            data: {
                rating: average,
                reviewCount: total
            }
        });
    });

    return sendSuccess(res, {}, 'Review deleted successfully');
});

const bulkDeleteReviews = asyncHandler(async (req, res) => {
    const { reviewIds } = req.body;

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return sendBadRequest(res, 'Review IDs array is required');
    }

    const validIds = reviewIds.map(id => validateId(id, 'Review ID'));

    const reviewsToDelete = await prisma.review.findMany({
        where: { id: { in: validIds } },
        select: { id: true, productId: true }
    });

    if (reviewsToDelete.length === 0) {
        return sendNotFound(res, 'No reviews found with the provided IDs');
    }

    const productIds = [...new Set(reviewsToDelete.map(r => r.productId))];

    await prisma.$transaction(async (tx) => {
        const deleteResult = await tx.review.deleteMany({
            where: { id: { in: validIds } }
        });

        for (const productId of productIds) {
            const remainingReviews = await tx.review.groupBy({
                by: ['rating'],
                _count: { rating: true },
                where: { productId }
            });

            let total = 0;
            let sum = 0;
            for (const r of remainingReviews) {
                total += r._count.rating;
                sum += r.rating * r._count.rating;
            }

            const average = total > 0 ? sum / total : 0;

            await tx.product.update({
                where: { id: productId },
                data: {
                    rating: average,
                    reviewCount: total
                }
            });
        }
    });

    return sendSuccess(res, { 
        deletedCount: reviewsToDelete.length 
    }, `${reviewsToDelete.length} reviews deleted successfully`);
});

const bulkUpdateVerification = asyncHandler(async (req, res) => {
    const { reviewIds, isVerified } = req.body;

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return sendBadRequest(res, 'Review IDs array is required');
    }

    if (typeof isVerified !== 'boolean') {
        return sendBadRequest(res, 'isVerified must be a boolean value');
    }

    const validIds = reviewIds.map(id => validateId(id, 'Review ID'));

    const updateResult = await prisma.review.updateMany({
        where: { id: { in: validIds } },
        data: { isVerified }
    });

    return sendSuccess(res, { 
        updatedCount: updateResult.count 
    }, `${updateResult.count} reviews ${isVerified ? 'verified' : 'unverified'} successfully`);
});

const getReviewStats = asyncHandler(async (req, res) => {
    const [
        totalReviews,
        verifiedReviews,
        unverifiedReviews,
        avgRating,
        ratingBreakdown,
        recentReviews
    ] = await Promise.all([
        prisma.review.count(),
        prisma.review.count({ where: { isVerified: true } }),
        prisma.review.count({ where: { isVerified: false } }),
        prisma.review.aggregate({
            _avg: { rating: true }
        }),
        prisma.review.groupBy({
            by: ['rating'],
            _count: { rating: true },
            orderBy: { rating: 'asc' }
        }),
        prisma.review.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { id: true, name: true }
                }
            }
        })
    ]);

    const stats = {
        total: totalReviews,
        verified: verifiedReviews,
        unverified: unverifiedReviews,
        verificationRate: totalReviews > 0 ? (verifiedReviews / totalReviews) * 100 : 0,
        averageRating: avgRating._avg.rating || 0,
        ratingBreakdown: ratingBreakdown.reduce((acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
        recentReviews
    };

    return sendSuccess(res, { stats });
});

export {
    getAdminReviews,
    getAdminReview,
    updateReviewVerification,
    deleteReview,
    bulkDeleteReviews,
    bulkUpdateVerification,
    getReviewStats
};
