'use client';

import { Suspense } from 'react';
import CategoriesBrowse from '@/components/common/CategoriesBrowse';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesBrowse />
    </Suspense>
  );
}