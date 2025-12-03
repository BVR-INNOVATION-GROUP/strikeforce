/**
 * Custom hook for partner settings state and logic
 */
import { useState, useEffect } from "react";
import { userSettingsService } from "@/src/services/userSettingsService";
import { validateSettings } from "@/src/utils/settingsValidation";
import { useToast } from "@/src/hooks/useToast";
import {
  NotificationSettings as NotificationSettingsType,
} from "@/src/components/screen/partner/settings/NotificationSettings";
import {
  AccountSettings as AccountSettingsType,
} from "@/src/components/screen/partner/settings/AccountSettings";
import {
  SecuritySettings as SecuritySettingsType,
} from "@/src/components/screen/partner/settings/SecuritySettings";

export interface UsePartnerSettingsResult {
  loading: boolean;
  saving: boolean;
  notifications: NotificationSettingsType;
  accountSettings: AccountSettingsType;
  security: SecuritySettingsType;
  setNotifications: (notifications: NotificationSettingsType) => void;
  setAccountSettings: (settings: AccountSettingsType) => void;
  setSecurity: (security: SecuritySettingsType) => void;
  handleNotificationChange: (key: string, value: boolean) => void;
  handleAccountSettingChange: (key: string, value: string) => void;
  handleSave: (userId: string) => Promise<void>;
  loadSettings: (userId: string) => Promise<void>;
}

/**
 * Hook for managing partner settings state and operations
 */
export function usePartnerSettings(userId: string | undefined): UsePartnerSettingsResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettingsType>({
    emailNotifications: true,
    milestoneUpdates: true,
    projectApplications: true,
    paymentAlerts: true,
    weeklyReports: false,
  });
  const [accountSettings, setAccountSettings] = useState<AccountSettingsType>({
    language: "en",
    timezone: "UTC",
    currency: "USD",
  });
  const [security, setSecurity] = useState<SecuritySettingsType>({
    twoFactorEnabled: false,
    sessionTimeout: "30",
  });
  const { showSuccess, showError } = useToast();

  const loadSettings = async (userId: string) => {
    setLoading(true);
    try {
      const settings = await userSettingsService.getUserSettings();
      setNotifications(settings.notifications);
      setAccountSettings(settings.accountSettings);
      setSecurity(settings.security);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadSettings(userId);
    }
  }, [userId]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });
  };

  const handleAccountSettingChange = (key: string, value: string) => {
    setAccountSettings({ ...accountSettings, [key]: value });
  };

  const handleSave = async (userId: string) => {
    const validationErrors = validateSettings(security);
    if (Object.keys(validationErrors).length > 0) {
      showError(validationErrors.sessionTimeout || "Please fix the errors before saving");
      return;
    }

    const timeout = parseInt(security.sessionTimeout);
    setSaving(true);
    try {
      await userSettingsService.updateSettings({
        notifications,
        accountSettings,
        security: {
          ...security,
          sessionTimeout: timeout.toString(),
        },
      });
      showSuccess("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    notifications,
    accountSettings,
    security,
    setNotifications,
    setAccountSettings,
    setSecurity,
    handleNotificationChange,
    handleAccountSettingChange,
    handleSave,
    loadSettings,
  };
}









