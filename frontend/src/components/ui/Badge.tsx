import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'debt' | 'payment' | 'clear' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className
}) => {
  const variants = {
    debt: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    payment: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    clear: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

