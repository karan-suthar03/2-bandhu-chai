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
    deactivateProduct,
    activateProduct,
    bulkDeactivateProducts,
    bulkActivateProducts 
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
    changeAdminPassword, 
    getSystemAnalytics, 
    getLowStockProducts 
} from '../controllers/adminController.js';
import {validateCreateProduct, validateProductMediaUpdate, validateProductCategorization} from "../middlewares/productMiddleware.js";

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
router.post('/products/bulk-deactivate', bulkDeactivateProducts);
router.post('/products/bulk-activate', bulkActivateProducts);
router.get('/product/:id', getAdminProduct);
router.post(
  '/product',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
    validateCreateProduct,
  createProduct
);
router.put('/product/:id', updateProduct);
router.put('/product/:id/categorization', validateProductCategorization, updateProductCategorization);
router.put(
  '/product/:id/media',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
  validateProductMediaUpdate,
  updateProductMedia
);
router.put('/product/:id/deactivate', deactivateProduct);
router.put('/product/:id/activate', activateProduct);

router.get('/orders', getAdminOrders);
router.post('/orders/bulk-delete', bulkDeleteOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id', updateOrder);
router.put('/orders/:orderId/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

export default router;
