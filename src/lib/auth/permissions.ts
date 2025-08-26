import { Prisma } from '@prisma/client';
import { Session } from 'next-auth';

/**
 * Xây dựng mệnh đề WHERE của Prisma để lọc KnowledgeEntry dựa trên quyền của người dùng.
 * Hàm này là nguồn chân lý duy nhất cho logic phân quyền.
 * @param currentUser - Session user object từ NextAuth, hoặc null nếu là guest.
 * @returns Prisma.KnowledgeEntryWhereInput - Mệnh đề WHERE để sử dụng trong các truy vấn Prisma.
 */
export function buildDocumentPermissionFilter(
  currentUser: Session['user'] | null | undefined
): Prisma.KnowledgeEntryWhereInput {
  if (!currentUser) {
    // --- Guest (chưa đăng nhập) ---
    return {
      status: 'APPROVED',
      accessLevel: 'PUBLIC',
    };
  }

  const { id: currentUserId, role: currentUserRole } = currentUser;

  if (currentUserRole === 'ADMIN') {
    // --- Admin thấy tất cả ---
    return {}; // Không có điều kiện lọc -> trả về tất cả
  }

  // --- Logic cho các vai trò khác (STUDENT, LECTURER) ---
  
  // Điều kiện cho quyền truy cập chung (dựa trên accessLevel)
  const generalAccessConditions: Prisma.KnowledgeEntryWhereInput[] = [
    { accessLevel: 'PUBLIC' },
  ];
  if (currentUserRole === 'STUDENT' || currentUserRole === 'LECTURER') {
    generalAccessConditions.push({ accessLevel: 'STUDENT_ONLY' });
  }
  if (currentUserRole === 'LECTURER') {
    generalAccessConditions.push({ accessLevel: 'LECTURER_ONLY' });
  }

  return {
    OR: [
      // A. Người dùng là tác giả
      { authorId: currentUserId },

      // B. Hoặc, tài liệu thỏa mãn các điều kiện truy cập khác
      {
        status: 'APPROVED', // Phải được duyệt
        OR: [
          // 1. Tài liệu KHÔNG có chia sẻ cụ thể VÀ `accessLevel` phù hợp
          {
            AND: [
              { permissions: { none: {} } }, // Ràng buộc cốt lõi
              { OR: generalAccessConditions },
            ],
          },
          // 2. Tài liệu CÓ chia sẻ cụ thể VÀ người dùng nằm trong danh sách
          {
            permissions: {
              some: {
                userId: currentUserId,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gte: new Date() } },
                ],
              },
            },
          },
        ],
      },
    ],
  };
}