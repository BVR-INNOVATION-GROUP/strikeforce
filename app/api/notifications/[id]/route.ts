/**
 * API Route: PATCH /api/notifications/[id]
 * Update a notification (e.g., mark as read)
 */
import { NextRequest, NextResponse } from "next/server";
import { NotificationI } from "@/src/models/notification";
import { getUseMockData } from "@/src/utils/config";
import { updateItem } from "@/src/utils/fileHelpers.server";

/**
 * PATCH /api/notifications/[id]
 * Update a notification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (getUseMockData()) {
      const notificationsData = await import("@/src/data/mockNotifications.json");
      const notifications = notificationsData.default as NotificationI[];
      
      const notificationId = parseInt(id, 10);
      const notification = notifications.find((n) => n.id === notificationId);
      
      if (!notification) {
        return NextResponse.json(
          { error: `Notification ${id} not found` },
          { status: 404 }
        );
      }

      // Update notification
      const updatedNotification = await updateItem<NotificationI>(
        "mockNotifications.json",
        notificationId,
        {
          ...body,
          updatedAt: new Date().toISOString(),
        }
      );

      return NextResponse.json(updatedNotification);
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update notification: ${errorMessage}` },
      { status: 500 }
    );
  }
}

