/**
 * Popover Component - Reusable popover/dropdown component
 * Handles positioning, outside click detection, and animations
 */
"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface PopoverProps {
  children: ReactNode; // Trigger element
  content: ReactNode; // Popover content
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Callback when open state changes
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end" | "bottom" | "top";
  offset?: number; // Distance from trigger element
  className?: string; // Additional classes for popover content
}

/**
 * Popover component with smart positioning and click-outside detection
 */
const Popover = ({
  children,
  content,
  open: controlledOpen,
  onOpenChange,
  placement = "bottom-end",
  offset = 8,
  className = "",
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  /**
   * Calculate popover position based on trigger element and placement
   */
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calculate position based on placement
    switch (placement) {
      case "bottom-start":
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
        break;
      case "bottom-end":
        top = triggerRect.bottom + offset;
        left = triggerRect.right - popoverRect.width;
        break;
      case "top-start":
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left;
        break;
      case "top-end":
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.right - popoverRect.width;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case "top":
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
    }

    // Adjust if popover goes off screen
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 16;
    }
    if (left < 16) {
      left = 16;
    }
    if (top + popoverRect.height > viewportHeight) {
      top = triggerRect.top - popoverRect.height - offset;
    }
    if (top < 16) {
      top = 16;
    }

    setPosition({ top, left });
  }, [placement, offset]);

  /**
   * Handle click outside to close popover
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        popoverRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Calculate position when opening
    calculatePosition();

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isOpen, calculatePosition, setIsOpen]);

  /**
   * Recalculate position when popover content changes
   */
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isOpen, calculatePosition, content]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick} className="relative">
        {children}
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  zIndex: 1000,
                }}
                className={`bg-paper rounded-lg shadow-lg border border-custom min-w-[200px] ${className}`}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Popover;


