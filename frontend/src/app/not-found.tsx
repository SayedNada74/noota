import React from 'react';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080C14] text-center">
      {/* Background ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-lg glass-modal rounded-3xl p-8 sm:p-10 border border-white/10 space-y-6 shadow-2xl">
        {/* Giant 404 with gradient clip */}
        <h1 className="text-8xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-tighter">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">الصفحة غير موجودة</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            الصفحة أو الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله. تأكد من صحة العنوان المطلوب.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:brightness-110 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>فتح الدفتر</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

