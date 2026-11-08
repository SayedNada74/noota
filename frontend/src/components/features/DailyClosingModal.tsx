import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { DailySummary } from '@/lib/types';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  CheckCircle2
} from 'lucide-react';

export interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DailySummary;
  storeName: string;
  storePhone?: string;
  currency?: string;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  onClose,
  summary,
  storeName,
  currency = 'ج.م'
}) => {
  if (!isOpen) return null;

  const dateFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // إنشاء نص التقرير للمشاركة بالواتساب
  const whatsappReport = `📊 *تقرير تقفيل اليومية - ${storeName}*
📅 التاريخ: ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━
💵 *إجمالي النقدية المحصلة (كاش الدرج):* ${summary.totalCollectedCash.toLocaleString('ar-EG')} ${currency}
📦 *إجمالي البضاعة بالآجل (ديون جديدة):* ${summary.totalDebtsGiven.toLocaleString('ar-EG')} ${currency}
🔢 *عدد العمليات المنفذة اليوم:* ${summary.transactions.length} حركة
━━━━━━━━━━━━━━━━━━━━
تم التقفيل والمطابقة بنجاح عبر منصة نوتة رقمية 📱`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappReport)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تقرير تقفيل اليومية والمطابقة المالية"
      description={`ملخص العمليات المالية لحركة اليوم - ${dateFormatted}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="إجمالي النقدية المحصلة (كاش)"
            value={summary.totalCollectedCash}
            currency={currency}
            variant="payment"
            subtitle={`${summary.paymentsCount} عمليات سداد تمت اليوم`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="إجمالي مبيعات الآجل (ديون)"
            value={summary.totalDebtsGiven}
            currency={currency}
            variant="debt"
            subtitle={`${summary.debtsCount} عمليات بيع على الحساب اليوم`}
            icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          />
        </div>

        {/* Detailed Transactions of the day */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>حركات اليوم المسجلة ({summary.transactions.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">مرتبة حسب وقت العملية</span>
          </div>

          {summary.transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-white/5">
              لم يتم تسجيل أي حركات ديون أو سداد خلال اليوم حتى الآن.
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
              {summary.transactions.map((tx) => {
                const isDebt = tx.type === 'DEBT';
                const timeFormatted = new Date(tx.createdAt).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isDebt
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {isDebt ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">
                          {isDebt ? 'بيع بالآجل' : 'سداد نقدية'}
                        </span>
                        {tx.note && <span className="text-slate-400 text-[11px]">{tx.note}</span>}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`font-black tabular-numbers text-sm ${
                          isDebt ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isDebt ? '+' : '-'} {tx.amount.toLocaleString('ar-EG')} {currency}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{timeFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              variant="whatsapp"
              size="md"
              className="gap-2 font-bold text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>إرسال تقرير اليومية عبر الواتساب</span>
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
};

