import { Suspense } from 'react';
import AuthorDoc from '@/components/common/AuthorDoc';

// Đổi thành async Server Component
export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Đang tải thông tin tác giả...</div>}>
      <AuthorDoc authorId={id} />
    </Suspense>
  );
}