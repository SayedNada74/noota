import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, MessageCircle, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  planPrice?: string;
  storeName?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planName = 'باقة السوبر ماركت PRO',
  planPrice = '450 ج.م / شهرياً',
  storeName = 'المحل'
}) => {
  const [copiedMethod, setCopiedMethod] = useState<'instapay' | 'vodafone' | null>(null);

  // بيانات حسابات التحصيل (يمكنك تعديلها بأرقامك الحقيقية)
  const instapayAccount = 'noota@instapay';
  const vodafoneNumber = '01012345678';
  const adminWhatsApp = '201012345678'; // رقم واتساب مالك المنصة لتلقي الإيصالات

  const handleCopy = (text: string, method: 'instapay' | 'vodafone') => {
    navigator.clipboard.writeText(text);
    setCopiedMethod(method);
    setTimeout(() => setCopiedMethod(null), 2500);
  };

  const confirmationMessage = `السلام عليكم، قمت بتحويل مبلغ الاشتراك (${planPrice}) لـ (${planName}) لصالح محل (${storeName}). مرفق صورة إيصال التحويل لتفعيل الحساب.`;
  const whatsappConfirmUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(confirmationMessage)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تفعيل اشتراك المحل"
      description="طرق الدفع الفوري والمحلي المتاحة في مصر"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Plan summary badge */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">الباقة المختارة:</span>
            <span className="font-bold text-sm text-white">{planName}</span>
          </div>
          <div className="text-left">
            <span className="text-base font-black text-emerald-400">{planPrice}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>اختر وسيلة الدفع المناسبة لك:</span>
          </h4>

          {/* 1. InstaPay */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                  ⚡
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">إنستاباي (InstaPay)</h5>
                  <p className="text-[10px] text-slate-400">تحويل لحظي من أي بنك في مصر بدون مصاريف</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(instapayAccount, 'instapay')}
                className="gap-1.5 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                {copiedMethod === 'instapay' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ العنوان</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-center text-xs text-purple-300 select-all font-bold">
              {instapayAccount}
            </div>
          </div>

          {/* 2. Vodafone Cash */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">فودافون كاش / محافظ المحمول</h5>
                  <p className="text-[10px] text-slate-400">تحويل مباشر من محفظتك الإلكترونية</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(vodafoneNumber, 'vodafone')}
                className="gap-1.5 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              >
                {copiedMethod === 'vodafone' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرقم</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-center text-xs text-rose-300 select-all font-bold tracking-wider">
              {vodafoneNumber}
            </div>
          </div>
        </div>

        {/* Step 2: Confirm via WhatsApp */}
        <div className="pt-2 border-t border-white/[0.08] space-y-3">
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            بعد إتمام التحويل، اضغط على الزر أدناه لإرسال لقطة الشاشة (الإيصال) واسم محلك عبر الواتساب ليتم تفعيل حسابك فوراً:
          </p>

          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full font-bold gap-2 shadow-xl shadow-emerald-950/50"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>إرسال إيصال التحويل وتفعيل الحساب</span>
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
};

