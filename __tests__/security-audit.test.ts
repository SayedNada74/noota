/**
 * 🛡️ Automated Enterprise Security & Testing Suite
 * حزمة فحص الأمان واختبار الجاهزية للإنتاج المعتمدة في:
 * "SECURITY_AND_TESTING_BLUEPRINT.md" & "MASTER_FULLSTACK_AI_DIRECTIVE.md"
 */

import { isDisallowedOrPrivateIP } from '../backend/src/lib/ssrf.js';
import { checkRateLimit } from '../backend/src/middlewares/rateLimiter.middleware.js';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:5000/api';

async function runSecurityAudit() {
  console.log('\n============================================================');
  console.log('🛡️ تشغيل حزمة اختبارات الأمان والجاهزية الشاملة (Noota Audit)');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errMessage: string) {
    if (condition) {
      console.log(`✅ [نجاح] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [فشل] ${testName} ── ${errMessage}`);
      failed++;
    }
  }

  // 1. الفحص الاستاتيكي لكود الواجهة والباك إند (Static Code Audit)
  console.log('--- 1. فحص الشفرة المصدرية (Static Code Analysis) ---');
  try {
    const authCode = fs.readFileSync(path.join(process.cwd(), 'frontend/src/lib/auth.ts'), 'utf8');
    assert(
      !authCode.includes('localStorage.setItem("password"'),
      'عدم حفظ كلمات المرور في المتصفح',
      'تم العثور على كلمة مرور مخزنة في localStorage'
    );

    const modalCode = fs.readFileSync(path.join(process.cwd(), 'frontend/src/components/ui/Modal.tsx'), 'utf8');
    assert(
      modalCode.includes('createPortal') && modalCode.includes('z-[99999]'),
      'التزام النوافذ المنبثقة بمعيار React Portal و z-[99999]',
      'المودال لا يستخدم createPortal أو لا يحمل z-[99999]'
    );

    const nextConfig = fs.readFileSync(path.join(process.cwd(), 'frontend/next.config.ts'), 'utf8');
    assert(
      nextConfig.includes('poweredByHeader: false') && nextConfig.includes('X-Frame-Options'),
      'تفعيل ترويسات الأمان الصارمة و إخفاء بصمة الخادم في next.config.ts',
      'ترويسات الأمان مفقودة في next.config.ts'
    );
  } catch (err: any) {
    assert(false, 'قراءة ملفات الفحص الاستاتيكي', err.message);
  }

  // 2. اختبار وحدة صد هجمات الـ SSRF وعناوين الميتاداتا
  console.log('\n--- 2. اختبار وحدة حظر SSRF والخوادم الداخلية ---');
  assert(
    isDisallowedOrPrivateIP('169.254.169.254'),
    'حظر عنوان ميتاداتا السحابة الحساس (AWS/GCP 169.254.169.254)',
    'فشل حظر 169.254.169.254'
  );
  assert(
    isDisallowedOrPrivateIP('127.0.0.1') && isDisallowedOrPrivateIP('localhost'),
    'حظر عناوين الاسترجاع الداخلي Loopback (127.0.0.1 / localhost)',
    'فشل حظر Loopback'
  );
  assert(
    isDisallowedOrPrivateIP('192.168.1.1') && isDisallowedOrPrivateIP('10.0.0.1'),
    'حظر عناوين الشبكات الخاصة Private Subnets (10.x / 192.168.x)',
    'فشل حظر Private IP'
  );
  assert(
    !isDisallowedOrPrivateIP('api.supabase.com'),
    'السماح بالنطاقات العامة الشرعية (api.supabase.com)',
    'تم حظر نطاق عام شرعي خطأً'
  );

  // 3. اختبار محدد معدل الطلبات (Rate Limiting Stress Test)
  console.log('\n--- 3. اختبار محدد معدل الطلبات (Rate Limiter Stress Test) ---');
  const testIp = `test-ip-${Date.now()}`;
  let triggered429 = false;
  for (let i = 0; i < 15; i++) {
    const res = checkRateLimit(testIp, { limit: 10, windowSeconds: 60 });
    if (!res.success) {
      triggered429 = true;
      break;
    }
  }
  assert(
    triggered429,
    'الـ Rate Limiter يحظر الطلبات الزائدة بعد تخطي الحد الأقصى (Triggered Limit)',
    'الـ Rate Limiter لم يحظر الطلبات الزائدة'
  );

  // 4. اختبار مسارات الـ API الديناميكية على السيرفر المحلي
  console.log('\n--- 4. اختبار أمان الـ API الحي (Live API Security) ---');
  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    assert(
      healthRes.status === 200,
      'السيرفر المحلي يعمل بنجاح ومتاح على /api/health (HTTP 200)',
      `الكود المستلم: ${healthRes.status}`
    );

    const headers = healthRes.headers;
    assert(
      headers.get('x-frame-options') === 'DENY' && headers.get('x-content-type-options') === 'nosniff',
      'ترويسات الأمان الصارمة مفعلة على ردود الـ API (X-Frame-Options & nosniff)',
      'الترويسات غير موجودة في الرد'
    );

    // اختبار رفض المسارات المحمية بدون Bearer Token بـ 401
    const unauthRes = await fetch(`${API_BASE}/customers`);
    assert(
      unauthRes.status === 401,
      'رفض الوصول لمسار الزبائن المحمي بدون توكن بـ HTTP 401 Unauthorized',
      `الكود المستلم: ${unauthRes.status}`
    );

    // اختبار رفض التوكنات المزيفة أو غير الصالحة بـ 401
    const fakeTokenRes = await fetch(`${API_BASE}/customers`, {
      headers: { Authorization: 'Bearer this-is-a-fake-untrusted-token' }
    });
    assert(
      fakeTokenRes.status === 401,
      'رفض التوكنات المشوهة والمزيفة بـ HTTP 401',
      `الكود المستلم: ${fakeTokenRes.status}`
    );
  } catch (err: any) {
    console.warn('تنبيه: تأكد من تشغيل السيرفر المحلي على 5000 لاختبار المسارات الحية:', err.message);
  }

  console.log('\n============================================================');
  console.log(`📊 النتيجة النهائية: ${passed} اختبار ناجح ✅ | ${failed} اختبار فاشل ❌`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit();

