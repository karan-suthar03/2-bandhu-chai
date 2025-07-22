import express from 'express';
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    syncCart, 
    getCheckoutPreview 
} from '../controllers/cartController.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getCart));
router.post('/add', asyncHandler(addToCart));
router.put('/item/:productId', asyncHandler(updateCartItem));
router.delete('/item/:productId', asyncHandler(removeFromCart));
router.delete('/clear', asyncHandler(clearCart));
router.post('/sync', asyncHandler(syncCart));
router.get('/checkout-preview', asyncHandler(getCheckoutPreview));

export default router;