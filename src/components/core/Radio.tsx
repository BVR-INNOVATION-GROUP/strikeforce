"use client";

import React, { ComponentPropsWithoutRef } from "react";

export interface Props extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label?: string;
  error?: string;
}

/**
 * Custom radio button component matching theme colors and spacing
 * Uses primary color for selected state, follows theme spacing patterns
 */
const Radio = ({
  label,
  checked,
  onChange,
  name,
  value,
  className = "",
  error,
  ...props
}: Props) => {
  return (
    <label className={`flex items-center cursor-pointer group ${className}`}>
      <div className="relative flex items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-4 h-4 border-2 rounded-full transition-all duration-200 flex items-center justify-center ${
            checked
              ? "border-primary"
              : "border-custom bg-paper group-hover:border-primary"
          } ${error ? "border-red-500" : ""}`}
        >
          {checked && (
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          )}
        </div>
      </div>
      {label && (
        <span className={`ml-2 text-sm capitalize ${error ? "text-error" : ""}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Radio;

