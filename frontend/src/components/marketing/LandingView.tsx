import React, { useState } from 'react';
import {
  Store,
  MessageCircle,
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Smartphone,
  Receipt,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/[0.07] blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-teal-600/[0.04] blur-[100px] pointer-events-none -z-10 rounded-full" />

      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
              نوتة رقمية
            </span>
            <span className="text-[10px] text-emerald-400 font-bold block">Noota Micro-SaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogin}
            className="text-xs sm:text-sm text-slate-300 hover:text-white"
          >
            تسجيل دخول المحل
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onGetStarted}
            className="text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40"
          >
            <span>ابدأ مجاناً</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>المنصة السحابية الأولى لإدارة ديون المحلات في مصر والوطن العربي</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
          وداعاً لكشكول الشكك وضياع الفلوس..{' '}
          <span className="bg-gradient-to-l from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            نوتة رقمية
          </span>{' '}
          تُنظم محلك وتحصل ديونك
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          تطبيق ويب متكامل يجمع حسابات زبائنك في ثوانٍ، يحسب الرصيد المتبقي تلقائياً، ويُرسل رسائل تذكير مهذبة عبر الواتساب بدون أي إحراج.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            className="font-black text-base px-8 py-3.5 rounded-2xl shadow-2xl shadow-emerald-600/30 hover:scale-105 transition-transform"
          >
            <span>سجل محلك وابدأ تجربة مجانية 14 يوماً</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onLogin}
            className="font-bold text-sm px-6 py-3.5 rounded-2xl"
          >
            <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            بدون الحاجة لبطاقة ائتمان
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            عزل أمني تام لبيانات كل محل
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            يعمل بسلاسة على كافة الهواتف (PWA)
          </span>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            لماذا يفضل أصحاب المحلات "نوتة رقمية" عن الدفتر الورقي؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            صُمم النظام ليلائم واقع المحلات السريعة وضغط الزبائن اليومي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">تسجيل الحركة في 5 ثوانٍ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              لا داعي لتعطيل الزبائن الواقفين. بحث فوري بمجرد كتابة أول حرفين، وأزرار مبالغ سريعة بنظام (+ دين / - سداد).
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">مطالبة لطيفة عبر الواتساب</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              وداعاً للإحراج عند طلب الفلوس. زر ديناميكي يفتح محادثة الزبون مباشرة بنص مهذب ومحترم جاهز بالمبلغ المطلوب.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">تقفيل اليومية ومطابقة الكاش</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              في نهاية كل يوم بضغطة زر تعرف كم دخل الدرج كاش، وكم بضاعة خرجت شكك، مع إمكانية إرسال التقرير لشريكك فوراً.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            استثمار بسيط يحمي مئات الآلاف من رأس مال محلك
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            خطط اشتراك مدروسة توفر عليك أضعاف قيمتها من أول أسبوع. ابدأ بـ 14 يوماً مجاناً بدون أي التزام مالي.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-900 rounded-2xl border border-white/10 gap-1 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الدفع الشهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>الدفع السنوي</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md">
                وفر شهرين مجاناً 🎁
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Plan 1: Kiosk & Small Shop */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                  للأكشاك والورش الصغيرة
                </span>
                <h3 className="text-xl font-black text-white mt-2">باقة المحل الصغير</h3>
                <p className="text-xs text-slate-400 mt-1">تتبع ديون زبائنك ومطالبتهم بالواتساب بكل سلاسة</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white tabular-numbers">
                  {billingCycle === 'monthly' ? '250' : '2,400'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ج.م / {billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {billingCycle === 'monthly' ? '≈ 8 جنيه في اليوم فقط!' : 'وفرت 600 جنيه مع الاشتراك السنوي'}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>عدد زبائن غير محدود</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>رسائل واتساب ديناميكية مفتوحة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>كشف حساب وتقفيل اليومية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>دعم فني عبر الواتساب</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={onGetStarted}
              className="w-full font-bold text-xs"
            >
              ابدأ 14 يوماً مجاناً
            </Button>
          </div>

          {/* Plan 2: Supermarket & Pharmacy PRO */}
          <div className="glass-card p-6 rounded-3xl border-2 border-emerald-500/50 bg-emerald-950/[0.12] space-y-5 relative flex flex-col justify-between shadow-2xl shadow-emerald-950/50">
            <div className="absolute -top-3 left-6">
              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-3 py-1 rounded-full shadow-lg">
                الأكثر طلباً واختياراً 🔥
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/15 px-2.5 py-1 rounded-lg">
                  للسوبر ماركت والصيدليات
                </span>
                <h3 className="text-xl font-black text-white mt-2">باقة السوبر ماركت PRO</h3>
                <p className="text-xs text-slate-400 mt-1">تحكم كامل، فريق عمل، وتقارير محاسبية متطورة</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 tabular-numbers">
                  {billingCycle === 'monthly' ? '450' : '4,200'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ج.م / {billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-medium">
                {billingCycle === 'monthly' ? '≈ 15 جنيه في اليوم (تمن شاي وسيجارة الكاشير)' : 'وفرت 1,200 جنيه مع السنوي'}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>كل ميزات باقة المحل الصغير</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إضافة موظفين وكاشيرات بصلاحيات مخصصة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تحديد الحد الائتماني لكل عميل مع تنبيهات فورية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>طباعة البون الحراري وفواتير 80mm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>نسخ احتياطي فوري على السحابة وتصدير Excel</span>
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={onGetStarted}
              className="w-full font-bold shadow-xl shadow-emerald-950/60"
            >
              ابدأ تجربتك المجانية 14 يوماً
            </Button>
          </div>

          {/* Plan 3: Multi-Branch & Enterprise */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-lg">
                  للفروع المتعددة والمخازن
                </span>
                <h3 className="text-xl font-black text-white mt-2">باقة الفروع Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">إدارة مركزية لعدة محلات ومخازن تحت مظلة واحدة</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white tabular-numbers">
                  {billingCycle === 'monthly' ? '850' : '7,900'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ج.م / {billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}
                </span>
              </div>
              <p className="text-[11px] text-purple-300 font-medium">
                {billingCycle === 'monthly' ? 'لإدارة حتى 3 فروع بنفس الحساب' : 'وفرت 2,300 جنيه مع السنوي'}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>كل ميزات باقة PRO المتقدمة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>لوحة تحكم موحدة لكافة فروعك</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تقارير مالية وتدفقات نقدية شاملة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>مدير حساب مخصص وتدريب لفريق العمل</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={onGetStarted}
              className="w-full font-bold text-xs"
            >
              تواصل معنا للاشتراك
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-white/[0.06] text-center space-y-2 text-xs text-slate-500">
        <p>&copy; 2026 منصة نوتة رقمية (Noota). جميع الحقوق محفوظة.</p>
        <p>نظام إدارة الديون والشكك للمحلات التجارية والسوبرماركت والصيدليات.</p>
      </footer>
    </div>
  );
};
