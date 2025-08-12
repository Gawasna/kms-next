import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET /api/tags/[id] - Get a tag by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
    });

    if (!tag) {
      return NextResponse.json(
        { message: 'Không tìm thấy tag' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error(`Error fetching tag ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Update a tag (ADMIN only)
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

    // Only ADMIN can update tags
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bạn không có quyền cập nhật tag' },
        { status: 403 }
      );
    }

    // Check if tag exists
    const tagExists = await prisma.tag.findUnique({
      where: { id: params.id },
    });

    if (!tagExists) {
      return NextResponse.json(
        { message: 'Không tìm thấy tag' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { message: 'Tên tag không được để trống' },
        { status: 400 }
      );
    }

    // Normalize tag name
    const normalizedTagName = body.name.trim().toLowerCase();

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: normalizedTagName,
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error(`Error updating tag ${params.id}:`, error);
    
    // Handle unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { message: 'Tag với tên này đã tồn tại' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Delete a tag (ADMIN only)
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

    // Only ADMIN can delete tags
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bạn không có quyền xóa tag' },
        { status: 403 }
      );
    }

    // Check if tag exists
    const tagExists = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        knowledgeEntries: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!tagExists) {
      return NextResponse.json(
        { message: 'Không tìm thấy tag' },
        { status: 404 }
      );
    }

    // Check if tag is being used in any knowledge entries
    if (tagExists.knowledgeEntries.length > 0) {
      return NextResponse.json(
        { message: 'Không thể xóa tag đang được sử dụng trong tài liệu' },
        { status: 400 }
      );
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Xóa tag thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting tag ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Lỗi khi xóa tag' },
      { status: 500 }
    );
  }
}