"use client";

import React, { useState, useRef, useEffect } from "react";

export interface Props {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

/**
 * Custom Range Slider with two draggable handles
 * Similar to Google's range filter
 */
const RangeSlider = ({ min, max, value, onChange, step = 1000, className = "" }: Props) => {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  /**
   * Calculate percentage position for a value
   */
  const getPercentage = (val: number): number => {
    return ((val - min) / (max - min)) * 100;
  };

  /**
   * Calculate value from percentage
   */
  const getValueFromPercentage = (percentage: number): number => {
    const rawValue = min + (percentage / 100) * (max - min);
    return Math.round(rawValue / step) * step;
  };

  /**
   * Handle mouse down on slider track or handles
   */
  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  /**
   * Handle mouse move
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const newValue = getValueFromPercentage(percentage);

      if (isDragging === "min") {
        const newMin = Math.max(min, Math.min(newValue, value[1] - step));
        onChange([newMin, value[1]]);
      } else {
        const newMax = Math.min(max, Math.max(newValue, value[0] + step));
        onChange([value[0], newMax]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, value, min, max, step, onChange]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={sliderRef}
        className="relative h-2 bg-pale rounded-full cursor-pointer"
      >
        {/* Active range track */}
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        {/* Min handle */}
        <div
          className="absolute w-4 h-4 bg-primary rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1 top-1/2 shadow-md hover:scale-110 transition-transform"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown("min")}
        />
        {/* Max handle */}
        <div
          className="absolute w-4 h-4 bg-primary rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1 top-1/2 shadow-md hover:scale-110 transition-transform"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown("max")}
        />
      </div>
      {/* Value labels */}
      <div className="flex justify-between mt-2 text-xs text-secondary">
        <span>{value[0].toLocaleString()}</span>
        <span>{value[1].toLocaleString()}</span>
      </div>
    </div>
  );
};

export default RangeSlider;


