'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Calculator, Equal } from 'lucide-react';
import { evaluateMathExpression } from '@/lib/utils';

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string | null;
  currentBalance: number;
}

export interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerOption[];
  preselectedCustomerId?: string | null;
  initialType?: 'DEBT' | 'PAYMENT';
  onSubmit: (data: {
    customerId: string;
    type: 'DEBT' | 'PAYMENT';
    amount: number;
    note?: string;
  }) => Promise<void>;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  customers,
  preselectedCustomerId,
  initialType = 'DEBT',
  onSubmit
}) => {
  const [type, setType] = useState<'DEBT' | 'PAYMENT'>(initialType);
  const [customerId, setCustomerId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setCustomerId(preselectedCustomerId || (customers[0]?.id ?? ''));
      setAmount('');
      setNote('');
      setError('');
    }
  }, [isOpen, initialType, preselectedCustomerId, customers]);

  // حساب المعادلة الرياضية الفورية المكتوبة في الخانة (مثال: 25+40+15)
  const computedMath = useMemo(() => {
    if (!amount || !/[+\-*/]/.test(amount)) return null;
    return evaluateMathExpression(amount);
  }, [amount]);

  const quickAmounts = [20, 50, 100, 200, 500];

  const handleAddQuickAmount = (val: number) => {
    if (!amount.trim()) {
      setAmount(val.toString());
      return;
    }
    // إذا كان التاجر يكتب معادلة، أضف الرقم إلى المعادلة الحالية
    if (/[+\-*/]/.test(amount)) {
      setAmount(`${amount.trim()} + ${val}`);
    } else {
      const current = parseFloat(amount) || 0;
      setAmount((current + val).toString());
    }
  };

  const handleApplyComputed = () => {
    if (computedMath !== null) {
      setAmount(computedMath.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // إذا كانت هناك عملية حسابية مكتوبة يتم اعتماد ناتجها النهائي تلقائياً
    const numericAmount = computedMath !== null ? computedMath : (parseFloat(amount) || 0);

    if (!numericAmount || numericAmount <= 0) {
      setError('يرجى كتابة مبلغ صحيح أكبر من صفر');
      return;
    }

    if (!customerId) {
      setError('يرجى اختيار الزبون');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        customerId,
        type,
        amount: numericAmount,
        note: note.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ الحركة');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل حركة سريعة"
      description="أدخل تفاصيل الدين أو السداد في ثوانٍ معدودة"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-white/[0.08] gap-1">
          <button
            type="button"
            onClick={() => setType('DEBT')}
            className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'DEBT'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>عليه (دين جديد)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('PAYMENT')}
            className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'PAYMENT'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>سدد (دفعة نقدية)</span>
          </button>
        </div>

        {/* Customer Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">اختر الزبون</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-white bg-slate-900 border border-white/10 focus:border-emerald-500 focus:outline-none"
          >
            <option value="" disabled>-- اختر من قائمة الزبائن --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} {c.phone ? `(${c.phone})` : ''} - [الحساب: {c.currentBalance} ج.م]
              </option>
            ))}
          </select>
          {selectedCustomer && (
            <p className="text-[11px] text-slate-400 pt-1">
              الرصيد الحالي للزبون:{' '}
              <span className={`font-bold ${selectedCustomer.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedCustomer.currentBalance.toLocaleString('ar-EG')} ج.م
              </span>
            </p>
          )}
        </div>

        {/* Amount Input with Quick Math Evaluator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-300">المبلغ المطلوب</label>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              <span>تقبل العمليات الحسابية (مثل: 25+40+15)</span>
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder="0.00 أو 25+40"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="w-full text-center text-2xl sm:text-3xl font-extrabold py-3 px-4 rounded-2xl glass-input tracking-wider text-white border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              ج.م
            </span>
          </div>

          {/* شريط نتيجة الآلة الحاسبة الفورية */}
          {computedMath !== null && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs animate-in fade-in duration-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Equal className="w-4 h-4 text-emerald-400" />
                <span>المجموع المحسوب:</span>
              </span>
              <button
                type="button"
                onClick={handleApplyComputed}
                className="font-bold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer text-xs transition-all active:scale-95 shadow-md flex items-center gap-1"
                title="اضغط لاعتماد المجموع في الخانة"
              >
                <span>{computedMath.toLocaleString('ar-EG')} ج.م</span>
                <span className="text-[10px] opacity-75">(تثبيت)</span>
              </button>
            </div>
          )}

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 justify-center">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddQuickAmount(val)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 active:scale-95 transition-transform cursor-pointer"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        {/* Notes (Optional) */}
        <Input
          label="بيان أو ملاحظات (اختياري)"
          placeholder="مثال: علبتين لبن وسكر، أو دفعة من الحساب القديم"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant={type === 'DEBT' ? 'debt' : 'payment'}
            size="lg"
            className="w-full font-bold text-base shadow-xl"
            isLoading={isLoading}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{type === 'DEBT' ? 'تأكيد تسجيل الدين' : 'تأكيد تسجيل السداد'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
