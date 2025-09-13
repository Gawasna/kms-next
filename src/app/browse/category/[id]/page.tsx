import { Suspense } from 'react';
import CategoryDoc from '@/components/common/CategoryDoc';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryDoc categoryId={id} />
    </Suspense>
  );
}