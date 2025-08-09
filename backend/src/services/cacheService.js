import redisClient from '../config/redisClient.js';

export class CacheService {
    static CACHE_TIMES = {
        PRODUCT: 60 * 30,
        PRODUCTS_LIST: 60 * 15,
        FEATURED_PRODUCTS: 60 * 60,
        PRODUCT_REVIEWS: 60 * 20,
        REVIEW_STATS: 60 * 30,
    };

    static KEYS = {
        PRODUCT: 'product:',
        PRODUCTS_LIST: 'products:list:',
        FEATURED_PRODUCTS: 'products:featured:',
        PRODUCT_REVIEWS: 'reviews:product:',
        REVIEW_STATS: 'reviews:stats:',
    };

    static async get(key) {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    static async set(key, data, expiration = 3600) {
        try {
            await redisClient.setEx(key, expiration, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    static async del(key) {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    static async delMultiple(keys) {
        try {
            if (keys.length === 0) return true;
            await redisClient.del(keys);
            return true;
        } catch (error) {
            console.error('Cache delete multiple error:', error);
            return false;
        }
    }

    static async delPattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Cache delete pattern error:', error);
            return false;
        }
    }

    static getProductKey(productId) {
        return `${this.KEYS.PRODUCT}${productId}`;
    }

    static getProductsListKey(filters) {
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((result, key) => {
                result[key] = filters[key];
                return result;
            }, {});
        
        const filterString = Buffer.from(JSON.stringify(sortedFilters)).toString('base64');
        return `${this.KEYS.PRODUCTS_LIST}${filterString}`;
    }

    static getFeaturedProductsKey(limit) {
        return `${this.KEYS.FEATURED_PRODUCTS}${limit}`;
    }

    static async cacheProduct(productId, productData) {
        const key = this.getProductKey(productId);
        return await this.set(key, productData, this.CACHE_TIMES.PRODUCT);
    }

    static async getCachedProduct(productId) {
        const key = this.getProductKey(productId);
        return await this.get(key);
    }

    static async cacheProductsList(filters, data) {
        const key = this.getProductsListKey(filters);
        return await this.set(key, data, this.CACHE_TIMES.PRODUCTS_LIST);
    }

    static async getCachedProductsList(filters) {
        const key = this.getProductsListKey(filters);
        return await this.get(key);
    }

    static async cacheFeaturedProducts(limit, products) {
        const key = this.getFeaturedProductsKey(limit);
        return await this.set(key, products, this.CACHE_TIMES.FEATURED_PRODUCTS);
    }

    static async getCachedFeaturedProducts(limit) {
        const key = this.getFeaturedProductsKey(limit);
        return await this.get(key);
    }

    static async invalidateProductCaches() {
        try {
            await Promise.all([
                this.delPattern(`${this.KEYS.PRODUCT}*`),
                this.delPattern(`${this.KEYS.PRODUCTS_LIST}*`),
                this.delPattern(`${this.KEYS.FEATURED_PRODUCTS}*`)
            ]);
            return true;
        } catch (error) {
            console.error('Cache invalidation error:', error);
            return false;
        }
    }

    static async invalidateProductCache(productId) {
        try {
            await this.del(this.getProductKey(productId));

            await Promise.all([
                this.delPattern(`${this.KEYS.PRODUCTS_LIST}*`),
                this.delPattern(`${this.KEYS.FEATURED_PRODUCTS}*`)
            ]);
            
            return true;
        } catch (error) {
            console.error('Product cache invalidation error:', error);
            return false;
        }
    }

    static getProductReviewsKey(productId, filters) {
        const sortedFilters = Object.keys(filters)
            .sort()
            .reduce((result, key) => {
                result[key] = filters[key];
                return result;
            }, {});
        
        const filterString = Buffer.from(JSON.stringify(sortedFilters)).toString('base64');
        return `${this.KEYS.PRODUCT_REVIEWS}${productId}:${filterString}`;
    }

    static getReviewStatsKey(productId) {
        return `${this.KEYS.REVIEW_STATS}${productId}`;
    }

    static async cacheProductReviews(productId, filters, data) {
        const key = this.getProductReviewsKey(productId, filters);
        return await this.set(key, data, this.CACHE_TIMES.PRODUCT_REVIEWS);
    }

    static async getCachedProductReviews(productId, filters) {
        const key = this.getProductReviewsKey(productId, filters);
        return await this.get(key);
    }

    static async cacheReviewStats(productId, stats) {
        const key = this.getReviewStatsKey(productId);
        return await this.set(key, stats, this.CACHE_TIMES.REVIEW_STATS);
    }

    static async getCachedReviewStats(productId) {
        const key = this.getReviewStatsKey(productId);
        return await this.get(key);
    }

    static async invalidateReviewCaches() {
        try {
            await Promise.all([
                this.delPattern(`${this.KEYS.PRODUCT_REVIEWS}*`),
                this.delPattern(`${this.KEYS.REVIEW_STATS}*`)
            ]);
            return true;
        } catch (error) {
            console.error('Review cache invalidation error:', error);
            return false;
        }
    }

    static async invalidateProductReviewCaches(productId) {
        try {
            await Promise.all([
                this.delPattern(`${this.KEYS.PRODUCT_REVIEWS}${productId}:*`),
                this.del(this.getReviewStatsKey(productId))
            ]);
            return true;
        } catch (error) {
            console.error('Product review cache invalidation error:', error);
            return false;
        }
    }

    static async invalidateAllCaches() {
        try {
            await Promise.all([
                this.invalidateProductCaches(),
                this.invalidateReviewCaches()
            ]);
            return true;
        } catch (error) {
            console.error('All cache invalidation error:', error);
            return false;
        }
    }
}
