export interface MenuItem {
  id: string;
  category: Category;
  name: string;
  description: string;
  composition: string[];
  attributes: { label: string; value: string }[];
  meters: { label: string; value: number }[];
  servingDetails: string[];
  price: number;
  availability: string;
  imageAlt: string;
}

export type Category = 'Coffee' | 'Pastries' | 'Beverages' | 'Side Dishes';

// Tetap statis untuk sekarang — dipakai Navbar untuk urutan & label tab.
// Kalau nanti admin bisa menambah kategori baru lewat apps/admin, daftar ini
// perlu ikut diperbarui manual (di luar cakupan CRUD menu tahap ini).
export const CATEGORIES: Category[] = ['Coffee', 'Pastries', 'Beverages', 'Side Dishes'];

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

// Bentuk mentah yang dikembalikan apps/api (kolom attributes/meters adalah Json)
interface ApiMenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  composition: string[];
  attributes: { label: string; value: string }[];
  meters: { label: string; value: number }[];
  servingDetails: string[];
  price: number;
  availability: string;
  imageAlt: string;
}

function toMenuItem(raw: ApiMenuItem): MenuItem {
  return { ...raw, category: raw.category as Category };
}

// Dipanggil dari Server Component (page.tsx) — mengambil SELURUH menu sekali
// per request. revalidate 30s supaya perubahan dari apps/admin muncul cepat
// tanpa perlu redeploy, tapi tetap dapat manfaat caching Next.js.
export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu`, { next: { revalidate: 30 } });
  if (!response.ok) {
    throw new Error('Gagal mengambil data menu dari apps/api');
  }
  const raw: ApiMenuItem[] = await response.json();
  return raw.map(toMenuItem);
}

// --- Helper MURNI, beroperasi di atas list yang sudah di-fetch. Aman dipakai
// dari Client Component (MenuScreen.tsx) yang menerima `allItems` lewat props,
// jadi tidak perlu fetch ulang atau jadi async saat pindah item/kategori. ---

export function getItemsByCategoryFrom(items: MenuItem[], category: Category): MenuItem[] {
  return items.filter((item) => item.category === category);
}

export function getFeaturedItemByCategoryFrom(
  items: MenuItem[],
  category: Category,
): MenuItem | undefined {
  return getItemsByCategoryFrom(items, category)[0];
}

export function getItemFrom(
  items: MenuItem[],
  category: Category,
  itemId: string,
): MenuItem | undefined {
  return items.find((item) => item.category === category && item.id === itemId);
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}