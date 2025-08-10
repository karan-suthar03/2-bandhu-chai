import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import multer from 'multer';
import { 
    getAdminProducts, 
    getAdminProduct, 
    createProduct, 
    updateProduct, 
    updateProductMedia,
    updateProductCategorization,
    updateProductCoreDetails,
    updateProductPricing,
    deactivateProduct,
    activateProduct,
    bulkDeactivateProducts,
    bulkActivateProducts,
    getAllVariants 
} from '../controllers/adminProductsController.js';
import { 
    getAdminOrders, 
    getAdminOrder, 
    updateOrderStatus, 
    updateOrder, 
    getDashboardStats,
    deleteOrder,
    bulkDeleteOrders 
} from '../controllers/adminOrdersController.js';
import { 
    getAdminProfile, 
    updateAdminProfile, 
    changeAdminPassword
} from '../controllers/adminController.js';
import {
    getAdminReviews,
    getAdminReview,
    updateReviewVerification,
    deleteReview,
    bulkDeleteReviews,
    bulkUpdateVerification,
    getReviewStats
} from '../controllers/adminReviewsController.js';
import {
    getEmailStats,
    getEmailLogs,
    getOrderEmailLogs,
    retryFailedEmails
} from '../controllers/emailTrackingController.js';
import {
    getSystemAnalytics,
    getLowStockProducts
} from '../controllers/analyticsController.js';
import {validateCreateProduct, validateProductMediaUpdate, validateProductCategorization, validateProductCoreDetails, validateProductPricing} from "../middlewares/productMiddleware.js";
import { 
    invalidateProductCachesMiddleware, 
    invalidateSpecificProductCacheMiddleware, 
    invalidateAllProductCachesMiddleware,
    invalidateReviewCachesMiddleware
} from '../middlewares/cacheInvalidation.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getSystemAnalytics);
router.get('/low-stock', getLowStockProducts);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/password', changeAdminPassword);

router.get('/products', getAdminProducts);
router.get('/variants', getAllVariants);
router.post('/products/bulk-deactivate', invalidateAllProductCachesMiddleware, bulkDeactivateProducts);
router.post('/products/bulk-activate', invalidateAllProductCachesMiddleware, bulkActivateProducts);
router.get('/product/:id', getAdminProduct);
router.post(
  '/product',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
    validateCreateProduct,
    invalidateProductCachesMiddleware,
  createProduct
);
router.put('/product/:id', invalidateSpecificProductCacheMiddleware, updateProduct);
router.put('/product/:id/core-details', validateProductCoreDetails, invalidateSpecificProductCacheMiddleware, updateProductCoreDetails);
router.put('/product/:id/pricing', validateProductPricing, invalidateSpecificProductCacheMiddleware, updateProductPricing);
router.put('/product/:id/categorization', validateProductCategorization, invalidateSpecificProductCacheMiddleware, updateProductCategorization);
router.put(
  '/product/:id/media',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
  validateProductMediaUpdate,
  invalidateSpecificProductCacheMiddleware,
  updateProductMedia
);
router.put('/product/:id/deactivate', invalidateSpecificProductCacheMiddleware, deactivateProduct);
router.put('/product/:id/activate', invalidateSpecificProductCacheMiddleware, activateProduct);

router.get('/orders', getAdminOrders);
router.post('/orders/bulk-delete', bulkDeleteOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id', updateOrder);
router.put('/orders/:orderId/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

router.get('/reviews', getAdminReviews);
router.get('/reviews/stats', getReviewStats);
router.post('/reviews/bulk-delete', invalidateReviewCachesMiddleware, bulkDeleteReviews);
router.post('/reviews/bulk-verify', invalidateReviewCachesMiddleware, bulkUpdateVerification);
router.get('/reviews/:id', getAdminReview);
router.put('/reviews/:id/verify', invalidateReviewCachesMiddleware, updateReviewVerification);
router.delete('/reviews/:id', invalidateReviewCachesMiddleware, deleteReview);


router.get('/emails/stats', getEmailStats);
router.get('/emails/logs', getEmailLogs);
router.get('/emails/orders/:orderId', getOrderEmailLogs);
router.post('/emails/retry', retryFailedEmails);

export default router;
