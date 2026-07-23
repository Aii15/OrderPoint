'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MenuItem, deleteMenuItem, fetchMenuItems } from '@/lib/api';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast } from '@/components/Toast';

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  async function reload() {
    try {
      const data = await fetchMenuItems();
      setItems(data);
      setError(null);
    } catch {
      setError('Tidak bisa terhubung ke apps/api. Pastikan servernya jalan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Baca pesan sukses dari ?success=... (dikirim dari halaman /menu/baru atau
  // /menu/[id]/edit setelah redirect balik ke sini), lalu bersihkan URL-nya.
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setToast({ message: success, variant: 'success' });
      router.replace('/menu');
    }
  }, [searchParams, router]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMenuItem(deleteTarget.id);
      setToast({ message: `${deleteTarget.name} dihapus.`, variant: 'success' });
      await reload();
    } catch {
      setToast({ message: 'Gagal menghapus menu item.', variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <main className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Menu</h1>
        <Link
          href="/menu/baru"
          className="rounded-full bg-latte px-6 py-3 text-[15px] font-semibold text-cream transition active:scale-95"
        >
          + Tambah Menu
        </Link>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 px-6 py-4 text-[15px] font-medium text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-ink/50">Memuat data...</p>
      ) : (
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[8px_8px_18px_rgba(122,74,38,0.15),-8px_-8px_18px_rgba(255,255,255,0.9)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-latte/10 text-ink/50">
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Ketersediaan</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-latte/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-ink">{item.name}</td>
                  <td className="px-6 py-4 text-ink/70">{item.category}</td>
                  <td className="px-6 py-4 text-ink/70">
                    Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                  </td>
                  <td className="px-6 py-4 text-ink/70">{item.availability}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/menu/${item.id}/edit`}
                      className="mr-2 rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-500"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-ink/40">
                    Belum ada menu item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Hapus ${deleteTarget.name}?`}
          message="Menu ini akan langsung hilang dari apps/kiosk. Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Hapus"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
      )}
    </main>
  );
}