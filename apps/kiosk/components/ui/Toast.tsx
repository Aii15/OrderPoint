'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 z-50 flex justify-center">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-full bg-latte px-6 py-3 text-[15px] font-semibold text-cream shadow-[6px_6px_16px_rgba(122,74,38,0.35)]"
          >
            <img src="/images/icons/cart.png" alt="" aria-hidden className="h-5 w-5" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}