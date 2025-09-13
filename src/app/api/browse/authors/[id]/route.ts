import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { UserRole, AccessLevel } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Verify author exists
    const author = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      }
    });

    if (!author) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không tìm thấy tác giả' 
      }, { status: 404 });
    }

    // Get user session for permission check
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    // Create permission clause similar to the documents API
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

    // Count total documents by this author that match permissions
    const totalCount = await prisma.knowledgeEntry.count({
      where: {
        authorId: id,
        ...permissionClause
      }
    });

    // Get documents by this author that match permissions
    const documents = await prisma.knowledgeEntry.findMany({
      where: {
        authorId: id,
        ...permissionClause
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        accessLevel: true,
        viewsCount: true,
        downloadsCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          select: { 
            id: true,
            name: true 
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      author,
      documents,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Author details fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching author details'
    }, { status: 500 });
  }
}