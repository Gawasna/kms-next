'use client';
import { Suspense } from 'react';
import AccessDeniedContent from '@/components/auth/AccessDenied';

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccessDeniedContent />
    </Suspense>
  );
}
