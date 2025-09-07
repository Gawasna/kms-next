import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db';
import { z } from "zod";

// Schema for validation
const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["NOTI", "BANNER"]),
  isPublic: z.boolean().default(true),
  userId: z.string().optional(),
});

// POST endpoint to create a new notification (admin only)
export async function POST(req: NextRequest) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create notifications" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request data
    const validatedData = notificationSchema.parse(body);
    
    // Create notification in database
    const notification = await prisma.notification.create({
      data: validatedData,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch notifications
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    
    // If specific type is requested, return appropriate notifications
    if (type === "BANNER" || type === "NOTI") {
      const limit = type === "BANNER" ? 4 : 7;
      
      const notifications = await prisma.notification.findMany({
        where: {
          type,
          isPublic: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });
      
      return NextResponse.json(notifications);
    }
    
    // If no specific type, return both types with appropriate limits
    const banners = await prisma.notification.findMany({
      where: {
        type: "BANNER",
        isPublic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });
    
    const notifications = await prisma.notification.findMany({
      where: {
        type: "NOTI",
        isPublic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 7,
    });
    
    return NextResponse.json({
      banners,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// For deleting notifications (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete notifications" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

// For updating notifications (admin only)
export async function PATCH(req: NextRequest) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update notifications" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Validate update data
    const validatedData = notificationSchema.partial().parse(updateData);

    const notification = await prisma.notification.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}