import { SessionProvider } from 'next-auth/react'; // Client-side component
import './globals.css'; // Hoặc đường dẫn CSS của bạn

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* SessionProvider phải là client component */}
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}

// Tạo một Client Component để bọc SessionProvider
// Đây là cách chuẩn để dùng SessionProvider trong App Router
// Đặt nó vào một file riêng, ví dụ: components/SessionProviderWrapper.tsx
// để tránh lỗi "use client" ở root layout
import { getSession } from 'next-auth/react'; // Import getSession for RSC/Server component
import { Session } from 'next-auth'; // Import Session type

interface ClientSessionProviderProps {
  children: React.ReactNode;
}

// components/SessionProviderWrapper.tsx (đặt trong file riêng)
// 'use client';
// import { SessionProvider } from 'next-auth/react';

// export default function ClientSessionProvider({ children }: ClientSessionProviderProps) {
//   return <SessionProvider>{children}</SessionProvider>;
// }

// Đối với layout, chúng ta cần truyền session ban đầu từ server
// Đây là cách phù hợp với Next.js 13 App Router và NextAuth v4
export async function ClientSessionProvider({ children }: ClientSessionProviderProps) {
  const session = await getSession(); // Lấy session từ server side
  return <SessionProvider session={session}>{children}</SessionProvider>;
}