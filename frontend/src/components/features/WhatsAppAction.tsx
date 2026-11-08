import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface WhatsAppActionProps {
  phone?: string | null;
  customerName: string;
  balance: number;
  currency?: string;
  storeName?: string;
  customTemplate?: string | null;
  instapayHandle?: string | null;
  vodafoneCash?: string | null;
  size?: 'sm' | 'md' | 'icon';
  className?: string;
}

export const WhatsAppAction: React.FC<WhatsAppActionProps> = ({
  phone,
  customerName,
  balance,
  currency = 'ج.م',
  storeName = 'المحل',
  customTemplate,
  instapayHandle,
  vodafoneCash,
  size = 'sm',
  className
}) => {
  if (!phone || balance <= 0) return null;

  // تنظيف رقم الهاتف وإضافة كود الدولة لمصر (+20)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '2' + cleanPhone;
  }

  // صياغة الرسالة المهذبة مع دعم روابط إنستاباي والمحافظ الذكية
  let message = customTemplate
    ? customTemplate
        .replace('{customer_name}', customerName)
        .replace('{balance}', balance.toLocaleString('ar-EG'))
        .replace('{currency}', currency)
        .replace('{store_name}', storeName)
        .replace(
          '{instapay_link}',
          instapayHandle
            ? `\n💳 لسداد الحساب فوراً عبر إنستاباي: https://ipn.eg/S/${instapayHandle.replace('@instapay', '')}`
            : ''
        )
        .replace(
          '{vodafone_cash}',
          vodafoneCash ? `\n📱 أو كاش عبر الرقم: ${vodafoneCash}` : ''
        )
    : `السلام عليكم أستاذ ${customerName}، تذكير ودي من (${storeName}) بخصوص حساب متبقي قدره ${balance.toLocaleString('ar-EG')} ${currency}.${
        instapayHandle
          ? `\n💳 يمكنك السداد المباشر عبر إنستاباي: https://ipn.eg/S/${instapayHandle.replace('@instapay', '')}`
          : ''
      }${vodafoneCash ? `\n📱 أو عبر محفظة كاش: ${vodafoneCash}` : ''}\nشكراً جزيلاً لتعاملك معنا.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="whatsapp"
        size={size}
        className={className}
        title="إرسال تذكير سداد لطيف عبر الواتساب مع رابط إنستاباي"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        {size !== 'icon' && <span>تذكير واتساب</span>}
      </Button>
    </a>
  );
};
