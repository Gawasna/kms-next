// src/app/api/browse/top-tags/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { KnowledgeEntryStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const topTags = await prisma.tag.findMany({
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
          _count: 'desc', // Sắp xếp theo số lượng tài liệu giảm dần
        },
      },
      take: limit,
      where: {
        // Chỉ lấy những tag có ít nhất 1 tài liệu APPROVED
        knowledgeEntries: {
          some: {
            status: KnowledgeEntryStatus.APPROVED,
          }
        }
      }
    });

    const formattedTags = topTags
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        documentCount: tag._count.knowledgeEntries,
      }))
      .filter(tag => tag.documentCount > 0); // Chỉ trả về các tag có tài liệu

    return NextResponse.json(formattedTags);

  } catch (error) {
    console.error('Error fetching top tags:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy tags hàng đầu.' }, { status: 500 });
  }
}