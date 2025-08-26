// src/app/api/browse/top-authors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { KnowledgeEntryStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const topAuthors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
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
      where: {
        knowledgeEntries: {
          some: {
            status: KnowledgeEntryStatus.APPROVED,
          }
        }
      }
    });

    const formattedAuthors = topAuthors
      .map(author => ({
        id: author.id,
        name: author.name,
        image: author.image,
        documentCount: author._count.knowledgeEntries,
      }))
      .filter(author => author.documentCount > 0); // Chỉ trả về các tác giả có tài liệu

    return NextResponse.json(formattedAuthors);

  } catch (error) {
    console.error('Error fetching top authors:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy tác giả hàng đầu.' }, { status: 500 });
  }
}