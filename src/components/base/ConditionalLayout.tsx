/**
 * ConditionalLayout - Conditionally renders Navbar and Sidebar based on route
 */
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AuthInitializer from "./AuthInitializer";
import { ReactNode } from "react";

export interface ConditionalLayoutProps {
  children: ReactNode;
}

/**
 * Routes that should not show Navbar and Sidebar
 */
const authRoutes = ["/auth"];

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthInitializer />
      <Navbar />
      <Sidebar />
      <main className="fixed top-[8vh] left-[6vw] right-0 bottom-0 overflow-y-auto p-4">
        {children}
      </main>
    </>
  );
};

export default ConditionalLayout;

