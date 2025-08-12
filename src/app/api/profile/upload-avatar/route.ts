// src/app/api/profile/upload-avatar/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { supabaseAdminClient } from '@/lib/supabaseClient';
import sharp from 'sharp';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RESIZE_WIDTH = 512;

export async function POST(req: Request) {

  if (!supabaseAdminClient) {
    return NextResponse.json({ message: 'Cấu hình Supabase Admin bị thiếu.' }, { status: 500 });
  }

  try {
    // 1. Xác thực người dùng
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Bạn chưa được xác thực.' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Lấy dữ liệu file từ FormData
    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Không có file nào được tải lên.' }, { status: 400 });
    }

    // 3. Kiểm tra file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'Kích thước file phải nhỏ hơn 2MB.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Chỉ chấp nhận file JPEG, PNG, hoặc WebP.' }, { status: 400 });
    }

    // 4. Xử lý ảnh: Resize và nén
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const processedImageBuffer = await sharp(fileBuffer)
      .resize(RESIZE_WIDTH)
      .webp({ quality: 80 })
      .toBuffer();

    // 5. Xóa TẤT CẢ ảnh cũ trong thư mục của user
    try {
      const { data: existingFiles, error: listError } = await supabaseAdminClient.storage
        .from('avatars')
        .list(`${userId}`);

      if (listError) {
        console.error('Lỗi khi liệt kê ảnh cũ:', listError);
      } else if (existingFiles && existingFiles.length > 0) {
        // Tạo danh sách đường dẫn các file cần xóa
        const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
        const { error: deleteError } = await supabaseAdminClient.storage
          .from('avatars')
          .remove(filesToDelete);
          
        if (deleteError) {
          console.error('Lỗi khi xóa các ảnh cũ:', deleteError);
        } else {
          console.log(`Đã xóa ${filesToDelete.length} ảnh cũ của user ${userId}`);
        }
      }
    } catch (removeError) {
      console.error('Lỗi khi xóa ảnh cũ:', removeError);
    }

    // 6. Tải ảnh mới lên Supabase
    const newFilePath = `${userId}/${Date.now()}.webp`;
    const { data: uploadData, error: uploadError } = await supabaseAdminClient.storage
      .from('avatars')
      .upload(newFilePath, processedImageBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ message: 'Lỗi khi tải ảnh lên.' }, { status: 500 });
    }

    // 7. Lấy public URL của ảnh mới
    const { data: { publicUrl } } = supabaseAdminClient.storage
      .from('avatars')
      .getPublicUrl(newFilePath);

    if (!publicUrl) {
      return NextResponse.json({ message: 'Không thể lấy URL ảnh.' }, { status: 500 });
    }

    // 8. Cập nhật URL ảnh trong database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: publicUrl },
      select: { image: true },
    });

    return NextResponse.json({
      message: 'Cập nhật ảnh đại diện thành công!',
      newAvatarUrl: updatedUser.image,
    }, { status: 200 });

  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi không mong muốn.' }, { status: 500 });
  }
}

// Thêm hàm DELETE để xóa avatar nếu cần
export async function DELETE(req: Request) {

  if (!supabaseAdminClient) {
    return NextResponse.json({ message: 'Cấu hình Supabase Admin bị thiếu.' }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Bạn chưa đăng nhập.' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 1. Xóa tất cả file trong thư mục của user
    const { data: existingFiles, error: listError } = await supabaseAdminClient.storage
      .from('avatars')
      .list(`${userId}`);
      
    if (listError) {
      console.error('Lỗi khi liệt kê ảnh:', listError);
    } else if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
      
      const { error: deleteError } = await supabaseAdminClient.storage
        .from('avatars')
        .remove(filesToDelete);
        
      if (deleteError) {
        throw deleteError;
      }
    }
    
    // 2. Cập nhật database
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return NextResponse.json({ message: 'Xóa ảnh đại diện thành công.' }, { status: 200 });

  } catch (error) {
    console.error('Delete avatar error:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa ảnh đại diện.' }, { status: 500 });
  }
}