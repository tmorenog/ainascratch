"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FURNITURE_CATALOG } from "@/game/world3d";
import { useGame } from "@/game/store";

/**
 * Furniture catalog overlay — pick an item to enter placement mode, then
 * click in the world to drop it. Also lists pieces already placed so the
 * player can remove them for a refund-free cleanup.
 */
export function FurnitureShop({
  open,
  onClose,
  onPickKind,
}: {
  open: boolean;
  onClose: () => void;
  onPickKind: (kind: string) => void;
}) {
  const coins = useGame((s) => s.coins);
  const furniture = useGame((s) => s.furniture);
  const removeFurniture = useGame((s) => s.removeFurniture);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-900/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cream-50 w-full md:max-w-2xl rounded-3xl p-5 m-3 shadow-bakery max-h-[85vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-cocoa-800">
                  Furniture Shop
                </h2>
                <div className="text-xs text-cocoa-500">
                  Pick one — then click in the bakery to place it.
                </div>
              </div>
              <div className="text-berry-600 font-bold">🪙 {coins}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {FURNITURE_CATALOG.map((f) => {
                const affordable = coins >= f.price;
                return (
                  <button
                    key={f.id}
                    disabled={!affordable}
                    onClick={() => {
                      onPickKind(f.id);
                      onClose();
                    }}
                    className={`text-left p-3 rounded-2xl border ${
                      affordable
                        ? "bg-white border-cocoa-200 hover:bg-cream-100"
                        : "bg-cream-100 border-cream-200 opacity-60"
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="font-bold text-cocoa-800 text-sm">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-cocoa-500 leading-snug mb-2">
                      {f.description}
                    </div>
                    <div className="text-berry-600 text-xs font-bold">
                      🪙 {f.price}
                    </div>
                  </button>
                );
              })}
            </div>

            {furniture.length > 0 && (
              <div>
                <div className="text-sm font-bold text-cocoa-700 mb-2">
                  Placed ({furniture.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {furniture.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => removeFurniture(f.id)}
                      className="text-xs px-2 py-1 rounded-full bg-cream-100 text-cocoa-600"
                    >
                      Remove {f.kind.replace("_", " ")} ×
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-5 w-full py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
