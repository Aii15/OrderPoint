import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OrderPoint Kiosk',
  description: 'Self-order kiosk for in-store customers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}