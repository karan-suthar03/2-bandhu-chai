import express from 'express';
import cartController from '../controllers/cartController.js';

const router = express.Router();

router.get('/', cartController.getCart);

router.post('/add', cartController.addToCart);

router.put('/item/:productId', cartController.updateCartItem);

router.delete('/item/:productId', cartController.removeFromCart);

router.delete('/clear', cartController.clearCart);

router.post('/sync', cartController.syncCart);

router.get('/checkout-preview', cartController.getCheckoutPreview);

export default router;