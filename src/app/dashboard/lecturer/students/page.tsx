'use client';
import { Suspense } from 'react';
import StudentAccessManagement from '@/components/documents/StudentAccess';

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentAccessManagement />
    </Suspense>
  );
}
