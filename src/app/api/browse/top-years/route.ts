// src/app/api/browse/top-years/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { KnowledgeEntryStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const documentsByYear = await prisma.knowledgeEntry.groupBy({
      by: ['createdAt'],
      _count: {
        id: true, 
      },
      where: {
        status: KnowledgeEntryStatus.APPROVED,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const formattedYears = documentsByYear.map(item => ({
      year: item.createdAt.getFullYear(),
      documentCount: item._count.id,
    }));
    
    const aggregatedYearsMap = new Map<number, number>();
    for (const item of formattedYears) {
      aggregatedYearsMap.set(item.year, (aggregatedYearsMap.get(item.year) || 0) + item.documentCount);
    }

    const aggregatedYears = Array.from(aggregatedYearsMap.entries())
      .map(([year, count]) => ({ year, documentCount: count }))
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, limit); 

    return NextResponse.json(aggregatedYears);

  } catch (error) {
    console.error('Error fetching top years:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy các năm hàng đầu.' }, { status: 500 });
  }
}