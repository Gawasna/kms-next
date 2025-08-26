import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { Alert, Button } from 'antd';
import Link from 'next/link';
import { UserRole } from '@prisma/client'; // Đảm bảo import UserRole

interface DocumentPageProps {
  params: {
    id: string; // Document ID từ URL
  };
}

// Hàm kiểm tra quyền truy cập (ĐÃ SỬA LỖI)
async function checkAccess(documentId: string, userId?: string, userRole?: UserRole) {
    const doc = await prisma.knowledgeEntry.findUnique({
        where: { id: documentId },
        include: {
            author: true,
            category: true,
            tags: true,
            // Fetch tất cả permissions liên quan đến tài liệu này
            permissions: true,
        },
    });

    if (!doc) {
        return { authorized: false, reason: 'not_found', document: null };
    }

    // Admin và tác giả luôn có quyền, bất kể trạng thái
    if (userRole === UserRole.ADMIN || (userId && doc.authorId === userId)) {
        return { authorized: true, reason: 'owner_or_admin', document: doc };
    }
    
    // Nếu không phải Admin/Tác giả, tài liệu phải được duyệt
    if (doc.status !== 'APPROVED') {
        return { authorized: false, reason: 'not_approved', document: doc };
    }

    // --- LOGIC PHÂN QUYỀN CHÍNH (Đồng bộ với API và DB Function) ---
    const now = new Date();
    
    // 1. Kiểm tra xem có bất kỳ chia sẻ cụ thể nào cho tài liệu này không
    const hasSpecificPermissionsSetup = doc.permissions.length > 0;

    if (hasSpecificPermissionsSetup) {
        // Nếu CÓ chia sẻ cụ thể, chỉ kiểm tra các quyền cụ thể
        const isSpecificallyGranted = doc.permissions.some(p => 
            (p.userId === userId || (p.grantedToRole && userRole && p.grantedToRole === userRole)) && // Role-based access for specific permission
            (!p.expiresAt || p.expiresAt > now)
        );
        return { authorized: isSpecificallyGranted, reason: 'specific_permission_check', document: doc };

    } else {
        // Nếu KHÔNG CÓ chia sẻ cụ thể, kiểm tra accessLevel
        if (!userId) { // Guest (chưa đăng nhập)
            return { authorized: doc.accessLevel === 'PUBLIC', reason: 'guest_public_check', document: doc };
        } else { // Người dùng đã đăng nhập (không phải Admin/Tác giả)
            if (doc.accessLevel === 'PUBLIC') return { authorized: true, reason: 'general_public', document: doc };
            if (doc.accessLevel === 'STUDENT_ONLY' && (userRole === UserRole.STUDENT || userRole === UserRole.LECTURER)) {
                return { authorized: true, reason: 'general_student_only', document: doc };
            }
            if (doc.accessLevel === 'LECTURER_ONLY' && userRole === UserRole.LECTURER) {
                return { authorized: true, reason: 'general_lecturer_only', document: doc };
            }
        }
    }

    return { authorized: false, reason: 'permission_denied', document: doc };
}


export default async function DocumentDetailPage({ params }: DocumentPageProps) {
  const session = await getServerSession(authOptions);
  const { id: documentId } = params;

  const { authorized, reason, document } = await checkAccess(documentId, session?.user?.id, session?.user?.role as UserRole); // Cast user.role

  if (!document) {
    notFound(); 
  }

  if (!authorized) {
    if (reason === 'not_approved') {
      return (
        <main className="p-8 text-center">
            <Alert 
                message="Tài liệu chưa được duyệt"
                description="Tài liệu này đang chờ kiểm duyệt hoặc đã bị từ chối. Chỉ tác giả hoặc quản trị viên mới có thể xem."
                type="warning"
                showIcon
            />
        </main>
      );
    }
    // Nếu chưa đăng nhập và cần đăng nhập
    if (!session) {
        return (
            <main className="p-8 text-center">
                <Alert 
                    message="Yêu cầu đăng nhập"
                    description="Bạn cần đăng nhập để xem tài liệu này. Vui lòng đăng nhập và thử lại."
                    type="info"
                    showIcon
                    action={
                        <Link href={`/auth/login?callbackUrl=/document/${documentId}`}>
                            <Button type="primary">Đăng nhập</Button>
                        </Link>
                    }
                />
            </main>
        );
    }
    // Nếu đã đăng nhập nhưng vẫn không có quyền
    return (
        <main className="p-8 text-center">
            <Alert 
                message="Truy cập bị từ chối"
                description="Bạn không có quyền xem tài liệu này."
                type="error"
                showIcon
            />
        </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <DocumentViewer 
        document={JSON.parse(JSON.stringify(document))}
        currentUser={session?.user} 
      />
    </main>
  );
}