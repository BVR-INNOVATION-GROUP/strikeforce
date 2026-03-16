"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarLinks } from "@/src/hooks/useSidebarLinks";

/**
 * Student bottom tab bar for small screens only (Expo-style).
 * Find, Projects, Groups, Portfolio as bottom tabs; Supervisor and Analytics stay in the sidebar drawer.
 */
const StudentTabNav = () => {
  const pathname = usePathname();
  const links = useSidebarLinks("student");
  const tabLinks = links.filter((l) => l.mobileTab === true);

  if (tabLinks.length === 0) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[50] h-[8vh] min-h-[48px] flex items-stretch bg-paper border-t border-custom"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Student navigation"
    >
      <div className="flex flex-1">
        {tabLinks.map((l, i) => {
          const exactMatch = pathname === l.path;
          const isDashboardRoute = l.path === "/student" || l.path === "/student/";
          const prefixMatch = !isDashboardRoute && pathname?.startsWith(l.path + "/");
          const isActive = exactMatch || prefixMatch;
          const IconComponent = l.iconComponent;
          return (
            <Link
              key={i}
              href={l.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0 active:opacity-80 transition-colors ${
                isActive ? "text-primary" : "text-muted"
              }`}
            >
              <IconComponent size={22} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[0.65rem] font-medium truncate max-w-full px-1">{l.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default StudentTabNav;
