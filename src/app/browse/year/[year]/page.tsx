import { Suspense } from 'react';
import YearDoc from '@/components/common/YearDoc';

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YearDoc year={year} />
    </Suspense>
  );
}