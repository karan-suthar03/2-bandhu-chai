import { Router } from 'express';
import {
    loginAdmin,
    getMe,
    createAdmin,
    changePassword,
    refreshToken,
    logoutAdmin
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/refresh', refreshToken);

router.post('/create-admin', authenticateToken, requireAdmin, createAdmin);

router.use(authenticateToken);

router.get('/me', getMe);
router.put('/change-password', changePassword);
router.post('/logout', logoutAdmin);

export default router;
