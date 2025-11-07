/**
 * Side Modal Component - Reusable side panel modal that slides in from the right
 * Benchmarked from GroupDetailsModal
 */
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import IconButton from "@/src/components/core/IconButton";

export interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string; // Default: "500px"
}

/**
 * Side modal that slides in from the right
 */
const SideModal = ({ open, onClose, title, children, width = "500px" }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed right-0 top-0 bottom-0 bg-paper shadow-custom flex flex-col"
            style={{ 
              width,
              zIndex: 99999,
              maxWidth: "90vw"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-custom flex-shrink-0">
              <h2 className="text-[1rem] font-[600]">{title}</h2>
              <IconButton
                onClick={onClose}
                icon={<X size={20} />}
                className="hover-bg-pale"
              />
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default SideModal;


