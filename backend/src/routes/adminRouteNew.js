import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
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

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getSystemAnalytics);
router.get('/low-stock', getLowStockProducts);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/password', changeAdminPassword);

router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id', updateOrder);
router.put('/orders/:orderId/status', updateOrderStatus);

export default router;
