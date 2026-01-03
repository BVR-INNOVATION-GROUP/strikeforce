"use client";

import React from "react";
import { useAuthStore } from "@/src/store";
import UnifiedProfile from "@/src/components/screen/profile/UnifiedProfile";

/**
 * University Admin Profile Page - uses unified profile component
 */
export default function UniversityAdminProfile() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return <UnifiedProfile user={user} />;
}







