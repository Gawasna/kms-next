import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { UserRole, AccessLevel } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params;
    const yearNumber = parseInt(year);
    
    if (isNaN(yearNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid year format' 
      }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
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

    // Get the start and end dates for the specified year
    const startDate = new Date(yearNumber, 0, 1); // January 1st of the year
    const endDate = new Date(yearNumber, 11, 31, 23, 59, 59, 999); // December 31st of the year

    // Count total documents in the year that match permissions
    const totalCount = await prisma.knowledgeEntry.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        ...permissionClause
      }
    });

    // Get documents in the year that match permissions
    const documents = await prisma.knowledgeEntry.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
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
        author: { 
          select: { 
            id: true,
            name: true, 
            image: true 
          } 
        },
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
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      year: yearNumber,
      documents,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Year documents fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching documents for this year'
    }, { status: 500 });
  }
}