/**
 * Unified Settings Component - used by all user roles
 * Provides account deletion, logout, and password update
 */
"use client";

import React from "react";
import PasswordUpdateSection from "./PasswordUpdateSection";
import LogoutSection from "./LogoutSection";
import AccountDeletionSection from "./AccountDeletionSection";
import OrganizationLogoUpload from "./OrganizationLogoUpload";
import BrandColorPicker from "./BrandColorPicker";

export interface Props {
  user: { id: string; email: string };
}

/**
 * Unified settings component for all user roles
 * Provides account deletion, logout, and password update
 */
const UnifiedSettings = ({ user }: Props) => {
  return (
    <div className="w-full flex flex-col h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="mb-4">
          <h1 className="text-[1rem] font-[600] mb-2">Settings</h1>
          <p className="text-[0.875rem] opacity-60">
            Manage your account security and preferences
          </p>
        </div>
      </div>

      {/* Organization Logo Upload (for org owners only) */}
      <OrganizationLogoUpload />

      {/* Brand Color Picker (for org owners only) */}
      <BrandColorPicker />

      {/* Password Update */}
      <PasswordUpdateSection userId={user.id} />

      {/* Logout */}
      <LogoutSection />

      {/* Account Deletion */}
      <AccountDeletionSection userId={user.id} />
    </div>
  );
};

export default UnifiedSettings;
