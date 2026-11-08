import { Router } from 'express';
import { CustomerController } from './customers.controller.js';
import { authenticateTenant } from '../../middlewares/auth.middleware.js';

const router = Router();

// جميع مسارات العملاء محمية بنظام التحقق وعزل التاجر
router.use(authenticateTenant);

router.get('/', CustomerController.list);
router.get('/:id', CustomerController.getById);
router.post('/', CustomerController.create);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);

export default router;

