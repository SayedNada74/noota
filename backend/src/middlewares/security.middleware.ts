import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise HTTP Security Headers Middleware
 * يطبق معايير الأمان الموصى بها في دليل الأمان لحماية الـ API من Clickjacking و MIME-sniffing.
 */
export function enterpriseSecurityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
}

