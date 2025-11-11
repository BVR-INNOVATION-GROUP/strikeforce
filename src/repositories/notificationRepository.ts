/**
 * Repository for notification data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { NotificationI } from "@/src/models/notification";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const notificationRepository = {
  /**
   * Get all notifications for a specific user
   * @param userId - User ID to fetch notifications for
   * @returns Array of notifications for the user
   */
  getByUserId: async (userId: string | number): Promise<NotificationI[]> => {
    if (getUseMockData()) {
      const notifications = await readJsonFile<NotificationI>("mockNotifications.json");
      // Filter notifications for the specific user
      const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
      return notifications.filter((n) => n.userId === numericUserId);
    }
    return api.get<NotificationI[]>(`/api/notifications?userId=${userId}`);
  },

  /**
   * Get notification by ID
   * @param id - Notification ID
   * @returns Notification if found
   */
  getById: async (id: string | number): Promise<NotificationI> => {
    if (getUseMockData()) {
      const notifications = await readJsonFile<NotificationI>("mockNotifications.json");
      const notification = findById(notifications, id);
      if (!notification) {
        throw new Error(`Notification ${id} not found`);
      }
      return notification;
    }
    return api.get<NotificationI>(`/api/notifications/${id}`);
  },

  /**
   * Mark notification as read
   * @param id - Notification ID
   * @returns Updated notification
   */
  markAsRead: async (id: string | number): Promise<NotificationI> => {
    if (getUseMockData()) {
      // Always use API route for updates (even in mock mode) - API routes handle file operations server-side
      return api.patch<NotificationI>(`/api/notifications/${id}`, { read: true });
    }
    return api.patch<NotificationI>(`/api/notifications/${id}`, { read: true });
  },

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Updated notifications count
   */
  markAllAsRead: async (userId: string | number): Promise<void> => {
    // Always use API route for updates
    return api.patch(`/api/notifications/mark-all-read`, { userId });
  },

  /**
   * Create new notification
   * @param notification - Notification data
   * @returns Created notification
   */
  create: async (notification: Partial<NotificationI>): Promise<NotificationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<NotificationI>("/api/notifications", notification);
  },
};



