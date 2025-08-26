// src/lib/permissionUtils.ts

import { User } from 'next-auth'; // Hoặc kiểu User của bạn
import { UserRole } from '@prisma/client';

// Kiểu dữ liệu đơn giản hóa cho currentUser
type CurrentUser = Pick<User, 'id' | 'role'>;

export function buildPermissionClause(currentUser?: CurrentUser) {
  if (!currentUser) {
    // --- Guest (chưa đăng nhập) ---
    return {
      status: 'APPROVED',
      accessLevel: 'PUBLIC',
    };
  }

  // --- Người dùng đã đăng nhập ---
  const { id: currentUserId, role: currentUserRole } = currentUser;

  if (currentUserRole === UserRole.ADMIN) {
    // Admin thấy tất cả
    return {};
  }

  // Logic cho các vai trò khác (STUDENT, LECTURER)
  const generalAccessRoles: any[] = [{ accessLevel: 'PUBLIC' }];
  if (currentUserRole === UserRole.STUDENT || currentUserRole === UserRole.LECTURER) {
    generalAccessRoles.push({ accessLevel: 'STUDENT_ONLY' });
  }
  if (currentUserRole === UserRole.LECTURER) {
    generalAccessRoles.push({ accessLevel: 'LECTURER_ONLY' });
  }

  return {
    OR: [
      // A. Người dùng là tác giả
      { authorId: currentUserId },

      // B. Hoặc, tài liệu thỏa mãn các điều kiện sau:
      {
        status: 'APPROVED',
        OR: [
          // 1. Tài liệu KHÔNG có chia sẻ cụ thể VÀ `accessLevel` phù hợp
          {
            AND: [
              { permissions: { none: {} } },
              { OR: generalAccessRoles },
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