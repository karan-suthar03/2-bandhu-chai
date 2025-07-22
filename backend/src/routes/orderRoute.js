import { Router } from 'express';
import { 
    createOrder, 
    getOrder, 
    getOrderConfirmation, 
    getOrderByNumber, 
    cancelOrder, 
    updateOrderStatus, 
    getAllOrders 
} from '../controllers/orderController.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(createOrder));
router.get('/:orderId', asyncHandler(getOrder));
router.get('/confirmation/:orderNumber', asyncHandler(getOrderConfirmation));
router.get('/track/:orderNumber', asyncHandler(getOrderByNumber));
router.patch('/:orderId/cancel', asyncHandler(cancelOrder));
router.patch('/:orderId/status', asyncHandler(updateOrderStatus));
router.get('/', asyncHandler(getAllOrders));

export default router;
