import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OrderPoint Kitchen',
  description: 'Kitchen display for preparing incoming orders',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}