import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'debt' | 'payment' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30',
      debt: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 border border-rose-500/30',
      payment: 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30',
      secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 shadow-sm',
      outline: 'bg-transparent hover:bg-white/[0.04] text-slate-300 border border-slate-700/80',
      ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300',
      whatsapp: 'bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-semibold shadow-lg shadow-emerald-950/30 border border-emerald-400/30'
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-xl gap-2 min-h-[42px]',
      lg: 'text-base px-5 py-3.5 rounded-xl gap-2.5 min-h-[50px] font-semibold',
      icon: 'w-10 h-10 p-0 rounded-xl'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

