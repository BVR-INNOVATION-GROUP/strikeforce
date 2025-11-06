"use client";

import React, { useMemo } from "react";
import RouteProtector from "@/src/components/base/RouteProtector";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Memoize allowedRoles to prevent re-renders
  const allowedRoles = useMemo(() => ["super-admin"] as const, []);

  return (
    <RouteProtector allowedRoles={allowedRoles}>
      {children}
    </RouteProtector>
  );
}

