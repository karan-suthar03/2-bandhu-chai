import { Router } from 'express';
import orderController from '../controllers/orderController.js';

const router = Router();

router.post('/', orderController.createOrder);

router.get('/:orderId', orderController.getOrder);

router.get('/confirmation/:orderNumber', orderController.getOrderConfirmation);

router.get('/track/:orderNumber', orderController.getOrderByNumber);

router.patch('/:orderId/cancel', orderController.cancelOrder);

router.patch('/:orderId/status', orderController.updateOrderStatus);

router.get('/', orderController.getAllOrders);

export default router;
