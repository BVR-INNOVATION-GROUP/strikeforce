/**
 * API Route: PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
import { NextRequest, NextResponse } from "next/server";
import { NotificationI } from "@/src/models/notification";
import { getUseMockData } from "@/src/utils/config";
import { updateItem } from "@/src/utils/fileHelpers.server";

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const notificationsData = await import("@/src/data/mockNotifications.json");
      const notifications = notificationsData.default as NotificationI[];
      
      const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
      
      // Find all unread notifications for the user
      const userNotifications = notifications.filter(
        (n) => n.userId === numericUserId && !n.read
      );

      // Mark all as read
      const updatePromises = userNotifications.map((notification) =>
        updateItem<NotificationI>("mockNotifications.json", notification.id, {
          read: true,
          updatedAt: new Date().toISOString(),
        })
      );

      await Promise.all(updatePromises);

      return NextResponse.json({ 
        message: `Marked ${userNotifications.length} notifications as read` 
      });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to mark notifications as read: ${errorMessage}` },
      { status: 500 }
    );
  }
}



