import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db';

// GET /api/categories/[id] - Get a category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Error fetching category ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin danh mục' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { message: 'Bạn không có quyền cập nhật danh mục' },
        { status: 403 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Không tìm thấy danh mục' },
        { status: 404 }
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

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || '',
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error: String | any) {
    console.error(`Error updating category ${params.id}:`, error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Danh mục với tên này đã tồn tại' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật danh mục' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { message: 'Bạn không có quyền xóa danh mục' },
        { status: 403 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    // Check if category has related knowledge entries
    const knowledgeEntries = await prisma.knowledgeEntry.findMany({
      where: { categoryId: params.id },
      select: { id: true },
      take: 1, // We only need to know if there's at least one
    });

    if (knowledgeEntries.length > 0) {
      return NextResponse.json(
        { message: 'Không thể xóa danh mục đã có tài liệu liên kết' },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Xóa danh mục thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting category ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Lỗi khi xóa danh mục' },
      { status: 500 }
    );
  }
}