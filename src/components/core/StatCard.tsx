"use client";

import React, { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import Card from "./Card";

export interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: number; // Percentage change (positive for increase, negative for decrease)
  comparisonPeriod?: string; // e.g., "vs last month"
}

/**
 * StatCard component - displays a statistic with icon, value, and optional change indicator
 * Matches the UI benchmark: clean, minimal design with muted color indicators
 */
const StatCard = ({
  icon,
  title,
  value,
  change,
  comparisonPeriod = "vs last month",
}: StatCardProps) => {
  // Format value - if number, format it; if string, use as-is
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  // Determine if change is positive (increase) or negative (decrease)
  const isIncrease = change !== undefined && change > 0;
  const hasChange = change !== undefined;

  return (
    <Card className="bg-paper">
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-4 rounded bg-pale transform scale-[.75] origin-top-left">{icon}</div>
          <span className="text-sm text-secondary font-medium">{title}</span>
        </div>

        {/* Main Value */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-3xl ">{formattedValue}</p>
          </div>

          {/* Change Indicator */}
          {hasChange && (
            <div className="flex flex-col items-end">
              <div
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${isIncrease ? "bg-muted-green" : "bg-muted-red"
                  }`}
              >
                {isIncrease ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
              {comparisonPeriod && (
                <p className="text-xs text-secondary mt-1">{comparisonPeriod}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;

