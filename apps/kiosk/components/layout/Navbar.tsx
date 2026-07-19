'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category, CATEGORIES } from '@/lib/menu-data';
import { useCartStore, getCartItemCount } from '@/hooks/useCartStore';

interface NavbarProps {
  activeCategory: Category;
  onNavigate: (category: Category) => void;
  disabled?: boolean;
}

export function Navbar({ activeCategory, onNavigate, disabled }: NavbarProps) {
  const cartCount = useCartStore((state) => getCartItemCount(state.lines));

  return (
    <header className="flex items-center justify-between px-16 py-8">
      <div className="flex items-center gap-2 font-serif text-2xl text-ink">
        <img src="/images/icons/logo.png" alt="" aria-hidden className="h-7 w-7" />
        <span>OrderPoint</span>
      </div>

      <nav className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-[8px_8px_18px_rgba(122,74,38,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)]">
        {CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(category)}
              className="relative rounded-full px-6 py-2.5 text-[15px] font-medium text-ink transition active:scale-[0.97] active:shadow-[inset_4px_4px_8px_rgba(122,74,38,0.35),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] disabled:pointer-events-none"
            >
              {isActive && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-[inset_4px_4px_8px_rgba(122,74,38,0.35),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </nav>

      <Link
        href="/cart"
        className="relative flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-ink shadow-[8px_8px_18px_rgba(122,74,38,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] transition active:scale-[0.97]"
      >
        <img src="/images/icons/cart.png" alt="" aria-hidden className="h-5 w-5" />
        Cart
        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-latte px-1 text-xs font-bold text-cream">
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}