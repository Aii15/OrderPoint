'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MenuItemForm } from '@/components/MenuItemForm';
import { MenuItem, MenuItemInput, fetchMenuItem, updateMenuItem } from '@/lib/api';

export default function EditMenuItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItem(params.id)
      .then(setItem)
      .catch(() => setError('Menu item tidak ditemukan.'));
  }, [params.id]);

  const handleSubmit = async (input: MenuItemInput) => {
    // params.id = id LAMA (dari URL) — dipakai untuk cari row-nya.
    // input.id = id yang ada di form, bisa sama atau sudah diganti admin.
    await updateMenuItem(params.id, input);
    router.push(`/menu?success=${encodeURIComponent(`${input.name} diperbarui.`)}`);
  };

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-10">
        <button
          onClick={() => router.push('/menu')}
          className="mb-6 text-sm font-semibold text-latte"
        >
          &larr; Kembali ke Menu
        </button>
        <p className="rounded-2xl bg-red-50 px-6 py-4 text-[15px] font-medium text-red-600">
          {error}
        </p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-4xl p-10">
        <p className="text-ink/50">Memuat data...</p>
      </main>
    );
  }

  return (
    <MenuItemForm
      title={`Edit ${item.name}`}
      initial={item}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/menu')}
    />
  );
}