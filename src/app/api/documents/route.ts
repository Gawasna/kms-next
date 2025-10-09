import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db';
import { supabaseAdminClient } from '@/lib/supabaseClient';
import { UserRole, AccessLevel } from '@prisma/client';
import { z } from 'zod';

const createDocumentSchema = z.object({
  title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự." }),
  description: z.string().optional(),
  accessLevel: z.nativeEnum(AccessLevel),
  categoryId: z.string().uuid().optional(),
  tags: z.string().nullable().optional().transform((val, ctx) => {
    if (!val) return [];
    try {
      return z.array(z.string().min(1)).parse(JSON.parse(val));
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dữ liệu 'tags' không hợp lệ." });
      return z.NEVER;
    }
  }),
  // Cập nhật schema cho permissions để khớp với dữ liệu client gửi lên
  permissions: z.string().nullable().optional().transform((val, ctx) => {
    if (!val) {
      return null; // Trả về null nếu không có permissions
    }
    try {
      const parsed = JSON.parse(val);
      // Validate cấu trúc mới của permissions
      return z.object({
        emails: z.array(z.string().email()),
        deadline: z.object({
          option: z.enum(['none', '30d', '60d', '90d', 'custom']),
          dates: z.array(z.string().datetime()).nullable(),
        }),
      }).parse(parsed);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dữ liệu 'permissions' không phải là chuỗi JSON hợp lệ.",
      });
      return z.NEVER;
    }
  }),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Bạn chưa được xác thực.' }, { status: 401 });
  }

  const { id: userId, role: userRole } = session.user;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ message: 'Vui lòng cung cấp file tài liệu.' }, { status: 400 });
  }

  const metadata = {
    title: formData.get('title'),
    tags: formData.get('tags'),
    description: formData.get('description'),
    accessLevel: formData.get('accessLevel'),
    categoryId: formData.get('categoryId'),
    permissions: formData.get('permissions'),
  };

  const validationResult = createDocumentSchema.safeParse(metadata);
  if (!validationResult.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ.', errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { title, description, accessLevel, categoryId, permissions, tags } = validationResult.data;

  // === Dùng Prisma Transaction để đảm bảo tính toàn vẹn dữ liệu ===
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Xử lý Tags (upsert)
      const tagConnectOrCreate = tags.map(tagName => ({
        where: { name: tagName.toLowerCase().trim() },
        create: { name: tagName.toLowerCase().trim() },
      }));

      // 2. Tạo KnowledgeEntry ban đầu
      const newEntry = await tx.knowledgeEntry.create({
        data: {
          title,
          description: description || null,
          authorId: userId,
          content: "",
          accessLevel,
          status: (userRole === UserRole.STUDENT) ? 'PENDING_REVIEW' : 'APPROVED',
          categoryId: categoryId || null,
          tags: {
            connectOrCreate: tagConnectOrCreate,
          }
        },
      });

      // 3. Upload file lên Supabase
      const fileExtension = file.name.split('.').pop();
      const newFileNameOnStorage = `${newEntry.id}.${fileExtension}`;

      if (!supabaseAdminClient) {
        throw new Error("Lỗi hệ thống: Supabase Admin Client không khả dụng.");
      }

      const { error: uploadError } = await supabaseAdminClient.storage
        .from('documents')
        .upload(newFileNameOnStorage, file);

      if (uploadError) {
        // Lỗi này sẽ tự động rollback transaction
        throw new Error(`Lỗi khi tải file lên: ${uploadError.message}`);
      }

      // 4. Cập nhật KnowledgeEntry với thông tin file
      const { data: { publicUrl } } = supabaseAdminClient.storage
        .from('documents')
        .getPublicUrl(newFileNameOnStorage);

      const updatedEntry = await tx.knowledgeEntry.update({
        where: { id: newEntry.id },
        data: {
          fileStorageUrl: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
        }
      });

      // 5. Xử lý và tạo các quyền truy cập đặc biệt
      let problematicEmails: string[] = [];
      if (accessLevel === 'STUDENT_ONLY' && permissions && permissions.emails.length > 0) {
        const lowercasedEmails = permissions.emails.map(e => e.toLowerCase());
        const usersToGrantAccess = await tx.user.findMany({
          where: {
            email: { in: lowercasedEmails },
            role: 'STUDENT' // Đảm bảo chỉ chia sẻ cho sinh viên
          },
          select: { id: true, email: true },
        });

        let expiresAt: Date | null = null;
        const { option, dates } = permissions.deadline;
        if (option !== 'none') {
          expiresAt = new Date();
          if (option === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
          else if (option === '60d') expiresAt.setDate(expiresAt.getDate() + 60);
          else if (option === '90d') expiresAt.setDate(expiresAt.getDate() + 90);
          else if (option === 'custom' && dates && dates.length > 1) {
            // Lấy ngày cuối cùng của RangePicker làm ngày hết hạn
            expiresAt = new Date(dates[1]);
          } else {
            expiresAt = null; // Reset nếu option là custom nhưng không có date
          }
        }

        if (usersToGrantAccess.length > 0) {
          const permissionData = usersToGrantAccess.map(user => ({
            knowledgeEntryId: newEntry.id,
            userId: user.id,
            expiresAt: expiresAt,
          }));

          await tx.accessPermission.createMany({
            data: permissionData,
            skipDuplicates: true, // Bỏ qua nếu quyền đã tồn tại
          });
        }

        // Xác định các email không tìm thấy hoặc không phải là sinh viên
        const foundEmails = usersToGrantAccess.map(u => u.email!.toLowerCase());
        problematicEmails = lowercasedEmails.filter(email => !foundEmails.includes(email));
      }

      return { updatedEntry, problematicEmails };
    });

    return NextResponse.json({
      message: 'Tải lên và tạo tài liệu thành công!',
      entry: result.updatedEntry,
      problematicEmails: result.problematicEmails.length > 0 ? result.problematicEmails : undefined
    }, { status: 201 });


  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: error.message || "Đã có lỗi xảy ra trong quá trình xử lý." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  const categoryId = searchParams.get('categoryId');

  // 1. Filter cơ bản luôn được áp dụng
  const baseFilters: any[] = [];
  if (keyword) {
    baseFilters.push({
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ]
    });
  }
  if (categoryId) {
    baseFilters.push({ categoryId });
  }

  // 2. Mệnh đề phân quyền chính
  let permissionClause: any;

  if (!currentUser) {
    // --- Guest (chưa đăng nhập) ---
    permissionClause = {
      status: 'APPROVED',
      accessLevel: 'PUBLIC',
      // Quan trọng: Guest không bao giờ có quyền cụ thể
      permissions: { none: {} }
    };
  } else {
    // --- Người dùng đã đăng nhập ---
    const { id: currentUserId, role: currentUserRole } = currentUser;

    if (currentUserRole === 'ADMIN') {
      // Admin thấy tất cả, không cần thêm điều kiện phân quyền
      permissionClause = {};
    } else {
      // Logic cho các vai trò khác (STUDENT, LECTURER)

      // Điều kiện cho quyền truy cập chung dựa trên vai trò của người dùng
      const generalAccessConditions: any[] = [{ accessLevel: 'PUBLIC' }];
      if (currentUserRole === UserRole.STUDENT || currentUserRole === UserRole.LECTURER) {
        generalAccessConditions.push({ accessLevel: 'STUDENT_ONLY' });
      }
      if (currentUserRole === UserRole.LECTURER) {
        generalAccessConditions.push({ accessLevel: 'LECTURER_ONLY' });
      }

      permissionClause = {
        OR: [
          // A. Người dùng là tác giả
          { authorId: currentUserId },

          // B. Hoặc, tài liệu thỏa mãn các điều kiện sau:
          {
            AND: [
              { status: 'APPROVED' }, // Tài liệu phải được duyệt
              {
                OR: [
                  // 1. Tài liệu KHÔNG có chia sẻ cụ thể VÀ `accessLevel` phù hợp
                  {
                    AND: [
                      { permissions: { none: {} } }, // Ràng buộc cốt lõi: KHÔNG có permission nào
                      { OR: generalAccessConditions } // VÀ accessLevel phải phù hợp
                    ]
                  },
                  // 2. Tài liệu CÓ chia sẻ cụ thể VÀ người dùng nằm trong danh sách
                  {
                    permissions: {
                      some: { // Phải có ÍT NHẤT MỘT permission...
                        userId: currentUserId, // ...cho chính người dùng này
                        OR: [ // ...và chưa hết hạn
                          { expiresAt: null },
                          { expiresAt: { gte: new Date() } }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      };
    }
  }

  // 3. Kết hợp các filter
  const whereClause = {
    AND: [
      ...baseFilters,
      permissionClause,
    ]
  };

  try {
    const documents = await prisma.knowledgeEntry.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true } },
        tags: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET Documents Error:", error);
    return NextResponse.json({ message: "Lỗi khi lấy danh sách tài liệu." }, { status: 500 });
  }
}