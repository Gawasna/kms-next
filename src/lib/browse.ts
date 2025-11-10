// src/lib/browse.ts
import prisma from './db';
import { KnowledgeEntryStatus } from '@prisma/client';

const DEFAULT_LIMIT = 5;

// Function to get top categories
const getTopCategories = (limit: number = DEFAULT_LIMIT) => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          knowledgeEntries: { where: { status: KnowledgeEntryStatus.APPROVED } },
        },
      },
    },
    orderBy: {
      knowledgeEntries: { _count: 'desc' },
    },
    take: limit,
  });
};

// Function to get top authors
const getTopAuthors = (limit: number = DEFAULT_LIMIT) => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          knowledgeEntries: { where: { status: KnowledgeEntryStatus.APPROVED } },
        },
      },
    },
    orderBy: {
      knowledgeEntries: { _count: 'desc' },
    },
    take: limit,
    where: {
      knowledgeEntries: {
        some: { status: KnowledgeEntryStatus.APPROVED },
      },
    },
  });
};

// Function to get top tags
const getTopTags = (limit: number = DEFAULT_LIMIT) => {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          knowledgeEntries: { where: { status: KnowledgeEntryStatus.APPROVED } },
        },
      },
    },
    orderBy: {
      knowledgeEntries: { _count: 'desc' },
    },
    take: limit,
    where: {
      knowledgeEntries: {
        some: { status: KnowledgeEntryStatus.APPROVED },
      },
    },
  });
};

// Function to get top years
const getTopYears = async (limit: number = DEFAULT_LIMIT) => {
  const documentsByYear = await prisma.knowledgeEntry.groupBy({
    by: ['createdAt'],
    _count: { id: true },
    where: { status: KnowledgeEntryStatus.APPROVED },
    orderBy: { _count: { id: 'desc' } },
  });

  const aggregatedYearsMap = new Map<number, number>();
  for (const item of documentsByYear) {
    const year = item.createdAt.getFullYear();
    aggregatedYearsMap.set(year, (aggregatedYearsMap.get(year) || 0) + item._count.id);
  }

  return Array.from(aggregatedYearsMap.entries())
    .map(([year, count]) => ({ year, documentCount: count }))
    .sort((a, b) => b.documentCount - a.documentCount)
    .slice(0, limit);
};

// Main function to get all browse data
export const getBrowseData = async (limit: number = DEFAULT_LIMIT) => {
  try {
    const [topCategories, topAuthors, topTags, topYears] = await Promise.all([
      getTopCategories(limit),
      getTopAuthors(limit),
      getTopTags(limit),
      getTopYears(limit),
    ]);

    // Format data to be consistent with what the component expects
    const formattedCategories = topCategories
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.knowledgeEntries,
        slug: cat.name.toLowerCase().replace(/ /g, '-'),
      }))
      .filter(cat => cat.count > 0);

    const formattedAuthors = topAuthors
      .map(author => ({
        id: author.id,
        name: author.name,
        count: author._count.knowledgeEntries,
        slug: author.id,
      }))
      .filter(author => author.count > 0);

    const formattedTags = topTags
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.knowledgeEntries,
        slug: tag.name.toLowerCase().replace(/ /g, '-'),
      }))
      .filter(tag => tag.count > 0);

    const formattedYears = topYears.map(item => ({
      name: item.year.toString(),
      count: item.documentCount,
      slug: item.year.toString(),
    }));

    return {
      categories: formattedCategories,
      authors: formattedAuthors,
      tags: formattedTags,
      years: formattedYears,
    };
  } catch (error) {
    console.error('Error fetching browse data:', error);
    // In case of an error, return empty arrays to avoid breaking the page
    return {
      categories: [],
      authors: [],
      tags: [],
      years: [],
    };
  }
};
