import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CustomerService } from './customers.service.js';

const createCustomerSchema = z.object({
  name: z.string().min(2, 'اسم الزبون يجب ألا يقل عن حرفين'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  initialDebt: z.number().min(0).optional()
});

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const search = req.query.search as string | undefined;
      const customers = await CustomerService.listCustomers(storeId, search);

      res.status(200).json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const customerId = req.params.id;
      const customer = await CustomerService.getCustomerById(storeId, customerId);

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const validated = createCustomerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(storeId, validated);

      res.status(201).json({
        success: true,
        message: 'تمت إضافة الزبون بنجاح',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const customerId = req.params.id;
      const validated = updateCustomerSchema.parse(req.body);
      const updated = await CustomerService.updateCustomer(storeId, customerId, validated);

      res.status(200).json({
        success: true,
        message: 'تم تحديث بيانات الزبون بنجاح',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const customerId = req.params.id;
      await CustomerService.deleteCustomer(storeId, customerId);

      res.status(200).json({
        success: true,
        message: 'تم حذف الزبون بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
}

