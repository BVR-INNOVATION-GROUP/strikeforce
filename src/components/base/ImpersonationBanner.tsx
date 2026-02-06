"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/**
 * ImpersonationBanner - Shows when super-admin is viewing as another user
 * Displays "Exit" to restore admin session
 */
export default function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsImpersonating(sessionStorage.getItem("impersonating") === "true");
    }
  }, []);

  const handleExit = () => {
    const adminToken = sessionStorage.getItem("admin_token");
    if (adminToken && typeof window !== "undefined") {
      localStorage.setItem("token", adminToken);
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("impersonating");
      window.location.href = "/super-admin/users";
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-4 text-sm font-medium shadow-md">
      <span>You are viewing as another user. Actions will be performed as that user.</span>
      <button
        onClick={handleExit}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
      >
        <LogOut size={16} />
        Exit & return to admin
      </button>
    </div>
  );
}
