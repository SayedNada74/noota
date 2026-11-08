import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserPlus } from 'lucide-react';

export interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    initialDebt?: number;
  }) => Promise<void>;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [initialDebt, setInitialDebt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى كتابة اسم الزبون');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        initialDebt: initialDebt ? parseFloat(initialDebt) : undefined
      });
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setInitialDebt('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إضافة الزبون');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة زبون جديد"
      description="سجل بيانات العميل للبدء في تتبع حسابه"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="اسم الزبون *"
          placeholder="مثال: أحمد عبد الله أو عم إبراهيم النجار"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <Input
          label="رقم الهاتف (اختياري - لتفعيل زر الواتساب)"
          placeholder="مثال: 01012345678"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="العنوان / المنطقة (اختياري)"
            placeholder="مثال: شارع الجمهورية"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="دين قديم سابق (اختياري)"
            placeholder="0.00"
            type="number"
            suffix="ج.م"
            value={initialDebt}
            onChange={(e) => setInitialDebt(e.target.value)}
          />
        </div>

        <Input
          label="ملاحظات (اختياري)"
          placeholder="أي تفاصيل إضافية لتذكر الزبون..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-xl"
            isLoading={isLoading}
          >
            <UserPlus className="w-5 h-5" />
            <span>حفظ الزبون في النوتة</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

