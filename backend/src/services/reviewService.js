import prisma from "../config/prisma.js";
import { CacheService } from "./cacheService.js";

export class ReviewService {
    static async getProductReviews(productId, filters = {}) {
        const { page = 1, limit = 10 } = filters;

        const cachedResult = await CacheService.getCachedProductReviews(productId, filters);
        if (cachedResult) {
            console.log(`Product ${productId} reviews served from cache`);
            return cachedResult;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [product, reviews, total, agg] = await Promise.all([
            prisma.product.findUnique({ 
                where: { id: productId }, 
                select: { id: true } 
            }),
            prisma.review.findMany({
                where: { productId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    reviewerName: true,
                    rating: true,
                    comment: true,
                    isVerified: true,
                    createdAt: true
                },
                skip,
                take: limitNum
            }),
            prisma.review.count({ where: { productId } }),
            prisma.review.groupBy({
                by: ['rating'],
                _count: { rating: true },
                where: { productId }
            })
        ]);

        if (!product) {
            return null;
        }

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        
        for (const g of agg) {
            breakdown[g.rating] = g._count.rating;
            sum += g.rating * g._count.rating;
        }
        
        const average = total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;

        const result = {
            data: reviews,
            summary: {
                average,
                count: total,
                breakdown,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        };

        CacheService.cacheProductReviews(productId, filters, result)
            .then(() => console.log(`Product ${productId} reviews cached`))
            .catch(error => console.error(`Failed to cache product ${productId} reviews:`, error));

        return result;
    }

    static async createReview(productId, reviewData) {
        const { name, email, rating, comment } = reviewData;

        const product = await prisma.product.findUnique({ 
            where: { id: productId }, 
            select: { id: true, deactivated: true } 
        });
        
        if (!product || product.deactivated) {
            return null;
        }

        const result = await prisma.$transaction(async (tx) => {
            const created = await tx.review.create({
                data: {
                    productId,
                    reviewerName: String(name).trim().slice(0, 100),
                    reviewerEmail: String(email).trim().toLowerCase().slice(0, 200),
                    rating: parseInt(rating),
                    comment: (comment ? String(comment).trim() : null),
                    isVerified: false
                },
                select: {
                    id: true,
                    reviewerName: true,
                    rating: true,
                    comment: true,
                    isVerified: true,
                    createdAt: true
                }
            });

            const counts = await tx.review.groupBy({
                by: ['rating'], 
                _count: { rating: true }, 
                where: { productId } 
            });
            
            let total = 0; 
            let sum = 0; 
            
            for (const c of counts) { 
                total += c._count.rating; 
                sum += c.rating * c._count.rating; 
            }
            
            const average = total > 0 ? sum / total : 0;

            await tx.product.update({ 
                where: { id: productId }, 
                data: { rating: average, reviewCount: total } 
            });

            return created;
        });

        CacheService.invalidateProductReviewCaches(productId)
            .then(() => console.log(`Product ${productId} review caches invalidated after creation`))
            .catch(error => console.error(`Failed to invalidate product ${productId} review caches:`, error));

        CacheService.invalidateProductCache(productId)
            .then(() => console.log(`Product ${productId} caches invalidated after review creation`))
            .catch(error => console.error(`Failed to invalidate product ${productId} caches:`, error));

        return result;
    }

    static async getReviewStats(productId) {
        const cachedStats = await CacheService.getCachedReviewStats(productId);
        if (cachedStats) {
            console.log(`Product ${productId} review stats served from cache`);
            return cachedStats;
        }

        const [total, agg] = await Promise.all([
            prisma.review.count({ where: { productId } }),
            prisma.review.groupBy({
                by: ['rating'],
                _count: { rating: true },
                where: { productId }
            })
        ]);

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        
        for (const g of agg) {
            breakdown[g.rating] = g._count.rating;
            sum += g.rating * g._count.rating;
        }
        
        const average = total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;

        const stats = {
            average,
            count: total,
            breakdown
        };

        CacheService.cacheReviewStats(productId, stats)
            .then(() => console.log(`Product ${productId} review stats cached`))
            .catch(error => console.error(`Failed to cache product ${productId} review stats:`, error));

        return stats;
    }
}
