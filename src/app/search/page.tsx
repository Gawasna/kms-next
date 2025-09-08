'use client';

import { Suspense } from 'react';
import SearchPageContent from '@/components/common/SearchContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
