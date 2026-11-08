'use client';

import React from 'react';
import { Receipt, Plus, CalendarCheck, Sliders } from 'lucide-react';

interface MobileTaskbarProps {
  activeTab: 'ledger' | 'settings';
  onTabChange: (tab: 'ledger' | 'settings') => void;
  onOpenQuickTx: () => void;
  onOpenDailyClosing: () => void;
}

/**
 * شريط المهام السفلي للموبايل (The Mobile Taskbar - z-40):
 * يظهر فقط في الشاشات الصغيرة (sm:hidden) ليمنح التاجر وصولاً فورياً باللمس
 * لأهم العمليات الميدانية دون الحاجة للرجوع لأعلى الصفحة.
 */
export const MobileTaskbar: React.FC<MobileTaskbarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickTx,
  onOpenDailyClosing,
}) => {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 safe-area-pb"
      aria-label="شريط التنقل السريع للهواتف"
    >
      <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
        {/* زر الدفتر */}
        <button
          onClick={() => onTabChange('ledger')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'ledger'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">الدفتر</span>
        </button>

        {/* زر حركة سريعة (+ / -) */}
        <button
          onClick={onOpenQuickTx}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
        >
          <Plus className="w-5 h-5 mb-1 stroke-[2.5]" />
          <span className="text-[10px] font-black">حركة سريعة</span>
        </button>

        {/* زر تقفيل اليومية */}
        <button
          onClick={onOpenDailyClosing}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <CalendarCheck className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">اليومية</span>
        </button>

        {/* زر الإعدادات */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">الإعدادات</span>
        </button>
      </div>
    </nav>
  );
};

