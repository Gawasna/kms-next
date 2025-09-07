// src/app/dashboard/admin/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/Dashboard'; // Import Client Component
import { UserRole } from '@prisma/client'; // hoặc dùng string trực tiếp nếu không dùng Prisma

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

    const message = "Chỉ có quản trị viên mới có thể truy cập trang này.";

    function redirectWithMessage(url: string, message: string) {
    redirect(`${url}?message=${encodeURIComponent(message)}`);
    }

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirectWithMessage('/auth/access-denied', message);
  }

  // ✅ Passed checks → render client component
  return <AdminDashboard session={session} />;
}
