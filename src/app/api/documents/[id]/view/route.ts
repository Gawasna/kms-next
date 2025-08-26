import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    await prisma.knowledgeEntry.update({
      where: { id: documentId },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, message: 'View count updated.' }, { status: 200 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Document not found.' }, { status: 404 });
    }
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}