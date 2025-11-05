"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store";
import { useRouter } from "next/navigation";
import UnifiedSettings from "@/src/components/screen/settings/UnifiedSettings";
import { UserI } from "@/src/models/user";

/**
 * University Admin Settings Page - uses unified settings component
 */
export default function UniversityAdminSettings() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Initialize user if not set (for demo purposes)
  useEffect(() => {
    const initializeUser = async () => {
      if (!user) {
        try {
          // Load mock user data for university-admin role
          const usersData = await import("@/src/data/mockUsers.json");
          const users = usersData.default as UserI[];
          const adminUser = users.find((u) => u.role === "university-admin");

          if (adminUser) {
            setUser(adminUser);
          } else {
            // Redirect to home if no user found
            router.push("/");
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          router.push("/");
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, [user, setUser, router]);

  if (loading || !user) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return <UnifiedSettings user={{ id: user.id, email: user.email }} />;
}

