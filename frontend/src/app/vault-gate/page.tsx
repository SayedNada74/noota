'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Lock, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuperAdminView } from '@/components/features/SuperAdminView';
import { PlatformService } from '@/lib/api';
import { AuthService } from '@/lib/auth';
import { Store } from '@/lib/types';

// المفتاح السري الرئيسي للمنصة (يمكنك تغييره بحرية)
const MASTER_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'noota-gate-master-2026';

function VaultGateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inputKey, setInputKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);

  // فحص الكود من الرابط المباشر ?key=... أو من جلسة المتصفح
  useEffect(() => {
    const keyFromUrl = searchParams.get('key') || searchParams.get('secret');
    const storedAuth = typeof window !== 'undefined' ? sessionStorage.getItem('noota_vault_auth') : null;

    if (keyFromUrl === MASTER_SECRET_KEY || storedAuth === 'granted') {
      setIsAuthorized(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noota_vault_auth', 'granted');
      }
      setStores(PlatformService.getStores());
    }
  }, [searchParams]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim() === MASTER_SECRET_KEY) {
      setIsAuthorized(true);
      setError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noota_vault_auth', 'granted');
      }
      setStores(PlatformService.getStores());
    } else {
      setError('المفتاح السري غير صحيح! تم تسجيل المحاولة وتأمين النظام.');
      setInputKey('');
    }
  };

  const handleLockVault = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('noota_vault_auth');
    }
    setIsAuthorized(false);
    setInputKey('');
    router.push('/');
  };

  // في حالة كان مصرحاً له: تظهر لوحة تحكم المنصة المركزية
  if (isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080C14] text-slate-100 p-4 sm:p-6 selection:bg-cyan-500/30 selection:text-cyan-300">
        <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">بوابة المالك المشفرة (Admin Vault)</span>
              <span className="text-[10px] text-emerald-400 font-bold block">جلسة آمنة نشطة ✓</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLockVault}
            className="text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>قفل وتأمين البوابة</span>
          </Button>
        </div>

        <SuperAdminView
          stores={stores}
          onSelectStore={async (storeId) => {
            const st = stores.find((s) => s.id === storeId);
            if (st) {
              await AuthService.login(st.phone, '123456');
              router.push('/');
            }
          }}
          onRegisterStore={(data) => {
            PlatformService.registerNewStore(data);
            setStores(PlatformService.getStores());
          }}
          onToggleStoreStatus={(storeId) => {
            const target = stores.find((s) => s.id === storeId);
            if (target) {
              PlatformService.updateStore(storeId, { isActive: !target.isActive });
              setStores(PlatformService.getStores());
            }
          }}
        />
      </div>
    );
  }

  // في حالة غير مصرح له: تظهر شاشة التشفير الصارمة لطلب المفتاح السري
  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Red/Cyan Ambient */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/[0.05] blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/40">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-black text-white tracking-tight">
            بوابة الإدارة المركزية المشفرة
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            هذه المنطقة محمية ومخصصة حصرياً لمالك المنصة وتتطلب مفتاح أمان رئيسي للوصول.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 text-right">
          <Input
            label="أدخل المفتاح السري الرئيسي (Secret Master Key)"
            type="password"
            placeholder="••••••••••••••••"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            icon={<KeyRound className="w-4 h-4 text-cyan-400" />}
            required
            autoFocus
          />

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-xl shadow-cyan-950/50 bg-cyan-600 hover:bg-cyan-500 border-cyan-400/30"
          >
            <span>فك التشفير ودخول البوابة</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            ← العودة للموقع الرئيسي
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VaultGatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080C14]" />}>
      <VaultGateContent />
    </Suspense>
  );
}

