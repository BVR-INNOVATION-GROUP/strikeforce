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

// Environment configuration
// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const userSettingsRepository = {
  /**
   * Get user settings by user ID
   */
  getByUserId: async (userId: string): Promise<UserSettingsI | null> => {
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
