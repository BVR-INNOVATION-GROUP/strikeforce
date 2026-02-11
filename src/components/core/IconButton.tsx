"use client";

import React, { HTMLAttributes, ReactElement } from 'react'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  icon: ReactElement
  indicator?: boolean
  disableShrink?: boolean
}

const IconButton = ({ icon, indicator, disableShrink, className, ...attr }: Props) => {
  return (
    <div 
      role="button"
      tabIndex={0}
      {...attr} 
      className={`rounded-full h-13 w-13 flex items-center justify-center cursor-pointer select-none ${className}`}
      suppressHydrationWarning
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          attr.onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
        attr.onKeyDown?.(e);
      }}
    >
      <span 
        className={`${!disableShrink && "transform scale-[.8]"}`}
        suppressHydrationWarning
      >
        {/* Icon wrapped with suppressHydrationWarning to prevent Dark Reader hydration errors */}
        {icon}
        {indicator && (
          <div className="absolute rounded-full h-3 w-3 border border-pale right-0 top-0 bg-primary"></div>
        )}
      </span>
    </div>
  )
}

export default IconButton