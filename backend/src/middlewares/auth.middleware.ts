import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthUser {
  userId: string;
  storeId: string;
  role: 'OWNER' | 'STAFF';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * ميدلوير التحقق من الجلسة وعزل المستأجرين (Tenant Authentication Guard):
 * يمنع هجمات Algorithm Confusion عبر إجبار الخادم على قبول 'HS256' حصراً
 * ورفض خوارزميات التوقيع الضعيفة أو 'none'.
 */
export const authenticateTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول أولاً',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'] // حظر صريح لأي خوارزمية أخرى
    }) as AuthUser;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'جلسة تسجيل الدخول منتهية أو غير صالحة',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }
};
