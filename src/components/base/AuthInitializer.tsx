"use client";

/**
 * AuthInitializer - Automatically initializes university admin user in development mode
 * This component runs on mount and sets the default university admin user if no user is logged in
 */
import { useEffect } from "react";
import { useAuthStore } from "@/src/store";

export default function AuthInitializer() {
  const { user, initializeUniversityAdmin } = useAuthStore();

  useEffect(() => {
    // Only initialize if no user is currently set
    // This ensures we don't override existing sessions
    if (!user && process.env.NODE_ENV === "development") {
      initializeUniversityAdmin();
    }
  }, [user, initializeUniversityAdmin]);

  return null; // This component doesn't render anything
}


