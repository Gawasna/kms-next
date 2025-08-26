import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { KnowledgeEntryStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const topCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            knowledgeEntries: {
              where: {
                status: KnowledgeEntryStatus.APPROVED,
              },
            },
          },
        },
      },
      orderBy: {
        knowledgeEntries: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    const formattedCategories = topCategories
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        documentCount: cat._count.knowledgeEntries,
      }))
      .filter(cat => cat.documentCount > 0);

    return NextResponse.json(formattedCategories);

  } catch (error) {
    console.error('Error fetching top categories:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy danh mục hàng đầu.' }, { status: 500 });
  }
}