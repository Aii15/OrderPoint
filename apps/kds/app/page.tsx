'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Order,
  fetchActiveOrders,
  updateOrderStatus,
  parseOrderItems,
} from '@/lib/api';
import { playNotifySound } from '@/lib/useNotifySound';

const POLL_INTERVAL_MS = 4000;
const FLASH_DURATION_MS = 6000;
const MUTE_STORAGE_KEY = 'orderpoint-kds-muted';

function getElapsedSeconds(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getUrgency(totalSeconds: number): 'ok' | 'warn' | 'critical' {
  if (totalSeconds >= 600) return 'critical';
  if (totalSeconds >= 300) return 'warn';
  return 'ok';
}

const URGENCY_STYLE = {
  ok: { border: 'border-l-emerald-500', text: 'text-emerald-400', glow: '' },
  warn: { border: 'border-l-amber-500', text: 'text-amber-400', glow: '' },
  critical: { border: 'border-l-red-500', text: 'text-red-400', glow: 'animate-pulse' },
} as const;

function TicketCard({
  order,
  actionLabel,
  actionColor,
  isNew,
  onAction,
}: {
  order: Order;
  actionLabel: string;
  actionColor: 'amber' | 'cyan';
  isNew: boolean;
  onAction: () => void;
}) {
  const [elapsed, setElapsed] = useState(() => getElapsedSeconds(order.createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(order.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const urgency = getUrgency(elapsed);
  const style = URGENCY_STYLE[urgency];

  return (
    <div
      className={`border-l-4 bg-zinc-900 transition-shadow duration-700 ${style.border} ${
        urgency === 'critical' ? 'ring-1 ring-red-500/30' : ''
      } ${isNew ? 'ring-2 ring-amber-400/70 shadow-[0_0_24px_rgba(245,158,11,0.35)]' : ''}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <span className="flex items-center gap-2 font-mono text-3xl font-bold tracking-tight text-white">
          {order.queueNumber}
          {isNew && (
            <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-zinc-950">
              BARU
            </span>
          )}
        </span>
        <span className={`font-mono text-2xl font-bold tabular-nums ${style.text} ${style.glow}`}>
          {formatTimer(elapsed)}
        </span>
      </div>

      <div className="px-5 py-2 text-xs uppercase tracking-widest text-zinc-500">
        {order.customerName}
      </div>

      <div className="space-y-1 px-5 pb-4">
        {parseOrderItems(order).map((item, i) => (
          <div
            key={i}
            className="flex items-baseline gap-3 border-b border-zinc-800/60 py-2 last:border-0"
          >
            <span className="font-mono text-lg font-bold text-white">{item.quantity}×</span>
            <span className="text-[15px] text-zinc-300">{item.name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onAction}
        className={`w-full py-4 text-sm font-bold uppercase tracking-widest text-zinc-950 transition active:brightness-90 active:scale-[0.98] ${
          actionColor === 'amber' ? 'bg-amber-500' : 'bg-cyan-400'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function KdsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const [clock, setClock] = useState('');
  const [muted, setMuted] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const mutedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(MUTE_STORAGE_KEY);
    if (saved === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMuted(true);
      mutedRef.current = true;
    }
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const loadOrders = async () => {
    try {
      const data = await fetchActiveOrders();
      setConnectionError(false);

      if (!isFirstLoadRef.current) {
        const newOnes = data.filter((o) => !knownIdsRef.current.has(o.id));

        if (newOnes.length > 0) {
          if (!mutedRef.current) playNotifySound();

          setFlashIds((prev) => {
            const next = new Set(prev);
            newOnes.forEach((o) => next.add(o.id));
            return next;
          });

          newOnes.forEach((o) => {
            setTimeout(() => {
              setFlashIds((prev) => {
                const next = new Set(prev);
                next.delete(o.id);
                return next;
              });
            }, FLASH_DURATION_MS);
          });
        }
      }
      isFirstLoadRef.current = false;
      knownIdsRef.current = new Set(data.map((o) => o.id));

      setOrders(data);
    } catch {
      setConnectionError(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    const interval = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvance = async (order: Order, next: 'IN_PROGRESS' | 'READY') => {
    try {
      await updateOrderStatus(order.id, next);
      setFlashIds((prev) => {
        const copy = new Set(prev);
        copy.delete(order.id);
        return copy;
      });
      await loadOrders();
    } catch {
      // biarkan; polling berikutnya akan sinkron ulang
    }
  };

  const newOrders = orders.filter((o) => o.orderStatus === 'NEW');
  const inProgressOrders = orders.filter((o) => o.orderStatus === 'IN_PROGRESS');

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      <header className="relative z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="font-mono text-xl font-bold uppercase tracking-widest text-white">
            OrderPoint · Dapur
          </span>
        </div>

        <span className="font-mono text-3xl font-bold tabular-nums text-zinc-400">{clock}</span>

        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-zinc-500">
            NEW <span className="text-amber-400">{newOrders.length}</span>
          </span>
          <span className="text-zinc-500">
            PREP <span className="text-cyan-400">{inProgressOrders.length}</span>
          </span>

          <button
            onClick={toggleMute}
            className={`rounded border px-3 py-1.5 transition ${
              muted
                ? 'border-zinc-700 text-zinc-600'
                : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
            title={muted ? 'Bunyi dimatikan' : 'Bunyi aktif'}
          >
            {muted ? '🔇 MUTE' : '🔊 SUARA'}
          </button>

          <span
            className={`flex items-center gap-2 rounded border px-3 py-1.5 ${
              connectionError ? 'border-red-500/40 text-red-400' : 'border-zinc-700 text-zinc-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectionError ? 'animate-pulse bg-red-500' : 'bg-emerald-500'
              }`}
            />
            {connectionError ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 divide-x divide-zinc-800 lg:grid-cols-2">
        <section className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 bg-amber-500" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Pesanan Baru
            </h2>
          </div>
          {newOrders.length === 0 ? (
            <div className="border border-dashed border-zinc-800 py-16 text-center font-mono text-sm uppercase tracking-widest text-zinc-700">
              Kosong
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {newOrders.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  actionLabel="Mulai Siapkan"
                  actionColor="amber"
                  isNew={flashIds.has(order.id)}
                  onAction={() => handleAdvance(order, 'IN_PROGRESS')}
                />
              ))}
            </div>
          )}
        </section>

        <section className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 bg-cyan-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Sedang Disiapkan
            </h2>
          </div>
          {inProgressOrders.length === 0 ? (
            <div className="border border-dashed border-zinc-800 py-16 text-center font-mono text-sm uppercase tracking-widest text-zinc-700">
              Kosong
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {inProgressOrders.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  actionLabel="Siap Diambil"
                  actionColor="cyan"
                  isNew={flashIds.has(order.id)}
                  onAction={() => handleAdvance(order, 'READY')}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}