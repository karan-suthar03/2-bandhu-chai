import express from 'express';
import {getFeaturedProducts, getProducts, getProduct} from '../controllers/productsController.js';

const router = express.Router();

router.get('/',getProducts)
router.get('/featured',getFeaturedProducts)
router.get('/:productId', getProduct);

export default router;