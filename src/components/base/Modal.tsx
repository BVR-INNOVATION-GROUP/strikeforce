"use client";

import { X } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import IconButton from "../core/IconButton";
import { motion, AnimatePresence } from "framer-motion";

export interface Props {
  title?: string;
  children: ReactNode;
  actions?: ReactNode[];
  handleClose: () => void;
  open?: boolean;
}

const Modal = (props: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const open = !!props.open;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm cursor-pointer"
          style={{ zIndex: 100000 }}
          onClick={props.handleClose}
          aria-hidden={!open}
        >
          <motion.div
            key="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title ? "modal-title" : undefined}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-paper shadow-custom rounded-lg w-[95vw] max-w-[95vw] sm:min-w-[40%] sm:max-w-[60%] max-h-[90vh] flex flex-col cursor-default"
            style={{ zIndex: 100001 }}
          >
            <div className="flex items-center justify-between p-8 pb-6 flex-shrink-0">
              <div id="modal-title" className="font-[600]">
                {props?.title}
              </div>
              <IconButton
                onClick={() => props?.handleClose()}
                icon={<X />}
                className="hover-bg-pale"
              />
            </div>

            <div className="px-8 flex-1 overflow-y-auto min-h-0">{props?.children}</div>

            <div className="flex mt-6 mb-8 px-8 items-center justify-end gap-2 flex-shrink-0">
              {props?.actions?.map((a, i) => (
                <span key={i}>{a}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
