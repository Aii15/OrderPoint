'use client';

import { useRouter } from 'next/navigation';
import { MenuItemForm } from '@/components/MenuItemForm';
import { MenuItemInput, createMenuItem } from '@/lib/api';

export default function NewMenuItemPage() {
  const router = useRouter();

  const handleSubmit = async (input: MenuItemInput) => {
    await createMenuItem(input);
    router.push(`/menu?success=${encodeURIComponent(`${input.name} ditambahkan.`)}`);
  };

  return (
    <MenuItemForm
      title="Tambah Menu Baru"
      onSubmit={handleSubmit}
      onCancel={() => router.push('/menu')}
    />
  );
}