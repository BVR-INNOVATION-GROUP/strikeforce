"use client";

import React, { HTMLAttributes } from "react";
import Badge from "./Badge";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  status: string;
  label?: string;
}

/**
 * StatusIndicator component for displaying status with color coding
 */
const StatusIndicator = ({ status, label, className = "" }: Props) => {
  // Map status values to badge variants
  const getVariant = (status: string): "default" | "primary" | "success" | "warning" | "error" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("approved") || statusLower.includes("completed") || statusLower === "success") {
      return "success";
    }
    if (statusLower.includes("pending") || statusLower.includes("waitlist")) {
      return "warning";
    }
    if (statusLower.includes("rejected") || statusLower.includes("failed") || statusLower.includes("error")) {
      return "error";
    }
    if (statusLower.includes("in-progress") || statusLower === "active") {
      return "primary";
    }
    return "default";
  };

  // Format status label
  const formatLabel = (status: string): string => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {label || formatLabel(status)}
    </Badge>
  );
};

export default StatusIndicator;








