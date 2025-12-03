"use client";

import React, { HTMLAttributes, useState } from "react";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Avatar component for user profile pictures
 * Falls back to initials if no image provided or image fails to load
 */
const Avatar = ({ src, alt, name, size = "md", className = "", ...props }: Props) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const hasValidImage = src && src.trim() !== "" && !imageError;

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-pale-primary flex items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {hasValidImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-primary font-semibold">{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;









