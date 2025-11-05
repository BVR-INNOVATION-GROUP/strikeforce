"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store";
import { useRouter } from "next/navigation";
import UnifiedProfile from "@/src/components/screen/profile/UnifiedProfile";
import { UserI } from "@/src/models/user";

/**
 * Partner Profile Page - uses unified profile component
 */
export default function PartnerProfile() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Initialize user if not set (for demo purposes)
  useEffect(() => {
    const initializeUser = async () => {
      if (!user) {
        try {
          // Load mock user data for partner role
          const usersData = await import("@/src/data/mockUsers.json");
          const users = usersData.default as UserI[];
          const partnerUser = users.find((u) => u.role === "partner");
          
          if (partnerUser) {
            setUser(partnerUser);
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

  return <UnifiedProfile user={user} />;
}
