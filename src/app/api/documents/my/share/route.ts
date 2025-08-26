import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Schema for validating permissions input
const sharePermissionSchema = z.object({
  emails: z.array(z.string().email({
    message: "Địa chỉ email không hợp lệ"
  })),
  deadline: z.object({
    option: z.enum(['none', '30d', '60d', '90d', 'custom']),
    dates: z.string().datetime().nullable().optional(),
  }),
});

// Get shared permissions for a specific document
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Bạn chưa đăng nhập.' }, 
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = session.user;
  
  // Get document ID from query params
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json(
      { message: 'Thiếu ID tài liệu.' }, 
      { status: 400 }
    );
  }

  try {
    // First check if the document exists and belongs to the user
    const document = await prisma.knowledgeEntry.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Không tìm thấy tài liệu.' }, 
        { status: 404 }
      );
    }

    // Verify the document belongs to the user or user is admin
    if (document.authorId !== userId && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Bạn không có quyền quản lý chia sẻ cho tài liệu này.' }, 
        { status: 403 }
      );
    }

    // Get all shared permissions for this document
    const permissions = await prisma.accessPermission.findMany({
      where: { 
        knowledgeEntryId: documentId,
        userId: { not: null } // Only get user-specific permissions
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        accessLevel: document.accessLevel
      },
      permissions
    });
  } catch (error) {
    console.error("Error fetching document permissions:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi truy vấn thông tin chia sẻ." }, 
      { status: 500 }
    );
  }
}

// Update shared permissions for a document
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Bạn chưa đăng nhập.' }, 
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = session.user;
  const body = await req.json();
  const { documentId, permissions } = body;

  if (!documentId) {
    return NextResponse.json(
      { message: 'Thiếu ID tài liệu.' }, 
      { status: 400 }
    );
  }

  // Validate permissions data
  const permissionsValidation = sharePermissionSchema.safeParse(permissions);
  if (!permissionsValidation.success) {
    return NextResponse.json(
      { 
        message: 'Dữ liệu chia sẻ không hợp lệ.',
        errors: permissionsValidation.error.flatten() 
      }, 
      { status: 400 }
    );
  }

  const validatedPermissions = permissionsValidation.data;

  try {
    // Check if document exists and belongs to the user
    const document = await prisma.knowledgeEntry.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Không tìm thấy tài liệu.' }, 
        { status: 404 }
      );
    }

    // Only allow updates if user is the author or an admin
    if (document.authorId !== userId && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Bạn không có quyền quản lý chia sẻ cho tài liệu này.' }, 
        { status: 403 }
      );
    }

    // Verify that document access level allows for user-specific sharing
    if (document.accessLevel !== 'STUDENT_ONLY' && document.accessLevel !== 'PRIVATE') {
      return NextResponse.json(
        { message: 'Chỉ có thể chia sẻ tài liệu có mức truy cập "Chỉ sinh viên" hoặc "Riêng tư".' }, 
        { status: 400 }
      );
    }

    // Calculate expiration date based on option
    let expiresAt: Date | null = null;
    
    if (validatedPermissions.deadline.option !== 'none') {
      expiresAt = new Date();
      
      switch (validatedPermissions.deadline.option) {
        case '30d':
          expiresAt.setDate(expiresAt.getDate() + 30);
          break;
        case '60d':
          expiresAt.setDate(expiresAt.getDate() + 60);
          break;
        case '90d':
          expiresAt.setDate(expiresAt.getDate() + 90);
          break;
        case 'custom':
          if (validatedPermissions.deadline.dates) {
            expiresAt = new Date(validatedPermissions.deadline.dates);
          }
          break;
      }
    }

    // Find users with the provided emails (only students)
    const users = await prisma.user.findMany({
      where: { 
        email: { in: validatedPermissions.emails },
        role: UserRole.STUDENT
      },
      select: { id: true, email: true }
    });

    // Start transaction to handle all permission changes
    await prisma.$transaction(async (tx) => {
      // 1. Remove all existing permissions for this document
      await tx.accessPermission.deleteMany({
        where: { 
          knowledgeEntryId: documentId,
          userId: { not: null } // Only delete user-specific permissions
        }
      });

      // 2. Create new permissions for found users
      if (users.length > 0) {
        const permissionsToCreate = users.map(user => ({
          knowledgeEntryId: documentId,
          userId: user.id,
          expiresAt: expiresAt
        }));

        await tx.accessPermission.createMany({
          data: permissionsToCreate
        });
      }
    });

    // Find emails that weren't matched to student accounts
    const foundEmails = users.map(u => u.email);
    const notFoundEmails = validatedPermissions.emails.filter(
      email => !foundEmails.includes(email)
    );

    return NextResponse.json({
      message: 'Cập nhật chia sẻ tài liệu thành công.',
      sharedCount: users.length,
      notFoundEmails: notFoundEmails.length > 0 ? notFoundEmails : null
    });
  } catch (error) {
    console.error("Error updating document permissions:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật chia sẻ tài liệu." }, 
      { status: 500 }
    );
  }
}

// Remove a specific user permission
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Bạn chưa đăng nhập.' }, 
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = session.user;
  const { searchParams } = new URL(req.url);
  const permissionId = searchParams.get('permissionId');
  
  if (!permissionId) {
    return NextResponse.json(
      { message: 'Thiếu ID quyền truy cập.' }, 
      { status: 400 }
    );
  }

  try {
    // First get the permission to check if it exists and get document ID
    const permission = await prisma.accessPermission.findUnique({
      where: { id: permissionId },
      include: {
        knowledgeEntry: {
          select: { authorId: true }
        }
      }
    });

    if (!permission) {
      return NextResponse.json(
        { message: 'Không tìm thấy quyền truy cập.' }, 
        { status: 404 }
      );
    }

    // Check if user is authorized to modify this permission
    if (permission.knowledgeEntry.authorId !== userId && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Bạn không có quyền xóa quyền chia sẻ này.' }, 
        { status: 403 }
      );
    }

    // Delete the permission
    await prisma.accessPermission.delete({
      where: { id: permissionId }
    });

    return NextResponse.json({
      message: 'Đã xóa quyền truy cập thành công.'
    });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi xóa quyền truy cập." }, 
      { status: 500 }
    );
  }
}