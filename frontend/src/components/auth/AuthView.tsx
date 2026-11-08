import React, { useState } from 'react';
import { Store as StoreIcon, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthService, AuthSession } from '@/lib/auth';
import { Store } from '@/lib/types';

export interface AuthViewProps {
  onSuccess: (session: AuthSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [category, setCategory] = useState<Store['category']>('supermarket');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setError('يرجى إدخال رقم هاتف المحل');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const session = await AuthService.login(loginPhone.trim(), loginPassword);
      onSuccess(session);
    } catch (err: any) {
      setError(err?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !regPhone.trim() || !ownerName.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const session = await AuthService.register({
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        phone: regPhone.trim(),
        password: regPassword || '123456',
        category,
        address: address.trim() || undefined
      });
      onSuccess(session);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إنشاء حساب المحل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/[0.08] blur-[100px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed bottom-10 left-10 w-72 h-72 bg-teal-600/[0.05] blur-[80px] pointer-events-none -z-10 rounded-full" />

      {/* Main Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-950/60 border border-emerald-400/30">
            <StoreIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>نوتة رقمية</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SaaS
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              الدفتر السحابي الآمن لإدارة ديون الزبائن والتحصيل بالواتساب
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-white/[0.08] mb-6 gap-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل دخول المحل
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إنشاء حساب محل جديد
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="رقم هاتف المحل *"
              placeholder="مثال: 01012345678"
              type="tel"
              dir="ltr"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="كلمة السر *"
              placeholder="••••••••"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-xl mt-2"
              isLoading={isLoading}
            >
              <span>دخول إلى لوحة تحكم المحل</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Form: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <Input
              label="اسم المحل أو النشاط التجاري *"
              placeholder="مثال: سوبر ماركت الفيروز"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="اسم صاحب المحل أو المسؤول *"
              placeholder="مثال: محمود عبد الفتاح"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="رقم الهاتف للتسجيل *"
                placeholder="010XXXXXXXX"
                dir="ltr"
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                required
              />

              <Input
                label="كلمة السر *"
                placeholder="••••••••"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="block text-xs font-medium text-slate-300">نوع النشاط</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl text-sm glass-input text-white bg-slate-900 border border-white/10"
              >
                <option value="supermarket">سوبر ماركت / بقالة</option>
                <option value="pharmacy">صيدلية</option>
                <option value="kiosk">كشك / مقلة</option>
                <option value="workshop">ورشة عمل / حرفي</option>
                <option value="other">نشاط تجاري آخر</option>
              </select>
            </div>

            <Input
              label="العنوان / المنطقة (اختياري)"
              placeholder="مثال: شارع السوق، المحلة"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-xl mt-2"
              isLoading={isLoading}
            >
              <span>إنشاء الحساب وبدء الاستخدام مجاناً</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
