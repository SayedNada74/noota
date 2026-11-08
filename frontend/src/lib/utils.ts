export function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * خوارزمية تطبيع وتوحيد النصوص العربية القياسية (Arabic Text Normalization):
 * تزيل الفروق الشائعة بين (أ، إ، آ) وتوحدها إلى (ا)
 * وتوحد التاء المربوطة (ة) مع الهاء (ه)
 * وتوحد الألف المقصورة (ى) مع الياء (ي)
 * وتزيل علامات التشكيل وحركات المد والتطويل (ـ)
 * لضمان نتائج بحث فورية ودقيقة 100% للتجار.
 */
export function normalizeArabic(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل العربي
    .replace(/ـ/g, '') // إزالة الكشيدة والتطويل
    .replace(/\s+/g, ' ');
}

export function formatCurrency(amount: number, currency: string = 'ج.م'): string {
  return `${Number(amount).toLocaleString('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} ${currency}`;
}

/**
 * حاسبة سريعة آمنة بدون eval:
 * تحسب العمليات الحسابية البسيطة (+, -, *, /) في خانة المبلغ
 * لتمكين التاجر من إدخال أصناف متعددة (مثل: 25+40+15) وتجميعها تلقائياً.
 */
export function evaluateMathExpression(expr: string): number | null {
  if (!expr) return null;
  // تنظيف المدخلات والإبقاء فقط على الأرقام والعمليات الحسابية
  const sanitized = expr.replace(/[^\d+\-*/. ]/g, '').trim();
  if (!sanitized) return null;

  try {
    const tokens = sanitized.split(/([+\-*/])/).map(t => t.trim()).filter(Boolean);
    if (tokens.length === 0) return null;
    let result = parseFloat(tokens[0]);
    if (isNaN(result)) return null;

    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i];
      const nextVal = parseFloat(tokens[i + 1]);
      if (isNaN(nextVal)) continue;

      if (op === '+') result += nextVal;
      else if (op === '-') result -= nextVal;
      else if (op === '*') result *= nextVal;
      else if (op === '/' && nextVal !== 0) result /= nextVal;
    }

    return Math.round(result * 100) / 100;
  } catch {
    return null;
  }
}
