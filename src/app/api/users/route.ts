import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const getUsersQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(), 
});

export async function GET(req: Request) {
  try {
    // 1. Kiểm tra session và quyền ADMIN 
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Bạn không có quyền truy cập.' }, { status: 403 });
    }

    // 2. Lấy query parameters từ URL
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    let whereClause: { role?: UserRole } = {};

    if (roleParam) {
      const parsedRole = getUsersQuerySchema.safeParse({ role: roleParam });
      if (!parsedRole.success) {
        return NextResponse.json({ 
          message: 'Giá trị vai trò không hợp lệ.', 
          errors: parsedRole.error.errors 
        }, { status: 400 });
      }
      whereClause.role = parsedRole.data.role;
    }

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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ message: 'Lấy danh sách người dùng thành công.', users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi lấy danh sách người dùng.' }, { status: 500 });
  }
}