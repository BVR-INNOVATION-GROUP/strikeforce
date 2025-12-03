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
        userId: user.id.toString(),
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
   * Update authenticated user's settings with validation
   * Backend uses JWT token's user_id - userId parameter will be ignored by backend
   */
  updateSettings: async (
    settings: Partial<UserSettingsI>
  ): Promise<UserSettingsI> => {
    // Note: Backend should use authenticated user's ID from JWT token, not path parameter
    // For now, we'll need to get current user ID from auth store
    const { useAuthStore } = await import("@/src/store/useAuthStore");
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    const userId = user.id.toString();
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









