"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useGame } from "@/game/store";
import { RECIPES, RECIPE_BY_ID, recipesByCategory } from "@/game/recipes";
import { INGREDIENTS } from "@/game/ingredients";
import type { IngredientId, Recipe, StationId } from "@/game/types";
import { ProgressRing } from "./ui/ProgressRing";
import { FoodArt } from "./foods/FoodArt";

const STATION_META: Record<StationId, { title: string; emoji: string; accent: string }> = {
  drink: { title: "Drink Bar", emoji: "🥤", accent: "from-pink-200 to-amber-100" },
  pastry: { title: "Pastry Counter", emoji: "🧁", accent: "from-amber-100 to-cream-100" },
  oven: { title: "Oven", emoji: "🔥", accent: "from-orange-200 to-red-100" },
  scratch: { title: "Scratch Workshop", emoji: "🥣", accent: "from-amber-200 to-cream-100" },
  pet: { title: "Pet Treat Nook", emoji: "🐾", accent: "from-mint-300 to-cream-100" },
};

export function StationGrid({ now }: { now: number }) {
  const [pickerFor, setPickerFor] = useState<StationId | null>(null);
  const stations: StationId[] = ["drink", "pastry", "scratch", "pet"];

  return (
    <section className="panel">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl md:text-2xl text-cocoa-600">Kitchen</h2>
        <span className="text-xs text-cocoa-400 font-semibold">
          Tap a station to start a new treat
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stations.map((id) => (
          <StationCard
            key={id}
            stationId={id}
            now={now}
            onPick={() => setPickerFor(id)}
          />
        ))}
      </div>

      <RecipePicker
        stationId={pickerFor}
        onClose={() => setPickerFor(null)}
      />
    </section>
  );
}

function StationCard({
  stationId,
  now,
  onPick,
}: {
  stationId: StationId;
  now: number;
  onPick: () => void;
}) {
  const slot = useGame((s) => s.prep[stationId]);
  const collectReady = useGame((s) => s.collectReady);
  const meta = STATION_META[stationId];

  const isBusy = !!slot;
  const recipe = slot ? RECIPE_BY_ID[slot.recipeId] : null;
  const progress = slot
    ? Math.min(1, (now - slot.startedAt) / (slot.endsAt - slot.startedAt))
    : 0;
  const done = slot ? now >= slot.endsAt : false;

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (done && slot) {
          collectReady(stationId);
        } else if (!isBusy) {
          onPick();
        }
      }}
      className={`relative rounded-2xl border border-cream-200 p-3 text-left bg-gradient-to-b ${meta.accent} shadow-soft overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <span className="font-display font-bold text-cocoa-600">{meta.title}</span>
        </div>
        {done && (
          <span className="animate-wiggle origin-center text-xs font-bold text-mint-500">
            READY!
          </span>
        )}
      </div>

      <div className="mt-2 aspect-square relative rounded-xl bg-white/60 flex items-center justify-center overflow-hidden">
        {stationId === "drink" && isBusy && <Steam />}
        {stationId === "scratch" && isBusy && !done && <OvenGlow />}
        {stationId === "pet" && isBusy && <PawFloaters />}
        {recipe ? (
          <motion.div
            key={recipe.id}
            className={`relative ${done ? "animate-wiggle" : ""}`}
            animate={done ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FoodArt id={recipe.id} size={90} withShadow={false} />
            {!done && (
              <div className="absolute inset-0 rounded-full shimmer-bg mix-blend-soft-light" />
            )}
          </motion.div>
        ) : (
          <div className="text-4xl opacity-40">＋</div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-cocoa-500 truncate">
          {isBusy ? recipe?.name : "Tap to start"}
        </span>
        {isBusy && (
          <ProgressRing value={progress} size={30} stroke={4} />
        )}
      </div>
    </motion.button>
  );
}

function Steam() {
  return (
    <>
      <span className="steam" style={{ left: "44%", top: "40%" }} />
      <span className="steam" style={{ left: "52%", top: "34%", animationDelay: "0.6s" }} />
      <span className="steam" style={{ left: "48%", top: "46%", animationDelay: "1.2s" }} />
    </>
  );
}

function OvenGlow() {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ boxShadow: ["inset 0 -30px 60px -10px rgba(255,100,40,0.2)", "inset 0 -30px 60px -10px rgba(255,160,40,0.55)"] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
    />
  );
}

function PawFloaters() {
  return (
    <>
      <motion.span
        className="absolute text-sm opacity-40"
        style={{ left: "8%", top: "15%" }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >🐾</motion.span>
      <motion.span
        className="absolute text-sm opacity-40"
        style={{ right: "10%", bottom: "15%" }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
      >🐾</motion.span>
    </>
  );
}

/* ---------- Recipe picker modal-ish sheet ---------- */
function RecipePicker({
  stationId,
  onClose,
}: {
  stationId: StationId | null;
  onClose: () => void;
}) {
  const inventory = useGame((s) => s.inventory);
  const startPrep = useGame((s) => s.startPrep);
  const unlocked = useGame((s) => s.unlockedRecipeIds);

  const recipes = stationId
    ? RECIPES.filter((r) => r.station === stationId && unlocked.includes(r.id))
    : [];

  return (
    <AnimatePresence>
      {stationId && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-cocoa-600/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-3xl bg-cream-50 rounded-t-3xl md:rounded-3xl border border-cream-200 shadow-bakery p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-2xl text-cocoa-600">
                {stationId && STATION_META[stationId].title}
              </h3>
              <button className="btn-icon" onClick={onClose}>✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto cozy-scroll">
              {recipes.map((r) => (
                <RecipeButton
                  key={r.id}
                  recipe={r}
                  inventory={inventory}
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
  onStart,
}: {
  recipe: Recipe;
  inventory: Record<IngredientId, number>;
  onStart: () => void;
}) {
  const missing = (Object.entries(recipe.ingredients) as [IngredientId, number][])
    .filter(([k, n]) => (inventory[k] ?? 0) < n)
    .map(([k]) => INGREDIENTS[k].name);

  const canCook = missing.length === 0;

  return (
    <button
      disabled={!canCook}
      onClick={onStart}
      className={`rounded-2xl border border-cream-200 p-3 text-left bg-white/80 shadow-soft transition hover:bg-cream-100 disabled:opacity-60 disabled:hover:bg-white/80`}
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
              {INGREDIENTS[k].emoji} {n} {INGREDIENTS[k].unit}
            </span>
          );
        })}
      </div>
      {!canCook && (
        <div className="text-xs text-red-500 mt-1 font-semibold">
          Need: {missing.join(", ")}
        </div>
      )}
    </button>
  );
}
