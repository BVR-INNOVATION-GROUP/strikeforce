/**
 * Repository for user settings data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";

export interface UserSettingsI {
  userId: string;
  notifications: {
    emailNotifications: boolean;
    milestoneUpdates: boolean;
    projectApplications: boolean;
    paymentAlerts: boolean;
    weeklyReports: boolean;
  };
  accountSettings: {
    language: string;
    timezone: string;
    currency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
  };
  updatedAt: string;
}

export const userSettingsRepository = {
  /**
   * Get user settings by user ID
   */
  getByUserId: async (userId: string): Promise<UserSettingsI | null> => {
    return api.get<UserSettingsI | null>(`/api/v1/users/${userId}/settings`);
  },

  /**
   * Update user settings
   */
  update: async (
    userId: string,
    settings: Partial<UserSettingsI>
  ): Promise<UserSettingsI> => {
    return api.put<UserSettingsI>(`/api/v1/users/${userId}/settings`, settings);
  },
};
