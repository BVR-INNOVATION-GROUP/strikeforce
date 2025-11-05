"use client";

import React, { HTMLAttributes, ReactNode } from "react";

export interface Props extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

/**
 * Badge component for status indicators, labels, and tags
 * Uses ONLY theme colors from globals.css with improved contrast
 */
const Badge = ({ children, variant = "default", className = "" }: Props) => {
  const variantClasses = {
    default: "bg-pale text-primary",
    primary: "bg-primary text-white",
    // Success: Dark green text on light green background for better contrast
    success: "bg-muted-green text-success-dark font-semibold",
    // Warning: Primary color text on light primary background
    warning: "bg-pale-primary text-primary font-semibold",
    // Error: Dark red text on light red background for better contrast
    error: "bg-muted-red text-error-dark font-semibold",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

