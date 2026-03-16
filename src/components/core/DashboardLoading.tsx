/**
 * Dashboard Loading - Theme-aligned skeleton centered in the main container
 * Responsive: stacked layout on small screens, side-by-side on larger; compact sizing on mobile
 */
"use client";

import React from "react";

/**
 * DashboardLoading
 *
 * Animated skeleton that adapts to screen size: compact vertical stack on mobile,
 * character + clock scene on larger screens.
 */
export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl flex flex-col items-center gap-4 sm:gap-8">
        {/* Ambient glow - smaller on mobile */}
        <div className="pointer-events-none absolute -top-6 sm:-top-10 inset-x-0 mx-auto h-24 w-24 sm:h-40 sm:w-40 rounded-full bg-pale-primary blur-3xl opacity-50 sm:opacity-60" />

        {/* Card: vertical stack on small screens, row on md+ */}
        <div className="relative w-full max-w-lg rounded-xl bg-paper border border-custom px-4 py-6 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-custom overflow-hidden">
          {/* Standing figure - smaller on mobile */}
          <div className="relative flex-shrink-0 flex items-center justify-center order-2 sm:order-1 sm:flex-1">
            <div className="relative flex flex-col items-center">
              <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-pale-primary mb-1.5 sm:mb-2 animate-[pulse_1.6s_ease-in-out_infinite]" />
              <div className="h-16 w-6 sm:h-28 sm:w-8 rounded-full bg-very-pale" />
              <div className="mt-0.5 sm:mt-1 flex gap-1.5 sm:gap-2">
                <div className="h-6 w-1.5 sm:h-10 sm:w-2 rounded-full bg-very-pale" />
                <div className="h-6 w-1.5 sm:h-10 sm:w-2 rounded-full bg-very-pale" />
              </div>
            </div>
            <div className="absolute bottom-3 sm:bottom-6 right-[18%] sm:right-[22%] origin-[0%_50%] h-1.5 w-10 sm:h-2 sm:w-16 rounded-full bg-pale-primary animate-[checkWatch_1.6s_ease-in-out_infinite]">
              <div className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 h-2 w-2 sm:h-3 sm:w-3 rounded-full border border-custom bg-paper" />
            </div>
          </div>

          {/* Content block - full width on mobile, skeleton bars scale */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-4 items-stretch sm:items-start w-full sm:w-auto order-1 sm:order-2">
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-very-pale px-3 py-1.5 sm:px-4 sm:py-2 w-fit">
              <div className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-pale flex items-center justify-center flex-shrink-0">
                <div className="absolute inset-0 rounded-full border border-custom" />
                <div className="h-0.5 w-2.5 sm:w-3 bg-primary origin-center animate-[tick_1.6s_linear_infinite]" />
              </div>
              <span className="text-[0.65rem] sm:text-xs text-muted whitespace-nowrap">
                Lining things up for you…
              </span>
            </div>

            <div className="space-y-2 w-full">
              <div className="h-2.5 sm:h-3 w-full max-w-[10rem] sm:w-40 rounded bg-pale-primary animate-pulse" />
              <div className="h-2 sm:h-2.5 w-full max-w-[14rem] sm:w-56 rounded bg-pale animate-pulse" />
              <div className="flex gap-2 mt-2 sm:mt-3">
                <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full bg-pale animate-pulse" />
                <div className="h-1.5 sm:h-2 w-8 sm:w-10 rounded-full bg-pale animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2 text-[0.65rem] sm:text-xs text-muted">
          <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-[pingSoft_1.6s_ease-in-out_infinite]" />
          <span>Loading your dashboard</span>
        </div>
      </div>

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
