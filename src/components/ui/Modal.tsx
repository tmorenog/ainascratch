"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-3xl" }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-cocoa-600/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${maxWidth} panel max-h-[90vh] overflow-hidden flex flex-col`}
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center justify-between mb-3 pr-1">
              {title && (
                <h2 className="font-display text-2xl md:text-3xl text-cocoa-600">{title}</h2>
              )}
              <button
                className="btn-icon"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto cozy-scroll pr-1 -mr-1 flex-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
