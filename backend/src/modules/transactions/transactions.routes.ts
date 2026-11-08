import { Router } from 'express';
import { TransactionController } from './transactions.controller.js';
import { authenticateTenant } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateTenant);

router.post('/', TransactionController.create);
router.get('/recent', TransactionController.listRecent);
router.get('/customer/:customerId', TransactionController.getCustomerHistory);

export default router;

