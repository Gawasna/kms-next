import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get distinct years from knowledge entries (using created year)
    const knowledgeEntries = await prisma.knowledgeEntry.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Extract years and count documents per year
    const yearsMap = new Map<number, number>();
    
    knowledgeEntries.forEach(entry => {
      const year = new Date(entry.createdAt).getFullYear();
      yearsMap.set(year, (yearsMap.get(year) || 0) + 1);
    });
    
    // Convert to array and sort by year (descending)
    const years = Array.from(yearsMap.entries()).map(([year, count]) => ({
      year,
      count
    })).sort((a, b) => b.year - a.year);

    return NextResponse.json({
      success: true,
      years
    });
  } catch (error) {
    console.error('Years fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while fetching years'
    }, { status: 500 });
  }
}