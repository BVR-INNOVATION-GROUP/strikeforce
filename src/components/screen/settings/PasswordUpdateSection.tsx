/**
 * Password Update Section - handles password change form
 */
"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { Lock } from "lucide-react";
import { userRepository } from "@/src/repositories/userRepository";

export interface Props {
  userId: string;
}

/**
 * Password update form section
 */
const PasswordUpdateSection = ({ userId }: Props) => {
  const { showSuccess, showError } = useToast();

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle password update
  const handlePasswordUpdate = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showError("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      await userRepository.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error("Failed to update password:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update password. Please try again.";
      showError(message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <Card title="Password">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={20} className="text-primary" />
          <p className="text-sm opacity-60">
            Update your password to keep your account secure
          </p>
        </div>

        <Input
          title="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              currentPassword: e.target.value,
            })
          }
          placeholder="Enter current password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          }
        />

        <Input
          title="New Password"
          type={showNewPassword ? "text" : "password"}
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              newPassword: e.target.value,
            })
          }
          placeholder="Enter new password (min. 8 characters)"
          rightElement={
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          }
        />

        <Input
          title="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
          placeholder="Confirm new password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          }
        />

        <div className="flex justify-end pt-2">
          <Button
            onClick={handlePasswordUpdate}
            className="bg-primary rounded-full"
            disabled={updatingPassword}
          >
            <Lock size={16} className="mr-2" />
            {updatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PasswordUpdateSection;

