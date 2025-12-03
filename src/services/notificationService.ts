/**
 * Service layer for notification business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { notificationRepository } from "@/src/repositories/notificationRepository";
import { NotificationI } from "@/src/models/notification";

export const notificationService = {
  /**
   * Get all notifications for the authenticated user, sorted by most recent first
   * Backend uses JWT token's user_id - never pass userId parameter
   * @returns Sorted array of notifications
   */
  getUserNotifications: async (): Promise<NotificationI[]> => {
    const notifications = await notificationRepository.getByUserId();
    
    // Sort by most recent first (createdAt descending)
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  },

  /**
   * Get unread notifications count for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   * @returns Count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    const notifications = await notificationRepository.getByUserId();
    return notifications.filter((n) => !n.read).length;
  },

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   * @returns Updated notification
   */
  markAsRead: async (notificationId: string | number): Promise<NotificationI> => {
    return notificationRepository.markAsRead(notificationId);
  },

  /**
   * Mark all notifications as read for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  markAllAsRead: async (): Promise<void> => {
    return notificationRepository.markAllAsRead();
  },

  /**
   * Create a new notification
   * @param notificationData - Notification data to create
   * @returns Created notification
   */
  createNotification: async (
    notificationData: Partial<NotificationI>
  ): Promise<NotificationI> => {
    // Business validation
    if (!notificationData.userId) {
      throw new Error("User ID is required for notification");
    }

    if (!notificationData.title || notificationData.title.trim().length === 0) {
      throw new Error("Notification title is required");
    }

    if (!notificationData.message || notificationData.message.trim().length === 0) {
      throw new Error("Notification message is required");
    }

    // Transform data for storage
    const transformedData: Partial<NotificationI> = {
      ...notificationData,
      type: notificationData.type || "info",
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return notificationRepository.create(transformedData);
  },
};




