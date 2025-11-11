/**
 * Logout Section - handles user logout
 */
"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/src/store";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { LogOut } from "lucide-react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

/**
 * Logout section component
 */
const LogoutSection = () => {
  const { logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    // Force full page reload to ensure middleware sees cleared cookies
    // Wait longer to ensure all cleanup (localStorage, cookies, etc.) completes
    // The logout flag will be cleared by onRehydrateStorage after preventing rehydration
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };

  return (
    <>
      <Card title="Session">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <LogOut size={20} className="text-primary" />
            <p className="text-sm opacity-60">Sign out of your account</p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-pale text-primary rounded-full"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};

export default LogoutSection;

