'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatIDR } from '@/lib/menu-data';
import { useCartStore, getCartSubtotal } from '@/hooks/useCartStore';

const TAX_RATE = 0.1;
const POLL_INTERVAL_MS = 3000;

type PaymentStatus = 'creating' | 'pending' | 'success' | 'expired' | 'error';

interface ChargeResult {
  orderId: string;
  queueNumber: string;
  qrUrl: string | null;
  expiryTime: string | null;
}

const pageEnterVariants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CheckoutScreen() {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const customerName = useCartStore((state) => state.customerName);
  const clearCart = useCartStore((state) => state.clearCart);
  const setLastOrder = useCartStore((state) => state.setLastOrder);

  const [initialCartEmpty] = useState(() => lines.length === 0);
  const [initialCustomerName] = useState(() => customerName);
  const [checkoutItems] = useState(() =>
    lines.map((line) => ({
      name: line.item.name,
      quantity: line.quantity,
      price: line.item.price,
    })),
  );
  const [checkoutSubtotal] = useState(() => getCartSubtotal(lines));
  const [checkoutTax] = useState(() => Math.round(getCartSubtotal(lines) * TAX_RATE));
  const [checkoutTotal] = useState(() => checkoutSubtotal + checkoutTax);

  const [status, setStatus] = useState<PaymentStatus>('creating');
  const [charge, setCharge] = useState<ChargeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCreatedRef = useRef(false);

  const needsName = !initialCartEmpty && initialCustomerName.trim().length === 0;

  const createTransaction = async () => {
    setStatus('creating');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: initialCustomerName,
          items: checkoutItems,
          subtotal: checkoutSubtotal,
          tax: checkoutTax,
          total: checkoutTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error ?? 'Gagal membuat transaksi QRIS');
        return;
      }

      setCharge({
        orderId: data.orderId,
        queueNumber: data.queueNumber,
        qrUrl: data.qrUrl,
        expiryTime: data.expiryTime,
      });
      setStatus('pending');
    } catch {
      setStatus('error');
      setErrorMessage('Tidak dapat terhubung ke server pembayaran');
    }
  };

  // Kalau nama belum diisi, kembalikan ke halaman input nama
  useEffect(() => {
    if (needsName) {
      router.replace('/checkout/name');
    }
  }, [needsName, router]);

  useEffect(() => {
    if (initialCartEmpty || needsName || hasCreatedRef.current) return;
    hasCreatedRef.current = true;
    createTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCartEmpty, needsName]);

  useEffect(() => {
    if (status !== 'pending' || !charge) return;

    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/checkout/status?orderId=${charge.orderId}`);
        const data = await response.json();

        if (!response.ok) return;

        if (data.transactionStatus === 'settlement' || data.transactionStatus === 'capture') {
          setStatus('success');
          setLastOrder({
            queueNumber: charge.queueNumber,
            customerName: initialCustomerName,
            total: checkoutTotal,
            orderId: charge.orderId,
          });
          clearCart();
          router.push('/checkout/confirmation');
        } else if (
          data.transactionStatus === 'expire' ||
          data.transactionStatus === 'cancel' ||
          data.transactionStatus === 'deny'
        ) {
          setStatus('expired');
        }
      } catch {
        // biarkan polling lanjut, satu request gagal tidak menghentikan proses
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, charge, clearCart, setLastOrder, initialCustomerName, checkoutTotal, router]);

  useEffect(() => {
    if (status !== 'pending' || !charge?.expiryTime) return;

    const expiryMs = new Date(charge.expiryTime.replace(' ', 'T')).getTime();

    countdownRef.current = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        setStatus('expired');
      }
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, charge]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleRetry = () => {
    setCharge(null);
    setSecondsLeft(null);
    createTransaction();
  };

  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null;
  const seconds = secondsLeft !== null ? secondsLeft % 60 : null;
  const countdownLabel =
    minutes !== null && seconds !== null
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : null;

  if (needsName) {
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
      className="min-h-screen bg-cream"
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

      <div className="mx-auto max-w-xl px-16 pb-24">
        <h1 className="mb-12 text-center font-serif text-6xl text-ink">Pembayaran</h1>

        {initialCartEmpty ? (
          <div className="rounded-[3rem] bg-white/60 p-16 text-center">
            <p className="text-lg text-ink/70">Keranjang Anda kosong, tidak ada yang bisa dibayar.</p>
            <Link
              href="/menu/Coffee/cappuccino"
              className="mt-6 inline-block rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="rounded-[3rem] border border-latte/10 bg-white/50 p-10 text-center shadow-sm">
            {status === 'creating' && (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-latte/20 border-t-latte" />
                <p className="text-ink/70">Menyiapkan kode QRIS...</p>
              </div>
            )}

            {status === 'pending' && charge && (
              <div className="flex flex-col items-center gap-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                  Scan QRIS untuk membayar
                </p>

                <div className="rounded-[2rem] bg-white p-6 shadow-[inset_3px_3px_6px_rgba(122,74,38,0.1)]">
                  {charge.qrUrl ? (
                    <img
                      src={charge.qrUrl}
                      alt="Kode QRIS pembayaran"
                      className="h-64 w-64 object-contain"
                    />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center text-sm text-ink/50">
                      QR tidak tersedia
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-serif text-4xl text-latte">IDR {formatIDR(checkoutTotal)}</p>
                  <p className="mt-1 text-xs text-ink/50">Order ID: {charge.orderId}</p>
                  <p className="text-xs text-ink/50">Atas nama: {initialCustomerName}</p>
                </div>

                {countdownLabel && (
                  <p className="text-sm text-ink/60">
                    Kode berlaku selama <span className="font-semibold text-ink">{countdownLabel}</span>
                  </p>
                )}

                <p className="flex items-center gap-2 text-sm text-ink/50">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-latte" />
                  Menunggu pembayaran...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-latte/20 border-t-latte" />
                <p className="text-ink/70">Pembayaran berhasil, menyiapkan struk...</p>
              </div>
            )}

            {status === 'expired' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <h2 className="font-serif text-3xl text-ink">Kode QRIS Kedaluwarsa</h2>
                <p className="text-ink/70">Silakan buat kode pembayaran baru.</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
                >
                  Buat Ulang Kode QRIS
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <h2 className="font-serif text-3xl text-ink">Terjadi Kesalahan</h2>
                <p className="text-ink/70">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.main>
  );
}