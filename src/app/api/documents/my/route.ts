import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';

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
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: any = {
        authorId: userId, // Only fetch documents owned by the current user
    };

    // Add optional filters
    if (keyword) {
        whereConditions.OR = [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
        ];
    }

    if (categoryId) {
        whereConditions.categoryId = categoryId;
    }

    if (status) {
        whereConditions.status = status;
    }

    try {
        // Fetch documents and total count
        const [documents, totalCount] = await Promise.all([
            prisma.knowledgeEntry.findMany({
                where: whereConditions,
                include: {
                    category: { select: { id: true, name: true } },
                    tags: { select: { id: true, name: true } },
                    permissions: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.knowledgeEntry.count({
                where: whereConditions
            })
        ]);

        // Return documents with pagination metadata
        return NextResponse.json({
            documents,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return NextResponse.json(
            { message: "Đã xảy ra lỗi khi truy vấn danh sách tài liệu." }, 
            { status: 500 }
        );
    }
}

// Add ability to delete documents
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
    const documentId = searchParams.get('id');

    if (!documentId) {
        return NextResponse.json(
            { message: 'Thiếu ID tài liệu.' }, 
            { status: 400 }
        );
    }

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

        // Only allow deletion if user is the author or an admin
        if (document.authorId !== userId && userRole !== UserRole.ADMIN) {
            return NextResponse.json(
                { message: 'Bạn không có quyền xóa tài liệu này.' }, 
                { status: 403 }
            );
        }

        // Delete the document
        await prisma.knowledgeEntry.delete({
            where: { id: documentId }
        });

        return NextResponse.json(
            { message: 'Xóa tài liệu thành công.' }
        );
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { message: "Đã xảy ra lỗi khi xóa tài liệu." }, 
            { status: 500 }
        );
    }
}

// Add ability to update document status (e.g., change from DRAFT to APPROVED)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return NextResponse.json(
            { message: 'Bạn chưa đăng nhập.' }, 
            { status: 401 }
        );
    }

    const { id: userId, role: userRole } = session.user;
    const body = await req.json();
    const { id: documentId, status, accessLevel } = body;

    if (!documentId) {
        return NextResponse.json(
            { message: 'Thiếu ID tài liệu.' }, 
            { status: 400 }
        );
    }

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
                { message: 'Bạn không có quyền cập nhật tài liệu này.' }, 
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        
        if (status) {
            // For students, they can only change status to PENDING_REVIEW
            if (userRole === UserRole.STUDENT && status !== 'PENDING_REVIEW' && status !== 'DRAFT') {
                return NextResponse.json(
                    { message: 'Sinh viên chỉ có thể gửi tài liệu để duyệt hoặc lưu nháp.' }, 
                    { status: 403 }
                );
            }
            updateData.status = status;
        }

        if (accessLevel) {
            updateData.accessLevel = accessLevel;
        }

        // Update the document
        const updatedDocument = await prisma.knowledgeEntry.update({
            where: { id: documentId },
            data: updateData
        });

        return NextResponse.json({
            message: 'Cập nhật tài liệu thành công.',
            document: updatedDocument
        });
    } catch (error) {
        console.error("Error updating document:", error);
        return NextResponse.json(
            { message: "Đã xảy ra lỗi khi cập nhật tài liệu." }, 
            { status: 500 }
        );
    }
}