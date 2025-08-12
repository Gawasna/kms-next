// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Schema cho body của PATCH request (cập nhật role)
const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole).refine(
    (val) => val !== UserRole.GUEST_ROLE && val !== UserRole.ADMIN, // Không cho phép set trực tiếp GUEST_ROLE hoặc ADMIN qua API này
    {
      message: 'Vai trò cập nhật không hợp lệ (chỉ STUDENT, LECTURER).',
      path: ['role'],
    }
  ),
});

interface UserParams {
  params: {
    id: string; // User ID từ URL
  };
}

// LẤY THÔNG TIN MỘT NGƯỜI DÙNG CỤ THỂ
export async function GET(req: Request, { params }: UserParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Bạn không có quyền truy cập.' }, { status: 403 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ message: 'ID người dùng không được cung cấp.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lấy thông tin người dùng thành công.', user }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi lấy thông tin người dùng.' }, { status: 500 });
  }
}

// CẬP NHẬT VAI TRÒ CỦA NGƯỜI DÙNG (TỪ STUDENT THÀNH LECTURER)
export async function PATCH(req: Request, { params }: UserParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Bạn không có quyền cập nhật người dùng.' }, { status: 403 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ message: 'ID người dùng không được cung cấp.' }, { status: 400 });
    }

    // Không cho phép ADMIN tự thay đổi vai trò của mình qua API này
    if (session.user.id === userId) {
      return NextResponse.json({ message: 'Không thể tự cập nhật vai trò của mình qua API này.' }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = updateUserRoleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({
        message: 'Dữ liệu cập nhật không hợp lệ.',
        errors: parsedBody.error.errors,
      }, { status: 400 });
    }

    const { role: newRole } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true } // Chỉ cần lấy role hiện tại để kiểm tra
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'Người dùng không tồn tại.' }, { status: 404 });
    }

    // Optional: Kiểm tra nếu cố gắng cập nhật vai trò của một ADMIN khác (thường không nên)
    if (existingUser.role === UserRole.ADMIN) {
        return NextResponse.json({ message: 'Không thể thay đổi vai trò của tài khoản ADMIN khác.' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { // Chỉ trả về các trường cần thiết sau khi update
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Cập nhật vai trò người dùng thành công.',
      user: updatedUser,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi cập nhật người dùng.' }, { status: 500 });
  }
}

// XÓA TÀI KHOẢN NGƯỜI DÙNG
export async function DELETE(req: Request, { params }: UserParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa tài khoản.' }, { status: 403 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ message: 'ID người dùng không được cung cấp.' }, { status: 400 });
    }

    // Không cho phép ADMIN tự xóa tài khoản của mình
    if (session.user.id === userId) {
      return NextResponse.json({ message: 'Không thể tự xóa tài khoản của mình.' }, { status: 403 });
    }

    // Kiểm tra xem người dùng có tồn tại và không phải là ADMIN khác (để tránh xóa nhầm ADMIN khác)
    const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng để xóa.' }, { status: 404 });
    }
    
    if (userToDelete.role === UserRole.ADMIN) {
        return NextResponse.json({ message: 'Không thể xóa tài khoản ADMIN khác.' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Xóa tài khoản người dùng thành công.' }, { status: 204 }); // 204 No Content

  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    // Bắt lỗi P2025 (Record not found) nếu muốn trả về 404 thay vì 500
    if (error === 'P2025') {
        return NextResponse.json({ message: 'Người dùng không tồn tại để xóa.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi xóa tài khoản người dùng.' }, { status: 500 });
  }
}