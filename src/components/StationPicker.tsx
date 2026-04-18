"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { RECIPES, RECIPE_BY_ID } from "@/game/recipes";
import { INGREDIENTS } from "@/game/ingredients";
import type { IngredientId, Recipe, StationId } from "@/game/types";
import { FoodArt } from "./foods/FoodArt";
import { ProgressRing } from "./ui/ProgressRing";
import { useEffect, useState } from "react";

const STATION_META: Record<StationId, { title: string; emoji: string }> = {
  drink: { title: "Drink Bar", emoji: "🥤" },
  pastry: { title: "Pastry Counter", emoji: "🧁" },
  oven: { title: "Oven", emoji: "🔥" },
  scratch: { title: "Scratch Workshop", emoji: "🥣" },
  pet: { title: "Pet Treat Nook", emoji: "🐾" },
};

/**
 * Bottom-sheet recipe picker for a single station, used by the 3D world
 * when the player interacts with a station totem.
 */
export function StationPicker({
  stationId,
  onClose,
}: {
  stationId: StationId | null;
  onClose: () => void;
}) {
  const inventory = useGame((s) => s.inventory);
  const startPrep = useGame((s) => s.startPrep);
  const unlocked = useGame((s) => s.unlockedRecipeIds);
  const slot = useGame((s) => (stationId ? s.prep[stationId] : undefined));
  const collectReady = useGame((s) => s.collectReady);

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!stationId) return;
    const id = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(id);
  }, [stationId]);

  const recipes = stationId
    ? RECIPES.filter((r) => r.station === stationId && unlocked.includes(r.id))
    : [];

  const slotRecipe = slot ? RECIPE_BY_ID[slot.recipeId] : null;
  const progress = slot ? Math.min(1, (now - slot.startedAt) / (slot.endsAt - slot.startedAt)) : 0;
  const done = slot ? now >= slot.endsAt : false;

  return (
    <AnimatePresence>
      {stationId && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-cocoa-600/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-3xl bg-cream-50 rounded-t-3xl md:rounded-3xl border border-cream-200 shadow-bakery p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-2xl text-cocoa-600">
                {STATION_META[stationId].emoji} {STATION_META[stationId].title}
              </h3>
              <button className="btn-icon" onClick={onClose}>✕</button>
            </div>

            {slot && slotRecipe && (
              <div
                className={`mb-3 rounded-2xl p-3 flex items-center gap-3 border ${
                  done ? "bg-mint-300/40 border-mint-500" : "bg-cream-100 border-cream-200"
                }`}
              >
                <FoodArt id={slotRecipe.id} size={56} />
                <div className="flex-1">
                  <div className="font-bold text-cocoa-600">
                    {done ? "Ready!" : "Prepping…"}
                  </div>
                  <div className="text-sm text-cocoa-400">{slotRecipe.name}</div>
                </div>
                {done ? (
                  <button
                    className="btn-primary bg-mint-500 hover:bg-mint-400"
                    onClick={() => {
                      collectReady(stationId);
                    }}
                  >
                    Plate it ✨
                  </button>
                ) : (
                  <ProgressRing value={progress} size={44} stroke={5} />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[58vh] overflow-y-auto cozy-scroll">
              {recipes.map((r) => (
                <RecipeButton
                  key={r.id}
                  recipe={r}
                  inventory={inventory}
                  busy={!!slot}
                  onStart={() => {
                    const ok = startPrep(r.id);
                    if (ok) onClose();
                  }}
                />
              ))}
              {recipes.length === 0 && (
                <div className="col-span-full text-center text-cocoa-400 py-8">
                  Nothing unlocked here yet. Keep serving to unlock more!
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecipeButton({
  recipe,
  inventory,
  busy,
  onStart,
}: {
  recipe: Recipe;
  inventory: Record<IngredientId, number>;
  busy: boolean;
  onStart: () => void;
}) {
  const missing = (Object.entries(recipe.ingredients) as [IngredientId, number][])
    .filter(([k, n]) => (inventory[k] ?? 0) < n)
    .map(([k]) => INGREDIENTS[k].name);

  const canCook = missing.length === 0 && !busy;

  return (
    <button
      disabled={!canCook}
      onClick={onStart}
      className="rounded-2xl border border-cream-200 p-3 text-left bg-white/80 shadow-soft transition hover:bg-cream-100 disabled:opacity-60 disabled:hover:bg-white/80"
    >
      <div className="flex items-center gap-3">
        <FoodArt id={recipe.id} size={64} withShadow={false} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-cocoa-600 truncate">{recipe.name}</div>
          <div className="text-xs text-cocoa-400 truncate">{recipe.description}</div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="chip !py-0 !px-2">🪙 ${recipe.price}</span>
            <span className="chip !py-0 !px-2">⏱ {(recipe.prepMs / 1000).toFixed(0)}s</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {(Object.entries(recipe.ingredients) as [IngredientId, number][]).map(([k, n]) => {
          const have = inventory[k] ?? 0;
          const ok = have >= n;
          return (
            <span
              key={k}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                ok
                  ? "bg-cream-100 border-cream-200 text-cocoa-500"
                  : "bg-red-50 border-red-200 text-red-500"
              }`}
            >
              {INGREDIENTS[k].emoji} {n}
            </span>
          );
        })}
      </div>
      {busy ? (
        <div className="text-xs text-cocoa-400 mt-1 font-semibold">Station busy…</div>
      ) : missing.length ? (
        <div className="text-xs text-red-500 mt-1 font-semibold">
          Need: {missing.join(", ")}
        </div>
      ) : null}
    </button>
  );
}
