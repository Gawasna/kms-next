import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { UserRole, AccessLevel } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Get search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: 'Search query is required' 
      }, { status: 400 });
    }

    // Get user session to determine access level
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || 'GUEST_ROLE' as UserRole;
    const userId = session?.user?.id;

    // Build access level conditions based on user role
    const accessLevelConditions = [];
    
    // PUBLIC is always accessible
    accessLevelConditions.push({ accessLevel: AccessLevel.PUBLIC });
    
    // Access based on role hierarchy
    if (userRole === 'STUDENT' || userRole === 'LECTURER' || userRole === 'ADMIN') {
      accessLevelConditions.push({ accessLevel: AccessLevel.STUDENT_ONLY });
    }
    
    if (userRole === 'LECTURER' || userRole === 'ADMIN') {
      accessLevelConditions.push({ accessLevel: AccessLevel.LECTURER_ONLY });
    }
    
    // For PRIVATE, only the author or admin can access
    if (userRole === 'ADMIN') {
      accessLevelConditions.push({ accessLevel: AccessLevel.PRIVATE });
    } else if (userId) {
      accessLevelConditions.push({
        accessLevel: AccessLevel.PRIVATE,
        authorId: userId
      });
    }

    // Build search query with access conditions
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
          {
            OR: accessLevelConditions
          },
          { 
            status: 'APPROVED' 
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        },
        author: {
          select: {
            name: true,
            image: true
          }
        },
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
        // Don't return full content for performance reasons
      },
      orderBy: [
        // Prioritize title matches, then most recently updated
        { title: 'asc' },
        { updatedAt: 'desc' } // Most recently updated first
      ],
      take: 5 // Return only top 5 results
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