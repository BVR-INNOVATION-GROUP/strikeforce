/**
 * Skeleton - Base skeleton loader component
 * Used for showing loading placeholders
 */
import React, { HTMLAttributes } from 'react'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const Skeleton = ({ 
  width, 
  height, 
  rounded = 'md', 
  className = '', 
  ...props 
}: Props) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`bg-pale animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={style}
      {...props}
    />
  )
}

export default Skeleton

