import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.tag.count();
    
    // Get tags with pagination and count of related documents
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            knowledgeEntries: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      tags,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching tags'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: 'Tag name is required' 
      }, { status: 400 });
    }

    // Check if tag with the same name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return NextResponse.json({ 
        success: false, 
        message: 'A tag with this name already exists' 
      }, { status: 409 });
    }

    // Create new tag
    const newTag = await prisma.tag.create({
      data: {
        name
      }
    });

    return NextResponse.json({
      success: true,
      tag: newTag
    }, { status: 201 });
  } catch (error) {
    console.error('Tag creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while creating the tag'
    }, { status: 500 });
  }
}