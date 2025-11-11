/**
 * Service layer for user settings business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import {
  userSettingsRepository,
  UserSettingsI,
} from "@/src/repositories/userSettingsRepository";

export const userSettingsService = {
  /**
   * Get user settings with defaults
   */
  getUserSettings: async (userId: string): Promise<UserSettingsI> => {
    const settings = await userSettingsRepository.getByUserId(userId);

    // Return default settings if none found
    if (!settings) {
      return {
        userId,
        notifications: {
          emailNotifications: true,
          milestoneUpdates: true,
          projectApplications: true,
          paymentAlerts: true,
          weeklyReports: false,
        },
        accountSettings: {
          language: "en",
          timezone: "UTC",
          currency: "USD",
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: "30",
        },
        updatedAt: new Date().toISOString(),
      };
    }

    return settings;
  },

  /**
   * Update user settings with validation
   */
  updateSettings: async (
    userId: string,
    settings: Partial<UserSettingsI>
  ): Promise<UserSettingsI> => {
    // Business validation
    if (
      settings.security?.sessionTimeout &&
      (parseInt(settings.security.sessionTimeout) < 5 ||
        parseInt(settings.security.sessionTimeout) > 480)
    ) {
      throw new Error("Session timeout must be between 5 and 480 minutes");
    }

    const validLanguages = ["en", "es", "fr"];
    if (
      settings.accountSettings?.language &&
      !validLanguages.includes(settings.accountSettings.language)
    ) {
      throw new Error("Invalid language selection");
    }

    return userSettingsRepository.update(userId, settings);
  },
};








