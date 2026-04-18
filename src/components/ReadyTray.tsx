"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { RECIPE_BY_ID } from "@/game/recipes";
import { FoodArt } from "./foods/FoodArt";

export function ReadyTray() {
  const ready = useGame((s) => s.ready);

  return (
    <section className="panel">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl md:text-2xl text-cocoa-600">Ready to serve</h2>
        <span className="chip">{ready.length} item{ready.length === 1 ? "" : "s"}</span>
      </div>
      <div className="glass-case rounded-2xl p-3 min-h-[110px]">
        {ready.length === 0 ? (
          <div className="text-center text-cocoa-400 py-4">
            🍩 Freshly-made items will line up here.
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <AnimatePresence initial={false}>
              {ready.map((r) => {
                const recipe = RECIPE_BY_ID[r.recipeId];
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ scale: 0.6, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.7, opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex flex-col items-center w-20"
                    title={recipe?.name}
                  >
                    <FoodArt id={r.recipeId} size={72} />
                    <span className="text-[11px] font-bold text-cocoa-500 truncate max-w-[80px]">
                      {recipe?.name ?? r.recipeId}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
