import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.category.count();
    
    // Get categories with pagination
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
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
      categories,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching categories'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: 'Category name is required' 
      }, { status: 400 });
    }

    // Check if category with the same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json({ 
        success: false, 
        message: 'A category with this name already exists' 
      }, { status: 409 });
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json({
      success: true,
      category: newCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while creating the category'
    }, { status: 500 });
  }
}