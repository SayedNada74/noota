import React from 'react';

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] space-y-4 shimmer-wave">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-800/80 rounded" />
            <div className="h-3 w-20 bg-slate-800/50 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-800/80 rounded-full" />
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
        <div className="h-4 w-24 bg-slate-800/60 rounded" />
        <div className="h-8 w-20 bg-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}

