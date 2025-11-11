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
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Wait for hydration before checking user
  useEffect(() => {
    // Only check after hydration is complete
    if (_hasHydrated) {
      if (!user) {
        // No user after hydration - redirect to login
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    }
  }, [user, _hasHydrated, router, setLoading]);

  if (loading || !user) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return <UnifiedProfile user={user} />;
}
