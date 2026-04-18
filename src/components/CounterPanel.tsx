"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { RECIPE_BY_ID } from "@/game/recipes";
import { FoodArt } from "./foods/FoodArt";
import { ProgressBar } from "./ui/ProgressRing";

/**
 * The service counter panel — shown when the player interacts with the
 * counter hotspot. Lists active customers with their orders and a serve
 * button that activates as soon as the tray contains all the right items.
 */
export function CounterPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const customers = useGame((s) => s.customers);
  const ready = useGame((s) => s.ready);
  const serveCustomer = useGame((s) => s.serveCustomer);
  const dismissCustomer = useGame((s) => s.dismissCustomer);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 150);
    return () => window.clearInterval(id);
  }, [open]);

  const readyCounts: Record<string, number> = {};
  ready.forEach((r) => (readyCounts[r.recipeId] = (readyCounts[r.recipeId] ?? 0) + 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-cocoa-600/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-3xl bg-cream-50 rounded-t-3xl md:rounded-3xl border border-cream-200 shadow-bakery p-4 max-h-[85vh] overflow-y-auto cozy-scroll"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-2xl text-cocoa-600">🔔 Service Counter</h3>
              <div className="flex gap-2">
                <button
                  className={`rounded-full px-4 py-2 font-bold shadow-soft text-sm transition ${
                    isOpen ? "bg-berry-500 text-white" : "bg-mint-500 text-white"
                  }`}
                  onClick={toggleStore}
                >
                  {isOpen ? "Close Shop" : "Open Shop"}
                </button>
                <button className="btn-icon" onClick={onClose}>✕</button>
              </div>
            </div>

            {!isOpen && customers.length === 0 && (
              <div className="text-center text-cocoa-400 py-10">
                The shop is closed. Open it to welcome customers!
              </div>
            )}

            {customers.length === 0 && isOpen && (
              <div className="text-center text-cocoa-400 py-10">
                🌼 Waiting for the next customer…
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customers.map((c) => {
                const elapsed = now - c.arrivedAt;
                const patience = 1 - elapsed / c.patienceMs;
                const orderCounts: Record<string, number> = {};
                c.order.forEach((id) => (orderCounts[id] = (orderCounts[id] ?? 0) + 1));
                const canServe = Object.entries(orderCounts).every(
                  ([id, n]) => (readyCounts[id] ?? 0) >= n,
                );
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-cream-200 bg-white/85 p-3 shadow-soft"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-soft shrink-0"
                        style={{ background: c.color }}
                      >
                        {c.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-cocoa-600 truncate">{c.name}</div>
                          {c.hasPet && (
                            <span className="chip !py-0 !px-2 !text-xs">
                              {c.hasPet === "dog" ? "🐶 pup" : "🐱 cat"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-cocoa-400 italic truncate">
                          &ldquo;{c.greeting}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.order.map((id, i) => {
                        const recipe = RECIPE_BY_ID[id];
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 rounded-xl bg-cream-100 border border-cream-200 px-2 py-1"
                            title={recipe?.name}
                          >
                            <FoodArt id={id} size={32} withShadow={false} />
                            <span className="text-xs font-bold text-cocoa-500 max-w-[90px] truncate">
                              {recipe?.name ?? id}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2">
                      <ProgressBar value={patience} />
                      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-cocoa-400">
                        <span>
                          {Math.max(0, Math.ceil((c.patienceMs - elapsed) / 1000))}s patience
                        </span>
                        <button
                          className="text-berry-500 hover:underline"
                          onClick={() => dismissCustomer(c.id)}
                        >
                          send away
                        </button>
                      </div>
                    </div>

                    <button
                      className={`mt-3 w-full rounded-full font-bold py-2.5 shadow-soft transition ${
                        canServe
                          ? "bg-mint-500 text-white hover:bg-mint-400"
                          : "bg-cream-200 text-cocoa-400 cursor-not-allowed"
                      }`}
                      disabled={!canServe}
                      onClick={() => serveCustomer(c.id)}
                    >
                      {canServe ? "Serve order ✨" : "Still prepping…"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
