import express from 'express';
import {getFeaturedProducts} from '../controllers/productsController.js';

const router = express.Router();

router.get('/featured',getFeaturedProducts)

export default router;