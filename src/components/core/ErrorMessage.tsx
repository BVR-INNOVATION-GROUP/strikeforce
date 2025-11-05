"use client"

import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface Props {
  message: string
  className?: string
}

/**
 * Error message component for form validation errors
 * Displays error message with icon
 */
const ErrorMessage = (props: Props) => {
  const { message, className = '' } = props

  if (!message) return null

  return (
    <div className={`flex items-center gap-2 text-error text-sm mt-1 ${className}`}>
      <AlertCircle size={14} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default ErrorMessage





