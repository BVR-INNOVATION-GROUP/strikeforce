"use client"

import React, { ReactNode } from 'react'
import Modal from './Modal'
import Button from '../core/Button'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

export interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string | ReactNode
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

/**
 * Confirmation dialog component to replace window.confirm()
 * Supports different types: danger, warning, info, success
 */
const ConfirmationDialog = (props: Props) => {
  const {
    open,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false
  } = props

  /**
   * Get icon based on dialog type
   */
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-error" size={24} />
      case 'warning':
        return <AlertTriangle className="text-warning" size={24} />
      case 'info':
        return <Info className="text-info" size={24} />
      case 'success':
        return <CheckCircle className="text-success" size={24} />
      default:
        return <Info className="text-primary" size={24} />
    }
  }

  /**
   * Get confirm button styling based on type
   * Uses theme colors instead of custom colors
   */
  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-primary opacity-90 hover:opacity-100'
      case 'warning':
        return 'bg-primary opacity-90 hover:opacity-100'
      case 'info':
        return 'bg-primary'
      case 'success':
        return 'bg-primary'
      default:
        return 'bg-primary'
    }
  }

  const handleConfirm = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    console.log("handleConfirm called", { loading, hasOnConfirm: !!onConfirm });
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) {
      console.log("Already loading, ignoring click");
      return;
    }
    if (!onConfirm) {
      console.warn("No onConfirm handler provided");
      return;
    }
    try {
      console.log("Calling onConfirm...");
      await onConfirm();
      console.log("onConfirm completed");
    } catch (error) {
      console.error("Error in confirmation dialog:", error);
      // Error handling is typically done in the onConfirm function
    }
  }

  return (
    <Modal
      open={open}
      handleClose={onClose}
      title={title}
      actions={[
        <Button
          key="cancel"
          onClick={onClose}
          className="bg-pale"
          disabled={loading}
        >
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          type="button"
          onClick={(e) => {
            console.log("Button onClick triggered", e);
            handleConfirm(e);
          }}
          className={getConfirmButtonClass()}
          loading={loading}
        >
          {confirmText}
        </Button>
      ]}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          {typeof message === 'string' ? (
            <p className="text-sm text-secondary">{message}</p>
          ) : (
            message
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationDialog


