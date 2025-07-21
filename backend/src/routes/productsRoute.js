import express from 'express';
import {getFeaturedProducts, getProducts, getProduct, getCartItems} from '../controllers/productsController.js';

const router = express.Router();

router.get('/',getProducts)
router.get('/featured',getFeaturedProducts)
router.get('/:productId', getProduct);
router.post('/cart', getCartItems);

export default router;