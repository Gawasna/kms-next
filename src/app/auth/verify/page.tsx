'use client';
import { Suspense } from 'react';
import VerifyComponent from '@/components/auth/VerifyCom';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyComponent />
    </Suspense>
  );
}
