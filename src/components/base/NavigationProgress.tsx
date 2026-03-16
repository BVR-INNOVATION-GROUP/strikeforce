"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BAR_DURATION_MS = 800;

/**
 * Linear progress bar at the top when navigating. Shows on in-app link click
 * and animates 0% → 100%; also shows briefly on pathname change so client
 * navigations always give visual feedback.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);
  const prevPathRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show bar when user clicks an in-app link (before pathname updates)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest("a");
      if (!target?.href) return;
      try {
        const url = new URL(target.href);
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return;
        if (target.target === "_blank" || target.hasAttribute("download")) return;
        setVisible(true);
        setKey((k) => k + 1);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          hideTimerRef.current = null;
        }, BAR_DURATION_MS + 100);
      } catch {
        // ignore
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // When pathname changes, ensure bar is visible and reset animation
  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname ?? null;
    if (prev != null && prev !== pathname) {
      setVisible(true);
      setKey((k) => k + 1);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, BAR_DURATION_MS + 100);
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <>
      <div
        key={key}
        className="fixed top-0 left-0 right-0 z-[9999] h-0.5 sm:h-1 bg-primary overflow-hidden"
        aria-hidden
        role="progressbar"
        aria-valuetext="Loading"
      >
        <div className="h-full w-full bg-primary opacity-90 navigation-progress-bar" />
      </div>
      <style jsx global>{`
        @keyframes navigation-progress-bar {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .navigation-progress-bar {
          animation: navigation-progress-bar 800ms ease-out forwards;
          will-change: transform;
        }
      `}</style>
    </>
  );
}
