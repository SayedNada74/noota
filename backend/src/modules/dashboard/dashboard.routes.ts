import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticateTenant } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateTenant);
router.get('/metrics', DashboardController.getSummary);

export default router;

