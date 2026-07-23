'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setChecked(true);
  }, [router]);

  // Cegah "flash" konten admin sebelum guard sempat mengecek token.
  if (!checked) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}