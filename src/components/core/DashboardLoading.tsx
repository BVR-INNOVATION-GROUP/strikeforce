/**
 * Dashboard Loading - Theme-aligned skeleton centered in the main container
 * Uses primary and grounds (pale, very-pale, border) from the app theme
 */
"use client";

import React from "react";

/**
 * DashboardLoading
 *
 * Animated illustration of a person repeatedly checking the time.
 * Uses pure CSS/Tailwind-ish utility classes and respects theme tokens.
 */
export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
      <div className="relative w-full max-w-xl flex flex-col items-center gap-8">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-10 inset-x-0 mx-auto h-40 w-40 rounded-full bg-pale-primary blur-3xl opacity-60" />

        {/* Character + clock scene */}
        <div className="relative w-full max-w-lg rounded-xl bg-paper border border-custom px-8 py-10 flex items-center gap-8 shadow-custom overflow-hidden">
          {/* Standing figure */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Body */}
            <div className="relative flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-pale-primary mb-2 animate-[pulse_1.6s_ease-in-out_infinite]" />
              <div className="h-28 w-8 rounded-full bg-very-pale" />
              <div className="mt-1 flex gap-2">
                <div className="h-10 w-2 rounded-full bg-very-pale" />
                <div className="h-10 w-2 rounded-full bg-very-pale" />
              </div>
            </div>

            {/* Animated arm checking watch */}
            <div className="absolute bottom-6 right-[22%] origin-[0%_50%] h-2 w-16 rounded-full bg-pale-primary animate-[checkWatch_1.6s_ease-in-out_infinite]">
              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-custom bg-paper" />
            </div>
          </div>

          {/* Clock card */}
          <div className="flex-1 flex flex-col gap-4 items-start">
            <div className="inline-flex items-center gap-3 rounded-full bg-very-pale px-4 py-2">
              <div className="relative h-8 w-8 rounded-full bg-pale flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-custom" />
                <div className="h-0.5 w-3 bg-primary origin-center animate-[tick_1.6s_linear_infinite]" />
              </div>
              <span className="text-xs text-muted whitespace-nowrap">
                Lining things up for you…
              </span>
            </div>

            <div className="space-y-2 w-full">
              <div className="h-3 w-40 rounded bg-pale-primary animate-pulse" />
              <div className="h-2.5 w-56 rounded bg-pale animate-pulse" />
              <div className="flex gap-2 mt-3">
                <div className="h-2 w-16 rounded-full bg-pale animate-pulse" />
                <div className="h-2 w-10 rounded-full bg-pale animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-[pingSoft_1.6s_ease-in-out_infinite]" />
          <span>Loading your dashboard</span>
        </div>
      </div>

      {/* Keyframes (scoped via tailwind-like syntax) */}
      <style jsx>{`
        @keyframes checkWatch {
          0%,
          60%,
          100% {
            transform: rotate(0deg);
          }
          20%,
          40% {
            transform: rotate(-18deg);
          }
        }
        @keyframes tick {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pingSoft {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
