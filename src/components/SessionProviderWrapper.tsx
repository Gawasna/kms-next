'use client'; // Dấu hiệu là Client Component

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth'; // Import type Session

interface Props {
  children: React.ReactNode;
  session: Session | null; // Truyền session từ server component
}

export default function SessionProviderWrapper({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}