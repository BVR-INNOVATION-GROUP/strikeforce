"use client";

import React, { ComponentPropsWithoutRef } from "react";

export interface Props extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label?: string;
  error?: string;
}

/**
 * Custom checkbox component matching theme colors and spacing
 * Uses primary color for checked state, follows theme spacing patterns
 */
const Checkbox = ({
  label,
  checked,
  onChange,
  className = "",
  error,
  ...props
}: Props) => {
  return (
    <label className={`flex items-center cursor-pointer group ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${
            checked
              ? "bg-primary border-primary"
              : "border-custom bg-paper group-hover:border-primary"
          } ${error ? "border-red-500" : ""}`}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className={`ml-2 text-sm ${error ? "text-error" : ""}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
