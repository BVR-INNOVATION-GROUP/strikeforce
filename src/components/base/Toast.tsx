"use client"

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import IconButton from '../core/IconButton'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface Props {
  toast: Toast | null
  onClose: (id: string) => void
}

/**
 * Toast notification component to replace alert() for non-critical messages
 * Auto-dismisses after duration (default 3000ms)
 */
const Toast = (props: Props) => {
  const { toast, onClose } = props

  useEffect(() => {
    if (toast) {
      const duration = toast.duration || 3000
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-success" size={20} />
      case 'error':
        return <AlertCircle className="text-error" size={20} />
      case 'warning':
        return <AlertCircle className="text-warning" size={20} />
      case 'info':
        return <Info className="text-info" size={20} />
      default:
        return <Info className="text-primary" size={20} />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-paper border-custom'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-20 right-4 z-50 ${getBackgroundColor()} border rounded-lg shadow-custom p-4 min-w-[300px] max-w-[400px] flex items-start gap-3`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 text-sm text-secondary">
          {toast.message}
        </div>
        <IconButton
          icon={<X size={16} />}
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0"
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast


