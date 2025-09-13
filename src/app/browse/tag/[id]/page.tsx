import { Suspense } from 'react';
import TagDoc from '@/components/common/TagDoc';

export default async function TagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagDoc tagId={id} />
    </Suspense>
  );
}