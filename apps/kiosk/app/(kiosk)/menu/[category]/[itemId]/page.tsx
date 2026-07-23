import { notFound } from 'next/navigation';
import { MenuScreen } from '@/components/menu/MenuScreen';
import { Category, CATEGORIES, fetchAllMenuItems, getItemFrom } from '@/lib/menu-data';

interface PageProps {
  params: Promise<{ category: string; itemId: string }>;
}

export default async function MenuItemPage({ params }: PageProps) {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category) as Category;

  if (!CATEGORIES.includes(category)) {
    notFound();
  }

  const allItems = await fetchAllMenuItems();
  const item = getItemFrom(allItems, category, resolvedParams.itemId);

  if (!item) {
    notFound();
  }

  return <MenuScreen initialCategory={category} initialItem={item} allItems={allItems} />;
}