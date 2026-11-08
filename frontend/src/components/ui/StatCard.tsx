import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  currency?: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'debt' | 'payment' | 'info';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  currency = 'ج.م',
  subtitle,
  icon,
  variant = 'info',
  className
}) => {
  const variantStyles = {
    debt: {
      borderGlow: 'border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
      valueColor: 'text-rose-400'
    },
    payment: {
      borderGlow: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      valueColor: 'text-emerald-400'
    },
    info: {
      borderGlow: 'border-cyan-500/25 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
      valueColor: 'text-slate-100'
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group',
        style.borderGlow,
        className
      )}
    >
      {/* Subtle background glow */}
      <div className="absolute -top-12 -left-12 w-28 h-28 bg-white/[0.02] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.05] transition-all" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-400">{title}</span>
        <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105', style.iconBg)}>
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-2xl sm:text-3xl font-extrabold tabular-numbers tracking-tight', style.valueColor)}>
            {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
          </span>
          {currency && (
            <span className="text-xs font-semibold text-slate-400">{currency}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-normal flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

