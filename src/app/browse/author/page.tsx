'use client';

import { Suspense } from 'react';
import AuthorBrowse from '@/components/common/AuthorBrowse';

export default function AuthorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorBrowse />
    </Suspense>
  );
}