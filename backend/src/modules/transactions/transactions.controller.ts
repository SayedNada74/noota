import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TransactionService } from './transactions.service.js';

const recordTransactionSchema = z.object({
  customerId: z.string().uuid('معرف الزبون غير صالح'),
  type: z.enum(['DEBT', 'PAYMENT'], {
    errorMap: () => ({ message: 'نوع الحركة يجب أن يكون دين (DEBT) أو سداد (PAYMENT)' })
  }),
  amount: z.number().positive('يجب أن يكون المبلغ رقماً موجباً أكبر من صفر'),
  note: z.string().max(255).optional()
});

export class TransactionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const userId = req.user!.userId;
      const validated = recordTransactionSchema.parse(req.body);

      const result = await TransactionService.recordTransaction({
        storeId,
        userId,
        ...validated
      });

      res.status(201).json({
        success: true,
        message: validated.type === 'DEBT' ? 'تم تسجيل الدين بنجاح' : 'تم تسجيل السداد بنجاح',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async listRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const transactions = await TransactionService.listRecentTransactions(storeId, limit);

      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user!.storeId;
      const customerId = req.params.customerId;
      const ledger = await TransactionService.getCustomerLedger(storeId, customerId);

      res.status(200).json({
        success: true,
        data: ledger
      });
    } catch (error) {
      next(error);
    }
  }
}

