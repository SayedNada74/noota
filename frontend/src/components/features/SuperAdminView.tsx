import React, { useState } from 'react';
import { Store } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldAlert,
  Building2,
  DollarSign,
  Users,
  CheckCircle2,
  Plus,
  ExternalLink,
  Power,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export interface SuperAdminViewProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
  onRegisterStore: (data: {
    name: string;
    category: Store['category'];
    phone: string;
    address?: string;
  }) => void;
  onToggleStoreStatus: (storeId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  stores,
  onSelectStore,
  onRegisterStore,
  onToggleStoreStatus
}) => {
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Store['category']>('supermarket');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.isActive).length;
  const proStores = stores.filter((s) => s.plan === 'PRO').length;
  const enterpriseStores = stores.filter((s) => s.plan === 'ENTERPRISE').length;
  const starterStores = stores.filter((s) => s.plan === 'TRIAL' || !s.plan).length;
  const estimatedRevenue = proStores * 450 + enterpriseStores * 850 + starterStores * 250;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onRegisterStore({
      name: name.trim(),
      category,
      phone: phone.trim(),
      address: address.trim() || undefined
    });

    setName('');
    setPhone('');
    setAddress('');
    setIsAddStoreOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Platform Owner Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">إدارة منصة نوتة المركزية (Super Admin)</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SaaS Owner Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              لوحة التحكم الشاملة لمتابعة كافة المحلات المشتركة، الاشتراكات الشهرية، وإحصائيات المنصة ككل
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddStoreOpen(true)}
          className="gap-2 font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محل جديد للمنصة</span>
        </Button>
      </div>

      {/* Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي المحلات المشتركة"
          value={totalStores}
          currency="محل"
          variant="info"
          subtitle={`${activeStores} محلات نشطة وتعمل الآن`}
          icon={<Building2 className="w-5 h-5 text-cyan-400" />}
        />
        <StatCard
          title="الدخل الشهري المتوقع (MRR)"
          value={estimatedRevenue}
          currency="ج.م / شهرياً"
          variant="payment"
          subtitle="من اشتراكات باقات PRO و Enterprise"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="نسبة تشغيل المنصة"
          value="99.9%"
          currency=""
          variant="info"
          subtitle="عزل أمني تام لقواعد بيانات كل تاجر"
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      {/* Stores Directory Table / Grid */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span>دليل المحلات والعملاء بالمنصة ({stores.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            يمكنك الدخول كصاحب أي محل للتحكم في بياناته بضغطة زر
          </span>
        </div>

        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between flex-wrap gap-4 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm">
                  {store.category === 'pharmacy' ? '💊' : store.category === 'kiosk' ? '🏪' : '🛒'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{store.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      store.plan === 'PRO'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : store.plan === 'ENTERPRISE'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {store.plan}
                    </span>
                    {!store.isActive && (
                      <span className="text-[10px] bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-md">
                        معلق
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                    <span dir="ltr" className="font-mono text-slate-300">{store.phone}</span>
                    {store.address && <span>&bull; {store.address}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleStoreStatus(store.id)}
                  className="gap-1.5 text-xs"
                >
                  <Power className={`w-3.5 h-3.5 ${store.isActive ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span>{store.isActive ? 'نشط' : 'تفعيل'}</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectStore(store.id)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح لوحة المحل</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Store Modal */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="تسجيل محل تجاري جديد في المنصة"
        description="أنشئ حساباً لمحل جديد مع بيئة بيانات معزولة تماماً"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم المحل أو النشاط التجاري *"
            placeholder="مثال: سوبر ماركت الفيروز"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="رقم هاتف المحل لتسجيل الدخول *"
            placeholder="01012345678"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">نوع النشاط</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-white bg-slate-900 border border-white/10"
            >
              <option value="supermarket">سوبر ماركت / بقالة</option>
              <option value="pharmacy">صيدلية</option>
              <option value="kiosk">كشك / مقلة</option>
              <option value="workshop">ورشة عمل / حرفي</option>
              <option value="other">نشاط آخر</option>
            </select>
          </div>

          <Input
            label="العنوان (اختياري)"
            placeholder="مثال: شارع الجلاء، طنطا"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              <span>إنشاء وتفعيل المحل فوراً</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

