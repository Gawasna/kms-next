import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { UserRole, AccessLevel } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: 'Search query is required' 
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    // === Lấy logic phân quyền từ API documents GET ===
    let permissionClause: any;

    if (!currentUser) {
        permissionClause = {
            status: 'APPROVED',
            accessLevel: 'PUBLIC',
            permissions: { none: {} }
        };
    } else {
        const { id: currentUserId, role: currentUserRole } = currentUser;

        if (currentUserRole === UserRole.ADMIN) {
            permissionClause = {};
        } else {
            const generalAccessConditions: any[] = [{ accessLevel: 'PUBLIC' }];
            if (currentUserRole === UserRole.STUDENT || currentUserRole === UserRole.LECTURER) {
                generalAccessConditions.push({ accessLevel: 'STUDENT_ONLY' });
            }
            if (currentUserRole === UserRole.LECTURER) {
                generalAccessConditions.push({ accessLevel: 'LECTURER_ONLY' });
            }

            permissionClause = {
                OR: [
                    { authorId: currentUserId },
                    {
                        AND: [
                            { status: 'APPROVED' },
                            {
                                OR: [
                                    {
                                        AND: [
                                            { permissions: { none: {} } },
                                            { OR: generalAccessConditions }
                                        ]
                                    },
                                    {
                                        permissions: {
                                            some: {
                                                userId: currentUserId,
                                                OR: [
                                                    { expiresAt: null },
                                                    { expiresAt: { gte: new Date() } }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
    }
    // === Hết logic phân quyền ===

    const results = await prisma.knowledgeEntry.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } }
            ]
          },
          permissionClause, // Áp dụng mệnh đề phân quyền
          { status: 'APPROVED' } // Chỉ tìm kiếm trong các tài liệu đã được duyệt
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        categoryId: true,
        category: { select: { name: true } },
        author: { select: { name: true, image: true } },
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { title: 'asc' },
        { updatedAt: 'desc' }
      ],
      take: 5
    });

    return NextResponse.json({
      success: true,
      results,
      totalCount: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred during search'
    }, { status: 500 });
  }
}