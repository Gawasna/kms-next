import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import LecturerDashboard from '@/components/lecturer/LecturerDashboard';
import { UserRole } from '@prisma/client'; // Or use string directly if not using Prisma

export default async function LecturerDashboardPage() {
  const session = await getServerSession(authOptions);

  const message = "Chỉ có giảng viên mới có thể truy cập trang này.";

  function redirectWithMessage(url: string, message: string) {
    redirect(`${url}?message=${encodeURIComponent(message)}`);
  }

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== UserRole.LECTURER) {
    redirectWithMessage('/auth/access-denied', message);
  }

  // ✅ Passed checks → render client component
  return <LecturerDashboard session={session} />;
}