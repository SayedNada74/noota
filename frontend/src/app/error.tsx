'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught an exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080C14]">
      {/* Background ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[100px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 border border-rose-500/20 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/50">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            نعتذر، واجه النظام مشكلة مؤقتة أثناء معالجة طلبك. لا تقلق، بياناتك مسجلة ومحفوظة بأمان.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-500 pt-1">
              رمز المعرف: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full gap-2 justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </Button>

          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full gap-2 justify-center border-white/10 text-slate-300 hover:text-white"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

