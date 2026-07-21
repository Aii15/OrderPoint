import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OrderPoint Cashier',
  description: 'Cashier monitor for managing incoming orders',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}