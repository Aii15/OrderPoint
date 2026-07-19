'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/hooks/useCartStore';

const MAX_NAME_LENGTH = 40;

const pageEnterVariants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CustomerNameScreen() {
  const router = useRouter();
  const customerName = useCartStore((state) => state.customerName);
  const setCustomerName = useCartStore((state) => state.setCustomerName);

  const [name, setName] = useState(customerName);

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2;

  const handleContinue = () => {
    if (!isValid) return;
    setCustomerName(trimmedName);
    router.push('/checkout');
  };

  return (
    <motion.main
      variants={pageEnterVariants}
      initial="initial"
      animate="animate"
      className="flex min-h-screen flex-col bg-cream"
    >
      <header className="flex items-center justify-between px-16 py-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-ink shadow-[8px_8px_18px_rgba(122,74,38,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] transition active:scale-[0.97]"
        >
          <img src="/images/icons/arrow-left.png" alt="" aria-hidden className="h-4 w-4" />
          Kembali
        </Link>

        <div className="flex items-center gap-2 font-serif text-2xl text-ink">
          <img src="/images/icons/logo.png" alt="" aria-hidden className="h-7 w-7" />
          <span>OrderPoint</span>
        </div>

        <div className="w-[104px]" aria-hidden />
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-16 pb-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Satu langkah lagi
        </p>
        <h1 className="mb-4 text-center font-serif text-5xl text-ink">Atas Nama Siapa?</h1>
        <p className="mb-12 text-center text-ink/60">
          Nama ini akan dipanggil saat pesanan Anda siap diambil.
        </p>

        <div className="w-full rounded-[3rem] border border-latte/10 bg-white/50 p-10 shadow-sm">
          <label htmlFor="customer-name" className="mb-3 block text-sm font-semibold text-ink/60">
            Nama Lengkap
          </label>
          <input
            id="customer-name"
            type="text"
            inputMode="text"
            autoFocus
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleContinue();
            }}
            placeholder="mis. Budi Santoso"
            className="w-full rounded-2xl bg-white px-6 py-5 text-center font-serif text-3xl text-ink shadow-[inset_3px_3px_6px_rgba(122,74,38,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] outline-none placeholder:text-ink/30"
          />
          <p className="mt-3 text-right text-xs text-ink/40">
            {name.length}/{MAX_NAME_LENGTH}
          </p>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!isValid}
            className="mt-8 w-full rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </motion.main>
  );
}