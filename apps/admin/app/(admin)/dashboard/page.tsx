'use client';

import { useEffect, useState } from 'react';
import {
  Order,
  STATUS_LABEL,
  fetchActiveOrders,
  fetchCompletedToday,
  fetchFailedOrders,
} from '@/lib/api';

interface DashboardData {
  active: Order[];
  completedToday: Order[];
  failed: Order[];
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[8px_8px_18px_rgba(122,74,38,0.15),-8px_-8px_18px_rgba(255,255,255,0.9)]">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-2 font-serif text-4xl ${accent ?? 'text-ink'}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [active, completedToday, failed] = await Promise.all([
          fetchActiveOrders(),
          fetchCompletedToday(),
          fetchFailedOrders(),
        ]);
        if (!cancelled) {
          setData({ active, completedToday, failed });
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Tidak bisa terhubung ke apps/api. Pastikan servernya jalan.');
      }
    }

    load();
    const interval = setInterval(load, 10000); // refresh tiap 10 detik
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <main className="p-10">
        <p className="rounded-2xl bg-red-50 px-6 py-4 text-[15px] font-medium text-red-600">
          {error}
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-10">
        <p className="text-ink/50">Memuat data...</p>
      </main>
    );
  }

  const revenueToday = data.completedToday
    .filter((order) => order.orderStatus === 'COMPLETED')
    .reduce((total, order) => total + order.total, 0);

  const statusCounts: Record<string, number> = {};
  for (const order of data.active) {
    statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] ?? 0) + 1;
  }

  return (
    <main className="p-10">
      <h1 className="mb-8 font-serif text-3xl text-ink">Dashboard</h1>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Omzet Hari Ini"
          value={`Rp ${new Intl.NumberFormat('id-ID').format(revenueToday)}`}
          accent="text-latte"
        />
        <StatCard label="Pesanan Aktif" value={data.active.length} />
        <StatCard label="Selesai Hari Ini" value={data.completedToday.length} />
        <StatCard label="Gagal Bayar" value={data.failed.length} />
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-[8px_8px_18px_rgba(122,74,38,0.15),-8px_-8px_18px_rgba(255,255,255,0.9)]">
        <h2 className="mb-6 font-serif text-xl text-ink">Pesanan Aktif per Status</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(['NEW', 'IN_PROGRESS', 'READY'] as const).map((status) => (
            <div key={status} className="rounded-2xl bg-cream/60 px-5 py-4">
              <p className="text-sm font-semibold text-ink/60">{STATUS_LABEL[status]}</p>
              <p className="mt-1 font-serif text-2xl text-ink">{statusCounts[status] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}