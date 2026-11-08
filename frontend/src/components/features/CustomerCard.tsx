import React from 'react';
import { Phone, Clock, Plus, Minus, ChevronLeft, AlertTriangle, CalendarX2 } from 'lucide-react';
import { WhatsAppAction } from './WhatsAppAction';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface CustomerCardProps {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  currentBalance: number;
  creditLimit?: number | null;
  currency?: string;
  storeName?: string;
  instapayHandle?: string | null;
  vodafoneCash?: string | null;
  daysSinceLastActivity?: number; // عدد الأيام منذ آخر حركة (رادار الديون الراكدة)
  onAddDebt: (customerId: string) => void;
  onAddPayment: (customerId: string) => void;
  onViewHistory: (customerId: string) => void;
  onEdit?: (customerId: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  id,
  name,
  phone,
  address,
  notes,
  currentBalance,
  creditLimit,
  currency = 'ج.م',
  storeName,
  instapayHandle,
  vodafoneCash,
  daysSinceLastActivity,
  onAddDebt,
  onAddPayment,
  onViewHistory,
  onEdit
}) => {
  const isDebtor = currentBalance > 0;
  const isSettled = currentBalance === 0;

  // فحص الحد الائتماني
  const hasLimit = creditLimit && creditLimit > 0;
  const isExceeded = hasLimit && currentBalance >= creditLimit;
  const isNearLimit = hasLimit && !isExceeded && currentBalance >= creditLimit * 0.8;

  // فحص الديون المتأخرة (+30 يوماً بدون سداد)
  const isStaleDebt = isDebtor && typeof daysSinceLastActivity === 'number' && daysSinceLastActivity >= 30;

  return (
    <div
      onClick={() => onViewHistory(id)}
      className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer border transition-all group ${
        isExceeded
          ? 'border-rose-500/40 bg-rose-950/[0.08] hover:border-rose-500/60'
          : isStaleDebt
          ? 'border-amber-500/30 bg-amber-950/[0.05] hover:border-amber-500/50'
          : 'border-white/[0.07] hover:border-white/20'
      }`}
    >
      <div>
        {/* Top Header: Name and Balance Status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 flex-wrap">
              <span>{name}</span>
            </h3>
            {phone && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 tabular-numbers">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span dir="ltr">{phone}</span>
              </p>
            )}
            {address && (
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {address}
              </p>
            )}
          </div>

          {/* Balance Badge */}
          <div className="text-left shrink-0">
            {isDebtor ? (
              <Badge variant="debt" size="md">
                عليه: {currentBalance.toLocaleString('ar-EG')} {currency}
              </Badge>
            ) : isSettled ? (
              <Badge variant="clear" size="md">
                خالص (0 {currency})
              </Badge>
            ) : (
              <Badge variant="payment" size="md">
                له: {Math.abs(currentBalance).toLocaleString('ar-EG')} {currency}
              </Badge>
            )}
          </div>
        </div>

        {/* Stale Debt Aging Warning */}
        {isStaleDebt && (
          <div className="mb-2 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <CalendarX2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>دين راكد: متأخر منذ أكثر من {daysSinceLastActivity} يوماً بدون سداد</span>
          </div>
        )}

        {/* Credit Limit Alert Badge */}
        {isExceeded && (
          <div className="mb-2.5 p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>تنبيه: تجاوز الحد الائتماني المسموح به ({creditLimit?.toLocaleString('ar-EG')} {currency})</span>
          </div>
        )}

        {isNearLimit && !isExceeded && (
          <div className="mb-2.5 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>قارب على الحد الائتماني ({creditLimit?.toLocaleString('ar-EG')} {currency})</span>
          </div>
        )}

        {notes && (
          <p className="text-xs text-slate-400 bg-white/[0.02] p-2 rounded-xl mb-3 border border-white/5 line-clamp-1">
            {notes}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div
        className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {/* History Link */}
        <button
          onClick={() => onViewHistory(id)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors py-1 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>كشف الحساب والوصل</span>
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Buttons Group */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp Reminder with InstaPay Support */}
          {phone && isDebtor && (
            <WhatsAppAction
              phone={phone}
              customerName={name}
              balance={currentBalance}
              currency={currency}
              storeName={storeName}
              instapayHandle={instapayHandle}
              vodafoneCash={vodafoneCash}
              size="sm"
            />
          )}

          {/* Quick Payment Button */}
          <Button
            variant="payment"
            size="sm"
            onClick={() => onAddPayment(id)}
            title="تسجيل سداد دفعة"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>سدد</span>
          </Button>

          {/* Quick Debt Button */}
          <Button
            variant="debt"
            size="sm"
            onClick={() => onAddDebt(id)}
            title="تسجيل أخذ بضاعة على الحساب"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>دين</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
