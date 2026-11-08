import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';

const registerSchema = z.object({
  storeName: z.string().min(2, 'اسم المحل يجب ألا يقل عن حرفين'),
  ownerName: z.string().min(2, 'اسم صاحب المحل يجب ألا يقل عن حرفين'),
  phone: z.string().min(8, 'يرجى إدخال رقم هاتف صحيح'),
  password: z.string().min(6, 'كلمة السر يجب ألا تقل عن 6 أحرف'),
  address: z.string().optional()
});

const loginSchema = z.object({
  phone: z.string().min(8, 'يرجى إدخال رقم هاتف صحيح'),
  password: z.string().min(6, 'كلمة السر غير صالحة')
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.registerStoreWithOwner(validated);
      res.status(201).json({
        success: true,
        message: 'تم إنشاء حساب المحل بنجاح',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = loginSchema.parse(req.body);
      const result = await AuthService.login(phone, password);
      res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await AuthService.getMe(userId);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }
}

