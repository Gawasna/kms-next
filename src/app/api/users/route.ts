// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod'; // Sử dụng Zod cho validation params nếu cần

// Schema cho query parameters (optional but good practice)
const getUsersQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(), // Lọc theo role
  // Thêm các filter khác nếu cần, ví dụ: name, email
});

export async function GET(req: Request) {
  try {
    // 1. Kiểm tra session và quyền ADMIN (Defense in depth: Middleware đã làm nhưng vẫn nên check lại)
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Bạn không có quyền truy cập.' }, { status: 403 });
    }

    // 2. Lấy query parameters từ URL
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    let whereClause: { role?: UserRole } = {};

    if (roleParam) {
      // Validate roleParam bằng Zod
      const parsedRole = getUsersQuerySchema.safeParse({ role: roleParam });
      if (!parsedRole.success) {
        return NextResponse.json({ 
          message: 'Giá trị vai trò không hợp lệ.', 
          errors: parsedRole.error.errors 
        }, { status: 400 });
      }
      whereClause.role = parsedRole.data.role;
    }

    // 3. Truy vấn tất cả người dùng hoặc lọc theo role
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
      },
      orderBy: {
        createdAt: 'desc', // Sắp xếp theo ngày tạo mới nhất
      },
    });

    return NextResponse.json({ message: 'Lấy danh sách người dùng thành công.', users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi lấy danh sách người dùng.' }, { status: 500 });
  }
}

// Nếu bạn muốn có API tạo người dùng mới bằng ADMIN, bạn sẽ thêm hàm POST ở đây
// export async function POST(req: Request) { ... }