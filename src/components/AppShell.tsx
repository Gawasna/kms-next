// components/ui/AppShell.tsx
'use client'

import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer'
import BackToTop from '@/components/ui/BackToTop'

const hiddenHeaderRoutes = [
  '/auth/verify',
  '/dashboard/admin'
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldHideHeader = hiddenHeaderRoutes.includes(pathname);

  return (
    <div className="app-container">
      {!shouldHideHeader && <Header />}
      <main className="content-wrapper">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
