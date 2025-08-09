import { CacheService } from '../services/cacheService.js';
export const invalidateProductCachesMiddleware = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        if (isSuccess) {
            CacheService.invalidateProductCaches()
                .then(() => {
                    console.log('✅ Product caches invalidated after admin operation');
                })
                .catch((error) => {
                    console.error('❌ Failed to invalidate product caches:', error);
                });
        }
        return originalJson.call(this, data);
    };
    
    next();
};
export const invalidateSpecificProductCacheMiddleware = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        if (isSuccess && req.params?.id) {
            const productId = parseInt(req.params.id);
            
            if (!isNaN(productId)) {
                CacheService.invalidateProductCache(productId)
                    .then(() => {
                        console.log(`✅ Product ${productId} caches invalidated after admin operation`);
                    })
                    .catch((error) => {
                        console.error(`❌ Failed to invalidate product ${productId} caches:`, error);
                    });
            }
        }

        return originalJson.call(this, data);
    };
    
    next();
};

export const invalidateAllProductCachesMiddleware = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        if (isSuccess) {
            CacheService.invalidateProductCaches()
                .then(() => {
                    console.log('✅ All product caches invalidated after bulk admin operation');
                })
                .catch((error) => {
                    console.error('❌ Failed to invalidate all product caches:', error);
                });
        }

        return originalJson.call(this, data);
    };
    
    next();
};

export const invalidateReviewCachesMiddleware = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        if (isSuccess) {
            CacheService.invalidateAllCaches()
                .then(() => {
                    console.log('✅ All caches invalidated after review admin operation');
                })
                .catch((error) => {
                    console.error('❌ Failed to invalidate all caches:', error);
                });
        }

        return originalJson.call(this, data);
    };
    
    next();
};

export const invalidateAllCachesMiddleware = async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        if (isSuccess) {
            CacheService.invalidateAllCaches()
                .then(() => {
                    console.log('✅ All caches invalidated after admin operation');
                })
                .catch((error) => {
                    console.error('❌ Failed to invalidate all caches:', error);
                });
        }

        return originalJson.call(this, data);
    };
    
    next();
};
