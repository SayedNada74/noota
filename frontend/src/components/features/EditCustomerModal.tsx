import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Customer } from '@/lib/types';
import { Edit3, Trash2 } from 'lucide-react';

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (id: string, updates: Partial<Customer>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
      setCreditLimit(customer.creditLimit ? customer.creditLimit.toString() : '');
      setError('');
    }
  }, [customer, isOpen]);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الزبون');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onSave(customer.id, {
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث بيانات الزبون');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (customer.currentBalance > 0) {
      setError('لا يمكن حذف زبون عليه ديون متبقية لم يسددها بعد!');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الزبون (${customer.name}) من الدفتر نهائياً؟`)) {
      try {
        setIsDeleting(true);
        await onDelete(customer.id);
        onClose();
      } catch (err: any) {
        setError(err?.message || 'فشل حذف الزبون');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل بيانات: ${customer.name}`}
      description="تحديث رقم الهاتف، العنوان، أو الحد الائتماني"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="اسم الزبون *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="رقم الهاتف (لتفعيل زر الواتساب)"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010XXXXXXXX"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="العنوان / المنطقة"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="مثال: شارع السوق"
          />

          <Input
            label="الحد الائتماني المسموح به"
            type="number"
            suffix="ج.م"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            placeholder="مثال: 500"
          />
        </div>

        <Input
          label="ملاحظات خاصة بالزبون"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أي تفاصيل تود تذكرها..."
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الزبون</span>
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="gap-2 font-bold flex-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>حفظ التعديلات</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

