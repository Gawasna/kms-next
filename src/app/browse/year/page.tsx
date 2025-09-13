'use client';

import { Suspense } from 'react';
import YearBrowse from '@/components/common/YearBrowse';

export default function YearsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YearBrowse />
    </Suspense>
  );
}