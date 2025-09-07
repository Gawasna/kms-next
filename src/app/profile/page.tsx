// src/app/profile/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { Typography } from 'antd';
import UserProfile from '@/components/profile/Profile'; // Component UI chính
import prisma from '@/lib/db'; // Import Prisma client

const { Title } = Typography;

export const metadata = {
  title: 'Hồ sơ người dùng - KIMS',
  description: 'Quản lý thông tin hồ sơ cá nhân của bạn.',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/auth/login?callbackUrl=/profile');
  }

  // LẤY DỮ LIỆU MỚI NHẤT TRỰC TIẾP TỪ DATABASE
  // Đây là chìa khóa để đảm bảo dữ liệu luôn được làm mới khi trang được render lại
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    // Nếu user không tồn tại trong DB dù có session, có thể là lỗi đồng bộ
    // Chuyển hướng về trang đăng nhập để họ đăng nhập lại và tạo lại session
    redirect('/auth/login');
  }

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 
        Truyền dữ liệu người dùng mới nhất từ server (user) xuống 
        Client Component. Bằng cách này, UI sẽ luôn hiển thị thông tin đúng,
        ngay cả khi session JWT chưa được cập nhật.
      */}
      <UserProfile initialUser={user} />
    </main>
  );
}