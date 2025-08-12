import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách danh mục' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện hành động này' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bạn không có quyền thêm danh mục' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { message: 'Tên danh mục không được để trống' },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description || '',
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { message: 'Danh mục với tên này đã tồn tại' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Lỗi khi tạo danh mục mới' },
      { status: 500 }
    );
  }
}