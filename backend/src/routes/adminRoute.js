import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import multer from 'multer';
import { 
    getAdminProducts, 
    getAdminProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/adminProductsController.js';
import { 
    getAdminOrders, 
    getAdminOrder, 
    updateOrderStatus, 
    updateOrder, 
    getDashboardStats 
} from '../controllers/adminOrdersController.js';
import { 
    getAdminProfile, 
    updateAdminProfile, 
    changeAdminPassword, 
    getSystemAnalytics, 
    getLowStockProducts 
} from '../controllers/adminController.js';
import {validateCreateProduct} from "../middlewares/productMiddleware.js";

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
router.delete('/product/:id', deleteProduct);

router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id', updateOrder);
router.put('/orders/:orderId/status', updateOrderStatus);

export default router;
