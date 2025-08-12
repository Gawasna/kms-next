// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth'; // Đảm bảo hàm này đã được implement và import đúng
import prisma from '@/lib/db'; // Đảm bảo prisma client đã được khởi tạo và import đúng
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Server-side validation (có thể mở rộng để dùng Zod schema như client)
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Thiếu trường yêu cầu: tên, email, hoặc mật khẩu.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 });
    }

    // (Optional)
    // try {
    //   registerSchema.pick({ name: true, email: true, password: true }).parse({ name, email, password });
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     return NextResponse.json({ message: 'Dữ liệu không hợp lệ.', errors: error.errors }, { status: 400 });
    //   }
    //   throw error; // Re-throw other errors
    // }


    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Người dùng với email này đã tồn tại.' }, { status: 409 }); // 409 Conflict
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: UserRole.STUDENT,
        emailVerified: null,
      },
    });

    return NextResponse.json({
      message: 'Đăng ký người dùng thành công!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    // Trong môi trường production, tránh trả về chi tiết lỗi cho client
    return NextResponse.json({ message: 'Đã xảy ra lỗi trong quá trình đăng ký.' }, { status: 500 });
  }
}