// src/app/api/documents/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { supabaseAdminClient } from '@/lib/supabaseClient'; // Dùng admin client để có toàn quyền
import { UserRole, AccessLevel } from '@prisma/client';
import { z } from 'zod';

// Zod schema để validate metadata từ FormData
const createDocumentSchema = z.object({
  title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự." }),
  description: z.string().optional(),
  accessLevel: z.nativeEnum(AccessLevel),
  categoryId: z.string().uuid().optional(),
  tags: z.string().nullable().optional().transform((val, ctx) => { // Thêm .nullable() và sửa logic
    if (!val) return [];
    try {
      // Validate nó là một mảng các chuỗi không rỗng
      return z.array(z.string().min(1)).parse(JSON.parse(val));
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dữ liệu 'tags' không hợp lệ." });
      return z.NEVER;
    }
  }),
   permissions: z.string().nullable().optional().transform((val, ctx) => { // <--- THÊM .nullable()
    if (!val) { // val bây giờ có thể là null hoặc undefined
      return [];
    }
    try {
      const parsed = JSON.parse(val);
      // Validate cấu trúc của permissions array
      return z.array(z.object({
        email: z.string().email(),
        expiresInDays: z.number().int().positive().optional()
      })).parse(parsed);
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
  // --- 1. Xác thực người dùng ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Bạn chưa được xác thực.' }, { status: 401 });
  }

  const { id: userId, role: userRole } = session.user;

  // --- 2. Xử lý FormData ---
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  
  if (!file) {
    return NextResponse.json({ message: 'Vui lòng cung cấp file tài liệu.' }, { status: 400 });
  }

  // --- 3. Validate Metadata ---
  const metadata = {
    title: formData.get('title'),
    tags: formData.get('tags'), // Lấy trường tags
    description: formData.get('description'),
    accessLevel: formData.get('accessLevel'),
    categoryId: formData.get('categoryId'),
    permissions: formData.get('permissions'), // Đây là chuỗi JSON
  };

  const validationResult = createDocumentSchema.safeParse(metadata);
  if (!validationResult.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ.', errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { title, description, accessLevel, categoryId, permissions, tags } = validationResult.data;

  // --- LOGIC XỬ LÝ TAGS (UPSERT) ---
  const tagConnectOrCreate = tags.map(tagName => ({
    where: { name: tagName.toLowerCase().trim() },
    create: { name: tagName.toLowerCase().trim() },
  }));

  // --- 4. Tạo KnowledgeEntry trong DB trước để lấy ID ---
  let newEntry;
  try {
    newEntry = await prisma.knowledgeEntry.create({
      data: {
        title,
        description: description || null,
        authorId: userId,
        content: "",
        accessLevel,
        status: (userRole === UserRole.STUDENT) ? 'PENDING_REVIEW' : 'APPROVED',
        categoryId: categoryId || null,
        tags: {
          connectOrCreate: tagConnectOrCreate, // Logic upsert tag và connect
        }
      },
    });
  } catch (dbError) {
    console.error("DB Create Error:", dbError);
    return NextResponse.json({ message: "Lỗi khi tạo bản ghi tài liệu." }, { status: 500 });
  }

  // --- 5. Upload file lên Supabase Storage với tên file là ID của entry ---
  const fileExtension = file.name.split('.').pop();
  const newFileNameOnStorage = `${newEntry.id}.${fileExtension}`;

  if (!supabaseAdminClient) {
    await prisma.knowledgeEntry.delete({ where: { id: newEntry.id } });
    console.error("Supabase Admin Client is null.");
    return NextResponse.json({ message: "Lỗi hệ thống: Supabase Admin Client không khả dụng." }, { status: 500 });
  }

  const { error: uploadError } = await supabaseAdminClient.storage
    .from('documents')
    .upload(newFileNameOnStorage, file);

  if (uploadError) {
    // Nếu upload lỗi, xóa entry đã tạo để tránh rác
    await prisma.knowledgeEntry.delete({ where: { id: newEntry.id } });
    console.error("Supabase Upload Error:", uploadError);
    return NextResponse.json({ message: "Lỗi khi tải file lên." }, { status: 500 });
  }

  // --- 6. Cập nhật KnowledgeEntry với thông tin file ---
  let publicUrl: string | null = null;
  if (supabaseAdminClient) {
    const { data } = supabaseAdminClient.storage
      .from('documents')
      .getPublicUrl(newFileNameOnStorage);
    publicUrl = data?.publicUrl ?? null;
  } else {
    // Nếu không có supabaseAdminClient, trả về lỗi
    await prisma.knowledgeEntry.delete({ where: { id: newEntry.id } });
    console.error("Supabase Admin Client is null.");
    return NextResponse.json({ message: "Lỗi hệ thống: Supabase Admin Client không khả dụng." }, { status: 500 });
  }

  const updatedEntry = await prisma.knowledgeEntry.update({
    where: { id: newEntry.id },
    data: {
      fileStorageUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
    }
  });

  // --- 7. Xử lý và tạo các quyền truy cập đặc biệt ---
  if (permissions && permissions.length > 0) {
    const emailsToFind = permissions.map(p => p.email);
    const usersToGrantAccess = await prisma.user.findMany({
      where: { email: { in: emailsToFind } },
      select: { id: true, email: true },
    });

    const permissionData = usersToGrantAccess.map(user => {
      const permissionInfo = permissions.find(p => p.email === user.email);
      let expiresAt: Date | null = null;
      if (permissionInfo?.expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + permissionInfo.expiresInDays);
      }
      return {
        knowledgeEntryId: newEntry.id,
        userId: user.id,
        expiresAt,
      };
    });

    if (permissionData.length > 0) {
      await prisma.accessPermission.createMany({
        data: permissionData,
      });
    }
  }

  return NextResponse.json({ message: 'Tải lên và tạo tài liệu thành công!', entry: updatedEntry }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    // Lấy các tham số filter từ URL
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('categoryId');
    // Thêm các filter khác nếu cần

    // === XÂY DỰNG LOGIC TRUY VẤN PHÂN QUYỀN ===
    let whereClause: any = {};
    const baseFilters: any[] = [];

    // Filter theo keyword nếu có
    if (keyword) {
        baseFilters.push({
            OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ]
        });
    }

    // Filter theo category nếu có
    if (categoryId) {
        baseFilters.push({ categoryId });
    }

    if (currentUser) {
        // --- Người dùng đã đăng nhập ---
        const permissionChecks = {
            OR: [
                // 1. Luôn thấy tài liệu của chính mình (bất kể status)
                { authorId: currentUser.id },
                
                // 2. Thấy tài liệu đã được duyệt dựa trên accessLevel
                {
                    status: 'APPROVED',
                    OR: [
                        { accessLevel: 'PUBLIC' },
                        {
                            accessLevel: 'STUDENT_ONLY',
                            // Role của người request phải là STUDENT, LECTURER, hoặc ADMIN
                            // Điều này khó kiểm tra trực tiếp trong DB, thường logic này sẽ nằm ở hàm SQL.
                            // Nhưng chúng ta có thể giả định vai trò của currentUser để lọc
                            AND: currentUser.role !== 'GUEST_ROLE' ? [{}] : [{ id: { not: currentUser.id } }] // Trick để thêm điều kiện
                        },
                        {
                            accessLevel: 'LECTURER_ONLY',
                            AND: (currentUser.role === 'LECTURER' || currentUser.role === 'ADMIN') ? [{}] : [{ id: { not: currentUser.id } }]
                        },
                    ]
                },
                
                // 3. Thấy tài liệu được cấp quyền đặc biệt
                {
                    permissions: {
                        some: {
                            AND: [
                                { expiresAt: { gte: new Date() } }, // Hoặc null (chưa xử lý ở đây)
                                {
                                    OR: [
                                        { userId: currentUser.id },
                                        { grantedToRole: currentUser.role }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        };
        whereClause = { AND: [...baseFilters, permissionChecks] };

    } else {
        // --- Guest (chưa đăng nhập) ---
        whereClause = {
            AND: [
                ...baseFilters,
                { status: 'APPROVED' },
                { accessLevel: 'PUBLIC' }
            ]
        };
    }

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
            take: 20, // Thêm phân trang
        });

        return NextResponse.json(documents);

    } catch (error) {
        console.error("Get Documents Error:", error);
        return NextResponse.json({ message: "Lỗi khi lấy danh sách tài liệu." }, { status: 500 });
    }
}