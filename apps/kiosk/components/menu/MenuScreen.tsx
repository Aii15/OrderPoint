'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ProductDetail } from '@/components/menu/ProductDetail';
import { Toast } from '@/components/ui/Toast';
import { Category, MenuItem, getFeaturedItemByCategory, getItemsByCategory } from '@/lib/menu-data';
import { useCartStore } from '@/hooks/useCartStore';

interface MenuScreenProps {
  initialCategory: Category;
  initialItem: MenuItem;
}

// "Sink" transition: the outgoing section drops down, shrinks, and fades out.
// The incoming section then rises up from the same depth to settle into place.
const sinkVariants = {
  initial: { opacity: 0, y: 56, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 64,
    scale: 0.92,
    transition: { duration: 0.3, ease: [0.6, 0, 0.8, 0.2] },
  },
};

export function MenuScreen({ initialCategory, initialItem }: MenuScreenProps) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [item, setItem] = useState<MenuItem>(initialItem);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNavigate = (nextCategory: Category) => {
    if (nextCategory === category || isTransitioning) return;
    setIsTransitioning(true);
    setCategory(nextCategory);
    setItem(getFeaturedItemByCategory(nextCategory));
  };

  const addItem = useCartStore((state) => state.addItem);

  const handleOrder = () => {
    addItem(item);
    setToastMessage(`${item.name} ditambahkan ke keranjang`);
    window.setTimeout(() => setToastMessage(null), 2000);
  };

  const itemsInCategory = getItemsByCategory(category);
  const currentIndex = itemsInCategory.findIndex((candidate) => candidate.id === item.id);

  const handlePrev = () => {
    if (itemsInCategory.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    const prevIndex = (currentIndex - 1 + itemsInCategory.length) % itemsInCategory.length;
    setItem(itemsInCategory[prevIndex]);
  };

  const handleNext = () => {
    if (itemsInCategory.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (currentIndex + 1) % itemsInCategory.length;
    setItem(itemsInCategory[nextIndex]);
  };

  return (
    <main className="min-h-screen bg-cream">
      <Toast message={toastMessage} />
      <Navbar activeCategory={category} onNavigate={handleNavigate} disabled={isTransitioning} />

      <AnimatePresence mode="wait" onExitComplete={() => setIsTransitioning(false)}>
        <motion.div
          key={`${category}-${item.id}`}
          variants={sinkVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ProductDetail
            item={item}
            onPrev={handlePrev}
            onNext={handleNext}
            onOrder={handleOrder}
            imageSize={340}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}