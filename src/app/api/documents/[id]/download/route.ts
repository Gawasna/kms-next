// src/app/api/documents/[id]/download/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const { hasViewed } = await req.json(); // Nhận trạng thái `hasViewed` từ client

    let viewIncrement = 0;
    if (!hasViewed) {
      viewIncrement = 1;
    }

    await prisma.knowledgeEntry.update({
      where: { id: documentId },
      data: {
        downloadsCount: { increment: 1 },
        viewsCount: { increment: viewIncrement }, // Tăng lượt xem có điều kiện
      },
    });

    return NextResponse.json({ success: true, newViewCounted: viewIncrement > 0 }, { status: 200 });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}