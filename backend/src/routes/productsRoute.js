import express from 'express';
import { getFeaturedProducts, getProducts, getProduct } from '../controllers/productsController.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getProducts));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/:productId', asyncHandler(getProduct));

export default router;