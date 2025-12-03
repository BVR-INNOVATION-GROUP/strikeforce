/**
 * Notification model - represents user notifications in the system
 */
export type NotificationType = "success" | "info" | "alert" | "error";

export interface NotificationI {
  id: number;
  userId: number; // User who receives this notification
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string; // Optional link to related resource (e.g., project, milestone)
  createdAt: string;
  updatedAt: string;
}




