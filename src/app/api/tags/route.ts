import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET /api/tags - Get all tags or search by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // If query parameter exists and has at least 2 characters, perform search
    if (query && query.length >= 2) {
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive', // Case-insensitive search
          },
        },
        orderBy: {
          name: 'asc',
        },
        take: limit,
      });

      return NextResponse.json(tags);
    } 
    
    // Otherwise return all tags (with a reasonable limit)
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      take: 100, // Limit to prevent returning too many tags
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag (ADMIN or LECTURER only)
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

    // Only ADMIN or LECTURER can create tags
    if (session.user.role !== 'ADMIN' && session.user.role !== 'LECTURER') {
      return NextResponse.json(
        { message: 'Bạn không có quyền thêm tag' },
        { status: 403 }
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

    // Normalize tag name - lowercase and trim
    const normalizedTagName = body.name.trim().toLowerCase();
    
    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: normalizedTagName },
    });

    // If tag exists, return it
    if (existingTag) {
      return NextResponse.json(existingTag, { status: 200 });
    }

    // Create new tag
    const newTag = await prisma.tag.create({
      data: {
        name: normalizedTagName,
      },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    
    // Handle unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { message: 'Tag này đã tồn tại' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Lỗi khi tạo tag mới' },
      { status: 500 }
    );
  }
}