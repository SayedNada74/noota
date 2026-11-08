'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WhatsAppAction } from './WhatsAppAction';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  User,
  FileText,
  Printer,
  Receipt,
  QrCode,
  Store as StoreIcon,
  Phone
} from 'lucide-react';

export interface LedgerTransaction {
  id: string;
  type: 'DEBT' | 'PAYMENT';
  amount: number;
  balanceAfter: number;
  note?: string | null;
  createdAt: string;
  createdBy?: { name: string } | null;
}

export interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    currentBalance: number;
    creditLimit?: number | null;
    address?: string | null;
  } | null;
  transactions: LedgerTransaction[];
  storeName?: string;
  storePhone?: string;
  instapayHandle?: string | null;
  vodafoneCash?: string | null;
}

export const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  isOpen,
  onClose,
  customer,
  transactions,
  storeName = 'المحل',
  storePhone,
  instapayHandle,
  vodafoneCash
}) => {
  const [viewMode, setViewMode] = useState<'detailed' | 'receipt'>('detailed');

  if (!customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`كشف حساب: ${customer.name}`}
      description="سجل الحركات التاريخية ومتابعة الديون والسداد"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* View Mode Toggle Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3 no-print">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'detailed'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كشف الحساب المفصل</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('receipt')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'receipt'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>إيصال حراري (80mm)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs border-white/10 text-slate-300 hover:text-white"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>طباعة فورية</span>
            </Button>

            {customer.phone && customer.currentBalance > 0 && (
              <WhatsAppAction
                phone={customer.phone}
                customerName={customer.name}
                balance={customer.currentBalance}
                storeName={storeName}
                instapayHandle={instapayHandle}
                vodafoneCash={vodafoneCash}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: DETAILED TIMELINE                                      */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'detailed' && (
          <div className="space-y-4">
            {/* Customer Summary Card */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 border border-white/10">
              <div>
                <span className="text-xs text-slate-400 block mb-1">الرصيد المتبقي حالياً:</span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl sm:text-3xl font-black tabular-numbers ${
                      customer.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {customer.currentBalance.toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs font-bold text-slate-400">ج.م</span>
                </div>
                {customer.creditLimit && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    الحد الائتماني المسموح به:{' '}
                    <span className="font-bold text-slate-300">
                      {customer.creditLimit.toLocaleString('ar-EG')} ج.م
                    </span>
                  </p>
                )}
              </div>

              {customer.phone && (
                <div className="text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span dir="ltr" className="font-mono">{customer.phone}</span>
                </div>
              )}
            </div>

            {/* Transactions Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>سجل العمليات ({transactions.length})</span>
              </h4>

              {transactions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-white/5">
                  لا توجد أي حركات مسجلة لهذا الزبون حتى الآن.
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                  {transactions.map((tx) => {
                    const isDebt = tx.type === 'DEBT';
                    const dateFormatted = new Date(tx.createdAt).toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isDebt
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isDebt ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">
                                {isDebt ? 'أخذ بضاعة (دين)' : 'سدد دفعة (نقدية)'}
                              </span>
                              <span
                                className={`font-black tabular-numbers ${
                                  isDebt ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {isDebt ? '+' : '-'} {tx.amount.toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                            {tx.note && (
                              <p className="text-slate-400 text-[11px]">{tx.note}</p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {dateFormatted}
                              </span>
                              {tx.createdBy && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {tx.createdBy.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-[10px] text-slate-500 block">الرصيد بعدها</span>
                          <span className="font-semibold text-slate-300 tabular-numbers">
                            {tx.balanceAfter.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: 80mm THERMAL RECEIPT SLIP                              */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'receipt' && (
          <div className="flex flex-col items-center">
            {/* Thermal Slip Container (Simulated 80mm roll) */}
            <div className="w-full max-w-[340px] bg-white text-black p-5 rounded-2xl font-mono text-xs shadow-2xl space-y-3 border border-slate-300 relative print:shadow-none print:border-none print:w-full">
              {/* Slip Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-black/40">
                <h3 className="font-black text-base tracking-tight font-sans">{storeName}</h3>
                {storePhone && (
                  <p className="text-[11px] text-neutral-600 font-sans">هاتف: {storePhone}</p>
                )}
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 border border-black font-bold text-[10px] rounded">
                    إيصال كشف حساب عميل
                  </span>
                </div>
              </div>

              {/* Customer & Timestamp Info */}
              <div className="text-[11px] space-y-1 font-sans">
                <div className="flex justify-between">
                  <span className="text-neutral-600">العميل:</span>
                  <span className="font-bold">{customer.name}</span>
                </div>
                {customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">رقم الهاتف:</span>
                    <span dir="ltr">{customer.phone}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>التاريخ:</span>
                  <span>{currentDateFormatted}</span>
                </div>
              </div>

              {/* Dotted Divider */}
              <div className="border-t border-dashed border-black/40 my-2" />

              {/* Transactions List */}
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between font-bold text-[10px] text-neutral-600 pb-1 border-b border-black/20">
                  <span>البيان / الحركة</span>
                  <span>المبلغ</span>
                </div>

                {transactions.slice(0, 10).map((tx, idx) => (
                  <div key={tx.id || idx} className="flex justify-between items-center text-[11px]">
                    <span className="truncate max-w-[170px]">
                      {tx.type === 'DEBT' ? '[+] أخذ بضاعة' : '[-] سداد نقدي'}{' '}
                      {tx.note ? `(${tx.note})` : ''}
                    </span>
                    <span className="font-bold tabular-numbers">
                      {tx.type === 'DEBT' ? '+' : '-'} {tx.amount.toLocaleString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Balance Box */}
              <div className="border-t-2 border-black pt-2 mt-2 space-y-1 text-center font-sans">
                <div className="text-[11px] font-bold text-neutral-700">إجمالي الحساب المتبقي</div>
                <div className="text-2xl font-black tabular-numbers">
                  {customer.currentBalance.toLocaleString('ar-EG')} ج.م
                </div>
              </div>

              {/* Digital Payment Info (InstaPay & Cash) */}
              {(instapayHandle || vodafoneCash) && (
                <div className="border-t border-dashed border-black/40 pt-2 text-[10px] text-center space-y-1 font-sans text-neutral-700">
                  {instapayHandle && (
                    <div>💳 إنستاباي: <span className="font-mono font-bold" dir="ltr">{instapayHandle}</span></div>
                  )}
                  {vodafoneCash && (
                    <div>📱 محفظة كاش: <span className="font-mono font-bold" dir="ltr">{vodafoneCash}</span></div>
                  )}
                </div>
              )}

              {/* Slip Footer */}
              <div className="border-t border-dashed border-black/40 pt-2 text-center text-[10px] text-neutral-500 font-sans space-y-0.5">
                <p>شكراً لتعاملكم معنا ونسعد بخدمتكم دائماً</p>
                <p className="text-[9px] opacity-75">نظام نوتة رقمية - Noota.app</p>
              </div>
            </div>

            {/* Print Slip Action */}
            <div className="pt-4 no-print">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrint}
                className="gap-2 shadow-xl"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة هذا الإيصال فوراً (80mm)</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
