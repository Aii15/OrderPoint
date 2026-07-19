'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatIDR } from '@/lib/menu-data';
import { useCartStore, getCartSubtotal } from '@/hooks/useCartStore';

const TAX_RATE = 0.1;

const pageEnterVariants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CartScreen() {
  const lines = useCartStore((state) => state.lines);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = getCartSubtotal(lines);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return (
    <motion.main
      variants={pageEnterVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-cream"
    >
      <header className="flex items-center justify-between px-16 py-8">
        <Link
          href="/menu/Coffee/cappuccino"
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

      <div className="px-16 pb-24">
        <h1 className="mb-12 font-serif text-6xl text-ink">Keranjang Belanja</h1>

        {lines.length === 0 ? (
          <div className="rounded-[3rem] bg-white/60 p-16 text-center">
            <p className="text-lg text-ink/70">Keranjang Anda masih kosong.</p>
            <Link
              href="/menu/Coffee/cappuccino"
              className="mt-6 inline-block rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <div className="space-y-6 rounded-[3rem] border border-latte/10 bg-white/50 p-6 shadow-sm lg:col-span-2 md:p-12">
              {lines.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-8 rounded-[2rem] bg-white/70 p-6 md:flex-row"
                >
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-cream/60 p-2">
                    <img
                      src={`/images/${item.id}.png`}
                      alt={item.imageAlt}
                      className="h-full w-full rounded-full object-cover shadow-lg"
                    />
                  </div>

                  <div className="flex w-full flex-grow flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-serif text-3xl leading-tight text-ink">{item.name}</h3>
                      <ul className="mt-2 space-y-1 text-sm text-ink/70">
                        {item.servingDetails.slice(0, 2).map((line) => (
                          <li key={line} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-latte/60" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex w-full flex-row items-center justify-between gap-4 md:w-auto md:flex-col md:items-end">
                      <div className="whitespace-nowrap text-base font-semibold text-ink">
                        IDR {formatIDR(item.price)}
                      </div>
                      <div className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-[inset_3px_3px_6px_rgba(122,74,38,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.6)]">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.id)}
                          aria-label={`Kurangi ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-latte transition hover:bg-latte/10 active:scale-90"
                        >
                          −
                        </button>
                        <span className="w-4 text-center font-semibold text-ink">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementItem(item.id)}
                          aria-label={`Tambah ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-latte transition hover:bg-latte/10 active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Hapus ${item.name} dari keranjang`}
                    className="shrink-0 text-sm text-ink/40 underline transition hover:text-ink/70"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky top-8 rounded-[3rem] border border-latte/10 bg-white/50 p-8 shadow-sm lg:col-span-1">
              <h2 className="mb-8 font-serif text-4xl text-ink">Ringkasan</h2>

              <div className="mb-8 space-y-4 border-b border-latte/10 pb-8">
                <div className="flex items-center justify-between text-ink/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">IDR {formatIDR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-ink/70">
                  <span>Pajak (10%)</span>
                  <span className="font-semibold text-ink">IDR {formatIDR(tax)}</span>
                </div>
              </div>

              <div className="mb-10 flex items-end justify-between">
                <span className="text-ink/70">Total</span>
                <span className="font-serif text-3xl font-bold text-latte">IDR {formatIDR(total)}</span>
              </div>

              <Link
                href="/checkout/name"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-latte px-6 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
              >
                <img src="/images/icons/cart2.png" alt="" aria-hidden className="h-5 w-5" />
                Lanjutkan ke Pembayaran
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
}