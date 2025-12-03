/**
 * Repository for notification data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { NotificationI } from "@/src/models/notification";

export const notificationRepository = {
  /**
   * Get all notifications for current user
   * Backend endpoint: GET /api/v1/notifications
   */
  getAll: async (): Promise<NotificationI[]> => {
    return api.get<NotificationI[]>("/api/v1/notifications");
  },

  /**
   * Get all notifications for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   * @returns Array of notifications for the current user
   */
  getByUserId: async (): Promise<NotificationI[]> => {
    return api.get<NotificationI[]>("/api/v1/notifications");
  },

  /**
   * Get notification by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<NotificationI> => {
    return api.get<NotificationI>(`/api/v1/notifications/${id}`);
  },

  /**
   * Mark notification as seen
   * Backend endpoint: PUT /api/v1/notifications/:notification
   */
  markAsRead: async (id: string | number): Promise<NotificationI> => {
    return api.put<NotificationI>(`/api/v1/notifications/${id}`, {});
  },

  /**
   * Mark all notifications as read for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  markAllAsRead: async (): Promise<void> => {
    return api.patch(`/api/v1/notifications/mark-all-read`, {});
  },

  /**
   * Create new notification
   * Backend endpoint: POST /api/v1/notifications
   */
  create: async (notification: Partial<NotificationI>): Promise<NotificationI> => {
    return api.post<NotificationI>("/api/v1/notifications", notification);
  },
};




