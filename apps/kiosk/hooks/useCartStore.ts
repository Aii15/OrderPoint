import { create } from 'zustand';
import { MenuItem } from '@/lib/menu-data';

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface LastOrder {
  queueNumber: string;
  customerName: string;
  total: number;
  orderId: string;
}

interface CartState {
  lines: CartLine[];
  customerName: string;
  lastOrder: LastOrder | null;
  addItem: (item: MenuItem) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCustomerName: (name: string) => void;
  setLastOrder: (order: LastOrder) => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  customerName: '',
  lastOrder: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        };
      }
      return { lines: [...state.lines, { item, quantity: 1 }] };
    }),

  incrementItem: (itemId) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.item.id === itemId ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    })),

  decrementItem: (itemId) =>
    set((state) => ({
      lines: state.lines
        .map((line) => (line.item.id === itemId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    })),

  removeItem: (itemId) =>
    set((state) => ({
      lines: state.lines.filter((line) => line.item.id !== itemId),
    })),

  clearCart: () => set({ lines: [], customerName: '' }),

  setCustomerName: (name) => set({ customerName: name }),

  setLastOrder: (order) => set({ lastOrder: order }),
}));

export function getCartItemCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.item.price * line.quantity, 0);
}