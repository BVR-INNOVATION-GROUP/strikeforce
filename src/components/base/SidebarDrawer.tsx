"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarLinks } from "@/src/hooks/useSidebarLinks";
import { useAuthStore } from "@/src/store";
import { useUIStore } from "@/src/store/useUIStore";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Role = "partner" | "student" | "supervisor" | "university-admin" | "delegated-admin" | "super-admin";

/**
 * SidebarDrawer - Mobile navigation drawer with full labels
 * Slides in from the left on small screens, replaces the icon-only sidebar
 */
const SidebarDrawer = () => {
  const { user } = useAuthStore();
  const { isDrawerOpen, closeDrawer } = useUIStore();
  const pathname = usePathname();
  const userRole: Role = user?.role || "partner";
  const links = useSidebarLinks(userRole);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[100] md:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-paper z-[101] shadow-xl md:hidden flex flex-col"
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-custom">
              <span className="text-sm font-semibold text-default">Menu</span>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-pale transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            {/* Nav links with full labels */}
            <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
              {links?.map((l, i) => {
                const exactMatch = pathname === l.path;
                const isDashboardRoute = l.path === `/${userRole}` || l.path === `/${userRole}/`;
                const prefixMatch = !isDashboardRoute && pathname && pathname.startsWith(l.path + "/");
                const isActive = exactMatch || prefixMatch;
                const IconComponent = l.iconComponent;

                return (
                  <Link
                    key={i}
                    href={l.path}
                    onClick={closeDrawer}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive || l.isFocused
                        ? "bg-pale text-primary font-medium"
                        : "hover:bg-pale text-default"
                    }`}
                  >
                    <IconComponent size={22} className="flex-shrink-0" />
                    <span className="text-[0.9375rem]">{l.title}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarDrawer;
