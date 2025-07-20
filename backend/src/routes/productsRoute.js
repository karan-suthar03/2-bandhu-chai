import express from 'express';
import {getFeaturedProducts, getProducts} from '../controllers/productsController.js';

const router = express.Router();

router.get('/',getProducts)
router.get('/featured',getFeaturedProducts)

export default router;