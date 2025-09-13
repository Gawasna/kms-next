'use client';

import { Suspense } from 'react';
import TagBrowse from '@/components/common/TagBrowse';

export default function TagsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagBrowse />
    </Suspense>
  );
}