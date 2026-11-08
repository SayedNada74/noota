import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// تنظيف الذاكرة دورياً كل 5 دقائق لمنع تسريب الذاكرة (Memory Leak Prevention)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * دالة التحقق من معدل الطلبات عبر النافذة المنزلقة (Sliding-Window Rate Limiter)
 * المعتمدة في الـ Enterprise Backend & Security Blueprint لحماية السيرفر من Brute-Force و DoS.
 */
export function checkRateLimit(
  identifier: string,
  options = { limit: 15, windowSeconds: 60 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.ceil((now + windowMs) / 1000)
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.ceil(existing.resetAt / 1000)
    };
  }

  existing.count++;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - existing.count,
    reset: Math.ceil(existing.resetAt / 1000)
  };
}

/**
 * Middleware لمسارات تسجيل الدخول وإنشاء الحساب
 */
export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown-client';
  const key = `auth-${ip}`;

  // 10 محاولات في الدقيقة الواحدة لكل IP
  const rate = checkRateLimit(key, { limit: 10, windowSeconds: 60 });

  res.setHeader('X-RateLimit-Limit', rate.limit);
  res.setHeader('X-RateLimit-Remaining', rate.remaining);
  res.setHeader('X-RateLimit-Reset', rate.reset);

  if (!rate.success) {
    res.setHeader('Retry-After', rate.reset);
    res.status(429).json({
      success: false,
      error: 'تم تجاوز الحد الأقصى لمحاولات الدخول، يرجى الانتظار دقيقة قبل المحاولة مجدداً.',
      code: 'TOO_MANY_REQUESTS',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
}

