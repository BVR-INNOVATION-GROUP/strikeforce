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

import { getUseMockData } from "@/src/utils/config";

export const userSettingsRepository = {
  /**
   * Get user settings by user ID
   */
  getByUserId: async (userId: string): Promise<UserSettingsI | null> => {
    if (getUseMockData()) {
      const mockData = await import("@/src/data/mockUserSettings.json");
      const settings = mockData.default as UserSettingsI[];
      const userSettings = settings.find((s) => s.userId === userId);
      return userSettings || null;
    }
    return api.get<UserSettingsI | null>(`/api/users/${userId}/settings`);
  },

  /**
   * Update user settings
   */
  update: async (
    userId: string,
    settings: Partial<UserSettingsI>
  ): Promise<UserSettingsI> => {
    if (getUseMockData()) {
      const existing = await userSettingsRepository.getByUserId(userId);
      const updated = {
        userId,
        ...existing,
        ...settings,
        updatedAt: new Date().toISOString(),
      } as UserSettingsI;
      // In production, would persist to mock store or API
      return updated;
    }
    return api.put<UserSettingsI>(`/api/users/${userId}/settings`, settings);
  },
};
