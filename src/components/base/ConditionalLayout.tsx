/**
 * ConditionalLayout - Conditionally renders Navbar and Sidebar based on route
 */
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarDrawer from "./SidebarDrawer";
import AuthInitializer from "./AuthInitializer";
import OrganizationTheme from "./OrganizationTheme";
import ImpersonationBanner from "./ImpersonationBanner";
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
  const isStandaloneRoute = standaloneRoutes.some((route) => pathname === route || pathname?.startsWith(route + "/"));

  // Always apply organization theme (even on standalone routes for logged-in users)
  return (
    <>
      <AuthInitializer />
      <OrganizationTheme />
      {isStandaloneRoute ? (
        <div className="min-h-screen">{children}</div>
      ) : (
        <>
          <ImpersonationBanner />
          <Navbar />
          <Sidebar />
          <SidebarDrawer />
          <main className="fixed top-[8vh] left-0 md:left-[6vw] right-0 bottom-0 overflow-y-auto overflow-x-hidden p-4 min-w-0 touch-manipulation">
            {children}
          </main>
        </>
      )}
    </>
  );
};

export default ConditionalLayout;

