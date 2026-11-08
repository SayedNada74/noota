import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateTenant } from '../../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = Router();

// مسارات المصادقة محمية بمحدد معدل الطلبات (Rate Limiting) لمنع الـ Brute Force
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.get('/me', authenticateTenant, AuthController.getMe);

export default router;
