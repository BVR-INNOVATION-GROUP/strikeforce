/**
 * Dashboard Loading - Theme-aligned skeleton centered in the main container
 * Uses primary and grounds (pale, very-pale, border) from the app theme
 */
"use client";

import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Title bar: first line has subtle primary tint */}
        <div className="w-full space-y-3">
          <div className="h-7 w-48 rounded bg-pale-primary animate-pulse" />
          <div className="h-4 w-full max-w-[320px] rounded bg-pale animate-pulse" />
          <div className="h-4 w-[85%] rounded bg-pale animate-pulse" />
        </div>

        {/* Card-style block: theme ground and border (max radius 4px) */}
        <div className="w-full rounded-lg bg-very-pale border border-custom p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-pale animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-4 rounded bg-pale animate-pulse ${i === 2 ? "w-3/4" : "w-full"}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div className="h-4 w-40 rounded bg-pale animate-pulse" />
      </div>
    </div>
  );
}
