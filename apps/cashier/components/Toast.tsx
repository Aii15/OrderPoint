'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  variant: 'success' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, variant, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-8 left-1/2 z-[70] -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-full px-6 py-4 text-[15px] font-medium shadow-[8px_8px_18px_rgba(122,74,38,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] ${
          variant === 'success' ? 'bg-white text-ink' : 'bg-red-50 text-red-600'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${variant === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        />
        {message}
      </div>
    </div>
  );
}