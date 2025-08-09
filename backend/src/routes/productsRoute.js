import express from 'express';
import { getFeaturedProducts, getProducts, getProduct } from '../controllers/productsController.js';
import { listProductReviews, createProductReview } from '../controllers/reviewsController.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getProducts));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/:productId', asyncHandler(getProduct));
router.get('/:productId/reviews', asyncHandler(listProductReviews));
router.post('/:productId/reviews', asyncHandler(createProductReview));

export default router;