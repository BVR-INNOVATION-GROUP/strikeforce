/**
 * API Route: GET /api/notifications
 * Get notifications for a user
 * POST /api/notifications
 * Create a new notification
 */
import { NextRequest, NextResponse } from "next/server";
import { NotificationI } from "@/src/models/notification";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/notifications?userId=123
 * Get all notifications for a specific user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const notificationsData = await import("@/src/data/mockNotifications.json");
      const notifications = notificationsData.default as NotificationI[];
      
      // Filter notifications for the specific user
      const numericUserId = parseInt(userId, 10);
      const userNotifications = notifications.filter((n) => n.userId === numericUserId);
      
      return NextResponse.json(userNotifications);
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch notifications: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, link } = body;

    // Validate required fields
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["success", "info", "alert", "error"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
      
      const newNotification = await createItem<NotificationI>("mockNotifications.json", {
        userId: numericUserId,
        type: type || "info",
        title: title.trim(),
        message: message.trim(),
        read: false,
        link: link || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<NotificationI, "id">);

      return NextResponse.json(newNotification, { status: 201 });
    } else {
      // Production mode - create notification via database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create notification: ${errorMessage}` },
      { status: 500 }
    );
  }
}



