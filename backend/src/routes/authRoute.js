import { Router } from 'express';
import {
    loginAdmin,
    getMe,
    createAdmin,
    changePassword
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/create-admin', createAdmin);

router.use(authenticateToken);

router.get('/me', getMe);
router.put('/change-password', changePassword);

export default router;
