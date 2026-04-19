"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { DIALOG_OPTIONS, DIALOG_RESPONSES } from "@/game/world3d";
import type { Customer } from "@/game/types";

/**
 * Dialog choice overlay shown when the player greets a customer. Picking
 * a line triggers a cute response from the customer, then closes.
 */
export function DialogPanel({
  customer,
  onClose,
  onServe,
  canServe,
}: {
  customer: Customer | null;
  onClose: () => void;
  onServe: () => void;
  canServe: boolean;
}) {
  const [reply, setReply] = useState<string | null>(null);

  if (!customer) return null;

  const pick = (id: (typeof DIALOG_OPTIONS)[number]["id"]) => {
    const lines = DIALOG_RESPONSES[id];
    const line = lines[Math.floor(Math.random() * lines.length)];
    setReply(line);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-cocoa-900/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-cream-50 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-5 shadow-bakery"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{customer.emoji}</div>
            <div>
              <div className="font-bold text-cocoa-800">{customer.name}</div>
              <div className="text-xs text-cocoa-500 italic">
                &ldquo;{customer.greeting}&rdquo;
              </div>
            </div>
          </div>

          {reply ? (
            <div className="bg-mint-100 text-cocoa-800 rounded-2xl p-3 mb-3 text-sm">
              <span className="font-bold">{customer.name}:</span> {reply}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 mb-3">
              {DIALOG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => pick(opt.id)}
                  className="text-left px-3 py-2 rounded-xl bg-white hover:bg-cream-100 border border-cocoa-200 text-sm text-cocoa-800"
                >
                  <span className="mr-2">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
            >
              Close
            </button>
            <button
              onClick={onServe}
              disabled={!canServe}
              className={`flex-1 py-2 rounded-xl font-bold ${
                canServe
                  ? "bg-berry-500 text-white"
                  : "bg-cream-100 text-cocoa-400"
              }`}
            >
              {canServe ? "Serve order" : "Keep prepping"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
