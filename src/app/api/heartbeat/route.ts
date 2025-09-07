// src/app/api/heartbeat/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { guestId } = await req.json(); // Nhận guestId từ client (nếu có)

    if (session && session.user?.id) {
      // Người dùng đã đăng nhập: Cập nhật lastActive cho User
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastActive: new Date() },
      });
      return NextResponse.json({ message: 'User heartbeat updated.' }, { status: 200 });
    } else if (guestId) {
      // Người dùng là khách: Cập nhật hoặc tạo GuestSession
      await prisma.guestSession.upsert({
        where: { id: guestId },
        update: { lastActive: new Date() }, // Cập nhật thời gian hoạt động
        create: { id: guestId, lastActive: new Date() }, // Tạo mới nếu chưa có
      });
      return NextResponse.json({ message: 'Guest heartbeat updated.' }, { status: 200 });
    } else {
      // Không có thông tin để theo dõi
      return NextResponse.json({ message: 'No valid user or guest ID provided.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Heartbeat API error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 phút tính bằng milliseconds

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Kiểm tra quyền admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    const now = new Date();
    const activeThreshold = new Date(now.getTime() - ACTIVE_THRESHOLD);
    
    // Lấy người dùng đăng nhập đang hoạt động
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActive: { gte: activeThreshold }
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActive: true,
        role: true,
        image: true
      },
      orderBy: { lastActive: 'desc' }
    });
    
    // Lấy khách vãng lai đang hoạt động
    const activeGuests = await prisma.guestSession.findMany({
      where: {
        lastActive: { gte: activeThreshold }
      },
      orderBy: { lastActive: 'desc' }
    });
    
    return NextResponse.json({
      activeUsers,
      activeGuests,
      totalActive: activeUsers.length + activeGuests.length
    });
    
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}