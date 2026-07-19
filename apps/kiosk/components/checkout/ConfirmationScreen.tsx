'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatIDR } from '@/lib/menu-data';
import { useCartStore } from '@/hooks/useCartStore';

const IDLE_TIMEOUT_SECONDS = 15;
const HOME_PATH = '/menu/Coffee/cappuccino';

const pageEnterVariants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ConfirmationScreen() {
  const router = useRouter();
  const lastOrder = useCartStore((state) => state.lastOrder);

  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIMEOUT_SECONDS);

  // Kalau halaman ini diakses langsung tanpa ada pesanan (mis. refresh setelah lama), balik ke menu
  useEffect(() => {
    if (!lastOrder) {
      router.replace(HOME_PATH);
    }
  }, [lastOrder, router]);

  // Tick: hanya mengurangi angka, tidak melakukan navigasi di sini
  useEffect(() => {
    if (!lastOrder || secondsLeft <= 0) return;

    const timeout = setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [lastOrder, secondsLeft]);

  // Navigasi: efek terpisah yang bereaksi begitu angka mencapai 0
  useEffect(() => {
    if (!lastOrder) return;
    if (secondsLeft <= 0) {
      router.push(HOME_PATH);
    }
  }, [lastOrder, secondsLeft, router]);

  if (!lastOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-ink/50">Mengalihkan...</p>
      </main>
    );
  }

  return (
    <motion.main
      variants={pageEnterVariants}
      initial="initial"
      animate="animate"
      className="flex min-h-screen flex-col bg-cream"
    >
      <header className="flex items-center justify-center px-16 py-8">
        <div className="flex items-center gap-2 font-serif text-2xl text-ink">
          <img src="/images/icons/logo.png" alt="" aria-hidden className="h-7 w-7" />
          <span>OrderPoint</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-16 pb-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-latte text-3xl text-cream">
          ✓
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Nomor Antrian Anda
        </p>
        <h1 className="mt-2 font-serif text-8xl text-ink">{lastOrder.queueNumber}</h1>

        <p className="mt-6 text-lg text-ink/70">
          Atas nama <span className="font-semibold text-ink">{lastOrder.customerName}</span>
        </p>

        <div className="mt-8 w-full rounded-[3rem] border border-latte/10 bg-white/50 p-8">
          <p className="font-serif text-3xl text-latte">IDR {formatIDR(lastOrder.total)}</p>
          <p className="mt-1 text-xs text-ink/50">Dibayar via QRIS · Order ID: {lastOrder.orderId}</p>
          <p className="mt-6 text-ink/70">
            Pesanan Anda sedang diproses dapur. Mohon tunggu di area pengambilan, nomor antrian
            Anda akan dipanggil.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(HOME_PATH)}
          className="mt-10 rounded-full bg-latte px-10 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
        >
          Pesan Baru Sekarang
        </button>

        <p className="mt-4 text-sm text-ink/40">
          Kembali otomatis ke menu dalam {secondsLeft} detik
        </p>
      </div>
    </motion.main>
  );
}