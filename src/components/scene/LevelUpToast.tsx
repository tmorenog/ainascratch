"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { RECIPE_BY_ID } from "@/game/recipes";
import { FoodArt } from "../foods/FoodArt";

/**
 * Big celebratory toast that pops in when the player levels up. Shows the
 * new level + any newly-unlocked recipes with confetti and sparkles.
 */
export function LevelUpToast() {
  const levelUps = useGame((s) => s.levelUps);
  const acknowledge = useGame((s) => s.acknowledgeLevelUp);
  const current = levelUps[0];

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop dim */}
          <div className="absolute inset-0 bg-cocoa-600/40 backdrop-blur-sm pointer-events-auto" />

          {/* Confetti */}
          {Array.from({ length: 24 }).map((_, i) => {
            const colors = ["#ea5d7c", "#f5b93b", "#86d8a6", "#a78bfa", "#3aa1d0"];
            return (
              <motion.span
                key={i}
                className="absolute w-2 h-3 rounded-sm"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 30}%`,
                  top: `${30 + (Math.random() - 0.5) * 10}%`,
                  background: colors[i % colors.length],
                }}
                initial={{ y: 0, opacity: 0, rotate: 0 }}
                animate={{
                  y: [0, -60 - Math.random() * 80, 220],
                  x: (Math.random() - 0.5) * 220,
                  opacity: [0, 1, 1, 0],
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{ duration: 2.4, ease: "easeOut" }}
              />
            );
          })}

          <motion.div
            className="relative pointer-events-auto bg-cream-50 rounded-3xl border border-cream-200 shadow-bakery p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.6, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 20 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <div className="text-5xl mb-1 animate-wiggle inline-block">🎉</div>
            <div className="font-display text-3xl text-cocoa-600 font-black">
              Level {current.level}!
            </div>
            <div className="text-cocoa-400 text-sm mt-1">
              You&apos;re a better baker every minute.
            </div>

            {current.unlockedRecipeIds.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider font-bold text-cocoa-400">
                  New recipe{current.unlockedRecipeIds.length > 1 ? "s" : ""} unlocked
                </div>
                <div className="mt-2 grid gap-2 grid-cols-1">
                  {current.unlockedRecipeIds.map((id) => {
                    const r = RECIPE_BY_ID[id];
                    if (!r) return null;
                    return (
                      <div
                        key={id}
                        className="rounded-2xl border border-cream-200 bg-white/85 p-2 flex items-center gap-3 text-left"
                      >
                        <FoodArt id={id} size={48} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-cocoa-600 truncate">
                            {r.name}
                          </div>
                          <div className="text-xs text-cocoa-400 truncate">
                            {r.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              className="mt-5 btn-primary w-full"
              onClick={() => acknowledge(current.id)}
            >
              Keep baking! 🧁
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
