import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080C14]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl animate-pulse pointer-events-none" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white tracking-wide">نوتة رقمية</h3>
          <p className="text-xs text-slate-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    </div>
  );
}

