'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * مكون النافذة المنبثقة (Modal) الملتزم بمعيار الـ Stacking Context Trap:
 * يتم تصديره عبر React Portal مباشرة إلى document.body مع z-[99999]
 * لمنع انحصاره داخل أي حاوية Transform أو Framer Motion واختفائه تحت شريط الموبايل.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  const [mounted, setMounted] = useState(false);

  // حماية من أخطاء الـ SSR والـ Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // غلق المودال بزر Escape وقفل التمرير بالخلفية
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const modalJSX = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full glass-modal rounded-3xl p-5 sm:p-6 border border-white/10 z-10 my-auto shadow-2xl transition-all animate-in zoom-in-95 duration-200',
          maxWidths[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-slate-400">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95 cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};
