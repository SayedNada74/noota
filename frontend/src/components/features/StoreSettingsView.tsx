'use client';

import React, { useState } from 'react';
import { Store } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Store as StoreIcon,
  MessageCircle,
  Users,
  Download,
  CreditCard,
  Save,
  CheckCircle,
  Sparkles,
  Smartphone,
  ShieldCheck,
  FileSpreadsheet,
  QrCode,
  Zap
} from 'lucide-react';

export interface StoreSettingsViewProps {
  store: Store;
  onUpdateStore: (updated: Partial<Store>) => void;
  customersCount: number;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  store,
  onUpdateStore,
  customersCount
}) => {
  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone);
  const [address, setAddress] = useState(store.address || '');
  const [currency, setCurrency] = useState(store.currency);
  const [category, setCategory] = useState(store.category);
  const [whatsappTemplate, setWhatsappTemplate] = useState(store.whatsappTemplate);
  const [instapayHandle, setInstapayHandle] = useState(store.instapayHandle || '');
  const [vodafoneCash, setVodafoneCash] = useState(store.vodafoneCash || '');

  const [isSaved, setIsSaved] = useState(false);

  // Variable chips for WhatsApp builder
  const templateVariables = [
    { tag: '{customer_name}', label: 'اسم الزبون' },
    { tag: '{balance}', label: 'المبلغ المتبقي' },
    { tag: '{currency}', label: 'العملة' },
    { tag: '{store_name}', label: 'اسم المحل' },
    { tag: '{instapay_link}', label: '⚡ رابط إنستاباي' },
    { tag: '{vodafone_cash}', label: '📱 محفظة كاش' }
  ];

  const handleInsertTag = (tag: string) => {
    setWhatsappTemplate((prev) => `${prev} ${tag}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore({
      name,
      phone,
      address,
      currency,
      category,
      whatsappTemplate,
      instapayHandle: instapayHandle.trim() || null,
      vodafoneCash: vodafoneCash.trim() || null
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Preview message rendered
  const samplePreviewMessage = whatsappTemplate
    .replace('{customer_name}', 'أحمد محمد')
    .replace('{balance}', '350')
    .replace('{currency}', currency)
    .replace('{store_name}', name || 'المحل')
    .replace(
      '{instapay_link}',
      instapayHandle
        ? `\n💳 لسداد الحساب فوراً عبر إنستاباي: https://ipn.eg/S/${instapayHandle.replace('@instapay', '')}`
        : ''
    )
    .replace(
      '{vodafone_cash}',
      vodafoneCash ? `\n📱 أو كاش عبر الرقم: ${vodafoneCash}` : ''
    );

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify({ store, exportedAt: new Date().toISOString() }, null, 2)
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `noota_backup_${store.name}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Banner / Store Plan */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">{store.name}</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {store.plan === 'PRO'
                  ? 'خطة المحترفين PRO'
                  : store.plan === 'ENTERPRISE'
                  ? 'خطة المؤسسات'
                  : 'باقة تجريبية مجانية'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              معرف المحل المخصص: <span className="font-mono text-slate-300">{store.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="text-xs gap-1.5 border-white/10 text-slate-300 hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نسخة احتياطية (JSON)</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Information */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <StoreIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">بيانات ونشاط المحل</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم المحل أو النشاط التجاري *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سوبر ماركت الأمانة"
              required
            />

            <Input
              label="رقم الهاتف المسجل للمحل *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              placeholder="01012345678"
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">نوع النشاط</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-white bg-slate-900 border border-white/10"
              >
                <option value="supermarket" className="bg-slate-900">سوبر ماركت / بقالة</option>
                <option value="pharmacy" className="bg-slate-900">صيدلية</option>
                <option value="kiosk" className="bg-slate-900">كشك / مقلة / محطة</option>
                <option value="workshop" className="bg-slate-900">ورشة / مهن حرة</option>
                <option value="other" className="bg-slate-900">نشاط تجاري آخر</option>
              </select>
            </div>

            <Input
              label="العملة الافتراضية"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="ج.م"
            />

            <div className="sm:col-span-2">
              <Input
                label="العنوان الجغرافي للمحل (اختياري)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: شارع السوق، بجوار البنك الأهلي"
              />
            </div>
          </div>
        </div>

        {/* Section 2: InstaPay & Vodafone Cash Digital Payment Setup */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white">بيانات التحصيل الإلكتروني السريع (إنستاباي وكاش)</h3>
              <p className="text-[11px] text-slate-400">تسهل على الزبائن السداد الفوري عبر الهاتف لزيادة سرعة التحصيل</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="حساب إنستاباي للدفع المباشر (InstaPay Handle)"
              value={instapayHandle}
              onChange={(e) => setInstapayHandle(e.target.value)}
              dir="ltr"
              placeholder="مثال: store_name@instapay"
            />

            <Input
              label="رقم محفظة فودافون كاش أو المحافظ الذكية"
              value={vodafoneCash}
              onChange={(e) => setVodafoneCash(e.target.value)}
              dir="ltr"
              placeholder="مثال: 01012345678"
            />
          </div>
        </div>

        {/* Section 3: WhatsApp Dynamic Template Builder */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <div>
                <h3 className="font-bold text-sm text-white">قالب رسالة المطالبة عبر الواتساب</h3>
                <p className="text-[11px] text-slate-400">
                  خصص نص الرسالة التلقائية التي تصل للزبون عند الضغط على زر الواتساب
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              العناصر الديناميكية (اضغط لإدراج المتغير في الرسالة):
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {templateVariables.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95 transition-transform cursor-pointer font-bold"
                >
                  {v.label} <span className="opacity-70 font-mono text-[10px]">{v.tag}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              className="w-full p-4 rounded-2xl glass-input text-white border border-white/10 text-sm leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
              placeholder="اكتب رسالة التذكير اللبقة هنا..."
            />
          </div>

          {/* Live Mobile Simulator Preview */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>معاينة حية لشكل الرسالة كما تظهر للزبون في واتساب:</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0B141A] border border-white/5 space-y-1 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed relative">
              <div className="inline-block p-3 rounded-2xl rounded-tr-none bg-[#005C4B] text-white shadow max-w-[90%] whitespace-pre-wrap">
                {samplePreviewMessage}
                <div className="text-[10px] text-emerald-200/60 text-left pt-1 font-mono">
                  10:30 ص ✓✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>تم حفظ كافة التعديلات بنجاح!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              يتم حفظ وتطبيق التعديلات على الفور.
            </span>
          )}

          <Button type="submit" variant="primary" size="md" className="gap-2 px-6">
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
