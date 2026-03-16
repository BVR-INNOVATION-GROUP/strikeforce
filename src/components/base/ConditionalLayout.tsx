/**
 * ConditionalLayout - Conditionally renders Navbar and Sidebar based on route
 */
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarDrawer from "./SidebarDrawer";
import StudentTabNav from "./StudentTabNav";
import AuthInitializer from "./AuthInitializer";
import OrganizationTheme from "./OrganizationTheme";
import ThemeInitializer from "./ThemeInitializer";
import ImpersonationBanner from "./ImpersonationBanner";
import NavigationProgress from "./NavigationProgress";
import { useAuthStore } from "@/src/store";
import { ReactNode } from "react";

export interface ConditionalLayoutProps {
  children: ReactNode;
}

/**
 * Routes that should not show Navbar and Sidebar
 * Landing page and auth routes should be standalone
 */
const standaloneRoutes = ["/", "/auth"];

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isStandaloneRoute = standaloneRoutes.some((route) => pathname === route || pathname?.startsWith(route + "/"));
  const isStudent = user?.role === "student";

  // Always apply organization theme (even on standalone routes for logged-in users)
  return (
    <>
      <AuthInitializer />
      <ThemeInitializer />
      <OrganizationTheme />
      {isStandaloneRoute ? (
        <div className="min-h-screen">{children}</div>
      ) : (
        <>
          <NavigationProgress />
          <ImpersonationBanner />
          <Navbar />
          <Sidebar />
          <SidebarDrawer />
          <main className="fixed top-[max(8vh,48px)] left-0 md:left-[6vw] right-0 bottom-0 overflow-y-auto overflow-x-hidden flex flex-col min-w-0 touch-manipulation">
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 ${isStudent ? "pb-[calc(1rem+max(8vh,48px)+env(safe-area-inset-bottom,0px))] md:pb-4" : ""}`}
            >
              {children}
            </div>
            {isStudent && <StudentTabNav />}
          </main>
        </>
      )}
    </>
  );
};

export default ConditionalLayout;

