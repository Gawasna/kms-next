import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: {
        knowledgeEntries: {
          some: {
            status: 'APPROVED'
          }
        }
      }
    });
    
    // Get authors with pagination and count of published documents
    const authors = await prisma.user.findMany({
      where: {
        knowledgeEntries: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            knowledgeEntries: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      authors,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Authors fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching authors'
    }, { status: 500 });
  }
}