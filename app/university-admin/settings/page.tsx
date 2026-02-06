"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store";
import { useRouter } from "next/navigation";
import UnifiedSettings from "@/src/components/screen/settings/UnifiedSettings";
import DashboardLoading from "@/src/components/core/DashboardLoading";

/**
 * University Admin Settings Page - uses unified settings component
 */
export default function UniversityAdminSettings() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Wait for hydration before checking user
  useEffect(() => {
    // Only check after hydration is complete
    if (_hasHydrated) {
      if (!user || !user.id) {
        // No user or incomplete user after hydration - redirect to login
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    }
  }, [user, _hasHydrated, router]);

  if (loading || !user || !user.id) {
    return (
      <DashboardLoading />
    );
  }

  return <UnifiedSettings user={{ id: user.id.toString(), email: user.email }} />;
}

