"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { RECIPE_BY_ID, RECIPES } from "@/game/recipes";
import { INGREDIENTS } from "@/game/ingredients";
import type { IngredientId, Recipe, StationId } from "@/game/types";
import { FoodArt } from "../foods/FoodArt";

function resolveRecipe(id: string, custom: Recipe[]): Recipe | undefined {
  return RECIPE_BY_ID[id] ?? custom.find((r) => r.id === id);
}

const STATION_TITLE: Record<StationId, { title: string; emoji: string }> = {
  drink: { title: "Drink Bar", emoji: "🥤" },
  pastry: { title: "Pastry Counter", emoji: "🧁" },
  oven: { title: "Oven", emoji: "🔥" },
  scratch: { title: "Bakery Oven", emoji: "🥣" },
  pet: { title: "Pet Treat Nook", emoji: "🐾" },
  shelf: { title: "Plush Shelf", emoji: "🧸" },
};

/**
 * Per-station "go time" button label — what the player actually does to
 * kick off the prep timer after combining the ingredients.
 */
const STATION_ACTION: Record<StationId, string> = {
  drink: "Squeeze & pour 🍋",
  pastry: "Decorate 🎀",
  scratch: "Roll & bake 🔥",
  pet: "Shape & bake 🐾",
  oven: "Bake 🔥",
  shelf: "Gift-wrap 🎀",
};

/**
 * Immersive first-person prep scene. The player sees their own hands
 * pouring/icing/mixing a recipe, with a step-by-step caption and a big
 * progress bar. When done, they tap "Plate it" to send the treat to the
 * ready tray.
 *
 * Per-station hand animations make every recipe feel different.
 */
export function PrepScene({
  stationId,
  onClose,
}: {
  stationId: StationId | null;
  onClose: () => void;
}) {
  const inventory = useGame((s) => s.inventory);
  const startPrep = useGame((s) => s.startPrep);
  const collectReady = useGame((s) => s.collectReady);
  const unlocked = useGame((s) => s.unlockedRecipeIds);
  const customRecipes = useGame((s) => s.customRecipes);
  const specialRecipeId = useGame((s) => s.specialRecipeId);
  const playerLevel = useGame((s) => s.level);
  const slot = useGame((s) => (stationId ? s.prep[stationId] : undefined));

  const [now, setNow] = useState(() => Date.now());
  const [combining, setCombining] = useState<{
    recipeId: string;
    added: Partial<Record<IngredientId, number>>;
  } | null>(null);
  useEffect(() => {
    if (!stationId) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [stationId]);
  // Reset combining when station changes or a real prep starts
  useEffect(() => {
    if (!stationId || slot) setCombining(null);
  }, [stationId, slot]);

  if (!stationId) return null;

  // Show base recipes (unlocked OR earned via current level) + all the
  // chef's own inventions that match this station. Specials float to the
  // top so they're easy to re-make. Checking the live level avoids stale
  // unlock lists for returning players who jumped past an unlock gate.
  const recipes = [
    ...RECIPES.filter(
      (r) =>
        r.station === stationId &&
        (unlocked.includes(r.id) ||
          (r.unlockLevel != null && playerLevel >= r.unlockLevel)),
    ),
    ...customRecipes.filter((r) => r.station === stationId),
  ].sort((a, b) => {
    const aw = (a.id === specialRecipeId ? 2 : 0) + (a.isRecommended ? 1 : 0);
    const bw = (b.id === specialRecipeId ? 2 : 0) + (b.isRecommended ? 1 : 0);
    return bw - aw;
  });
  const slotRecipe = slot ? resolveRecipe(slot.recipeId, customRecipes) ?? null : null;
  const progress = slot
    ? Math.min(1, (now - slot.startedAt) / (slot.endsAt - slot.startedAt))
    : 0;
  const done = slot ? now >= slot.endsAt : false;

  // Pick the current step based on progress
  const currentStep = slotRecipe
    ? pickCurrentStep(slotRecipe, progress)
    : null;

  return (
    <AnimatePresence>
      {stationId && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — bakery from a closer angle */}
          <SceneBackdrop stationId={stationId} />

          {/* Header bar */}
          <div className="relative z-10 px-3 pt-3 flex items-center gap-2">
            <div className="rounded-full bg-cream-50/95 border border-cream-200 px-3 py-1.5 font-display text-cocoa-600 shadow-soft">
              {STATION_TITLE[stationId].emoji} {STATION_TITLE[stationId].title}
            </div>
            <div className="flex-1" />
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Stage with hands + recipe artwork */}
          <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
            <PrepStage
              station={stationId}
              recipe={slotRecipe}
              progress={progress}
              done={done}
            />

            {/* Caption */}
            {slotRecipe && (
              <motion.div
                key={currentStep ?? "..."}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-[90%] text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-block bg-cocoa-600/90 text-cream-50 px-4 py-2 rounded-full font-bold shadow-bakery">
                  {done ? "All done — looks delicious!" : currentStep}
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress / actions */}
          <div className="relative z-10 px-3 pb-3">
            {slotRecipe ? (
              <div className="panel max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <FoodArt
                    id={slotRecipe.id}
                    size={56}
                    emoji={slotRecipe.emoji}
                    plushAnimal={slotRecipe.plushAnimal}
                    plushTheme={slotRecipe.plushTheme}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg text-cocoa-600 truncate">
                      {slotRecipe.name}
                    </div>
                    <ProgressTrack value={progress} done={done} />
                  </div>
                  {done ? (
                    <button
                      className="btn-primary bg-mint-500 hover:bg-mint-400"
                      onClick={() => {
                        collectReady(stationId);
                        onClose();
                      }}
                    >
                      Plate it ✨
                    </button>
                  ) : (
                    <span className="text-sm text-cocoa-400 font-bold">
                      {Math.max(0, Math.ceil((slot!.endsAt - now) / 1000))}s
                    </span>
                  )}
                </div>
              </div>
            ) : combining ? (
              <CombiningPanel
                recipe={resolveRecipe(combining.recipeId, customRecipes)!}
                added={combining.added}
                station={stationId}
                onAdd={(ing) =>
                  setCombining((c) =>
                    c
                      ? {
                          ...c,
                          added: {
                            ...c.added,
                            [ing]: (c.added[ing] ?? 0) + 1,
                          },
                        }
                      : c,
                  )
                }
                onCancel={() => setCombining(null)}
                onGo={() => {
                  if (startPrep(combining.recipeId)) setCombining(null);
                }}
              />
            ) : (
              <div className="panel max-w-3xl mx-auto">
                <div className="font-display text-lg text-cocoa-600 mb-2">
                  Pick a recipe to make
                </div>
                {recipes.length === 0 ? (
                  <div className="text-center text-cocoa-400 py-3">
                    Nothing unlocked here yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto cozy-scroll">
                    {recipes.map((r) => (
                      <RecipeChoice
                        key={r.id}
                        recipe={r}
                        inventory={inventory}
                        onStart={() => setCombining({ recipeId: r.id, added: {} })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function pickCurrentStep(recipe: Recipe, progress: number): string {
  const total = recipe.steps.reduce((s, x) => s + x.durationMs, 0);
  let acc = 0;
  for (const step of recipe.steps) {
    acc += step.durationMs;
    if (progress * total <= acc) return step.label;
  }
  return recipe.steps[recipe.steps.length - 1]?.label ?? "Almost ready…";
}

function ProgressTrack({ value, done }: { value: number; done: boolean }) {
  return (
    <div className="mt-1">
      <div className="h-3 rounded-full bg-cream-200 overflow-hidden">
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${Math.max(8, value * 100)}%`,
            background: done
              ? "#86d8a6"
              : "linear-gradient(90deg, #f5b93b, #ea5d7c)",
          }}
        />
      </div>
    </div>
  );
}

function RecipeChoice({
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
      className="rounded-2xl border border-cream-200 p-2 text-left bg-white/80 shadow-soft transition hover:bg-cream-100 disabled:opacity-60"
    >
      <div className="flex items-center gap-2">
        <FoodArt
          id={recipe.id}
          size={56}
          withShadow={false}
          emoji={recipe.emoji}
          plushAnimal={recipe.plushAnimal}
          plushTheme={recipe.plushTheme}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-cocoa-600 truncate">{recipe.name}</span>
            {recipe.isSpecial && <span title="Chef's Special">⭐</span>}
            {recipe.isRecommended && <span title="Recommended">👍</span>}
          </div>
          <div className="text-[11px] text-cocoa-400 truncate">{recipe.description}</div>
          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
            <span className="chip !py-0 !px-2">🪙 ${recipe.price}</span>
            <span className="chip !py-0 !px-2">⏱ {(recipe.prepMs / 1000).toFixed(0)}s</span>
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
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
      {!canCook && (
        <div className="text-[11px] text-red-500 mt-1 font-semibold">
          Need: {missing.join(", ")}
        </div>
      )}
    </button>
  );
}

/* ---------------- Backdrop ---------------- */

function SceneBackdrop({ stationId }: { stationId: StationId }) {
  // Cozy backdrop based on station; gradient + soft texture
  const palette: Record<StationId, [string, string]> = {
    drink: ["#fde6c7", "#ead2a4"],
    pastry: ["#ffe6dc", "#f4c8a8"],
    scratch: ["#fceadb", "#ddb98a"],
    pet: ["#e6f7df", "#bce0a8"],
    oven: ["#fde0c0", "#e0a070"],
    shelf: ["#f5e7d9", "#d7a975"],
  };
  const [a, b] = palette[stationId];
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${a} 0%, ${b} 100%)`,
      }}
    >
      {/* counter foreground stripe */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: "32%",
          height: 90,
          background: "linear-gradient(180deg, #f3e0c2 0%, #c19659 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.18)",
        }}
      />
      {/* counter front */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "32%",
          background: "linear-gradient(180deg, #8a5326 0%, #4a2c14 100%)",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 14px)",
        }}
      />
    </div>
  );
}

/* ---------------- Stage with hands ---------------- */

function PrepStage({
  station,
  recipe,
  progress,
  done,
}: {
  station: StationId;
  recipe: Recipe | null;
  progress: number;
  done: boolean;
}) {
  return (
    <div className="relative w-[min(720px,94vw)] aspect-[5/3]">
      {/* The food artwork sits center on the counter */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={
            done
              ? { y: [-6, 0], scale: [1.05, 1] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: done ? 0.5 : 2, repeat: done ? 0 : Infinity }}
        >
          {recipe ? (
            <FoodArt
              id={recipe.id}
              size={220}
              emoji={recipe.emoji}
              plushAnimal={recipe.plushAnimal}
              plushTheme={recipe.plushTheme}
            />
          ) : (
            <div className="w-[220px] h-[220px] rounded-full bg-white/40 border-2 border-dashed border-cocoa-300" />
          )}
        </motion.div>
        {/* sparkle when done */}
        {done && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles />
          </motion.div>
        )}
      </div>

      {/* Hands per station type */}
      {recipe && !done && <Hands station={station} progress={progress} />}

      {/* Steam/oven/blender FX */}
      {recipe && !done && <Effects station={station} progress={progress} />}
    </div>
  );
}

function Hands({ station, progress }: { station: StationId; progress: number }) {
  // Animate two hand silhouettes coming in from below.
  // Each station has its own pour/mix/ice gesture.
  const t = progress; // 0..1

  const leftBase = { left: "18%", bottom: "5%" };
  const rightBase = { right: "18%", bottom: "5%" };

  switch (station) {
    case "drink":
      return (
        <>
          <HandLeft style={leftBase} item="🥛" tilt={-30 + t * 30} y={-(20 + t * 60)} />
          <HandRight style={rightBase} y={0} />
          {/* pouring stream */}
          <motion.div
            className="absolute"
            style={{ left: "44%", bottom: "32%", width: 6, height: 100 }}
          >
            <motion.div
              className="w-full h-full rounded-b-full"
              style={{
                background: "linear-gradient(180deg, #fff 0%, #f0c97a 100%)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </motion.div>
        </>
      );
    case "pastry":
      return (
        <>
          <HandLeft style={leftBase} item="🧁" tilt={0} y={0} />
          <HandRight style={rightBase} item="🍫" tilt={20 + Math.sin(t * Math.PI * 4) * 12} y={-10} />
        </>
      );
    case "scratch":
      return (
        <>
          <motion.div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "10%" }}>
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ originY: 1 }}
            >
              <div className="text-7xl">🥣</div>
            </motion.div>
          </motion.div>
          <HandLeft style={leftBase} item="🥄" tilt={-20 + Math.sin(t * Math.PI * 6) * 18} y={-8} />
          <HandRight style={rightBase} y={-4} />
        </>
      );
    case "pet":
      return (
        <>
          <HandLeft style={leftBase} item="🦴" tilt={0} y={-4} />
          <HandRight style={rightBase} item="🐟" tilt={0} y={-4} />
        </>
      );
    default:
      return null;
  }
}

function HandLeft({
  style,
  item,
  tilt = 0,
  y = 0,
}: {
  style: React.CSSProperties;
  item?: string;
  tilt?: number;
  y?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ ...style }}
      animate={{ y }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: tilt }}
        transition={{ duration: 0.4 }}
        style={{ originY: 1, originX: 0.7 }}
      >
        <Forearm flip={false} />
        {item && (
          <div
            className="absolute"
            style={{ left: -10, top: -28, fontSize: 60 }}
          >
            {item}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function HandRight({
  style,
  item,
  tilt = 0,
  y = 0,
}: {
  style: React.CSSProperties;
  item?: string;
  tilt?: number;
  y?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ ...style }}
      animate={{ y }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: tilt }}
        transition={{ duration: 0.4 }}
        style={{ originY: 1, originX: 0.3 }}
      >
        <Forearm flip />
        {item && (
          <div
            className="absolute"
            style={{ right: -10, top: -28, fontSize: 60 }}
          >
            {item}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Forearm({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 200"
      width={120}
      height={200}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id="sleeve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8ec" />
          <stop offset="100%" stopColor="#e6cf9c" />
        </linearGradient>
        <radialGradient id="skin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffe2c2" />
          <stop offset="100%" stopColor="#e9b485" />
        </radialGradient>
      </defs>
      {/* sleeve */}
      <path
        d="M30 200 Q34 110 60 80 Q88 110 90 200 Z"
        fill="url(#sleeve)"
        stroke="#c9a560"
        strokeWidth="1"
      />
      {/* cuff */}
      <rect x="32" y="86" width="56" height="10" rx="4" fill="#c9a560" />
      {/* hand */}
      <path
        d="M44 80 Q50 56 60 56 Q70 56 76 80 Q72 96 60 96 Q48 96 44 80 Z"
        fill="url(#skin)"
        stroke="#b9885a"
        strokeWidth="1"
      />
      {/* thumb */}
      <ellipse cx="46" cy="78" rx="6" ry="10" fill="url(#skin)" stroke="#b9885a" strokeWidth="1" />
    </svg>
  );
}

function Effects({ station, progress }: { station: StationId; progress: number }) {
  switch (station) {
    case "drink":
      // steam rising from the cup
      return (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute"
              style={{
                left: `${44 + i * 4}%`,
                top: `${35 - i * 2}%`,
                width: 14,
                height: 18,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                filter: "blur(4px)",
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: -40 }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </>
      );
    case "scratch":
      // oven glow + flour puff
      return (
        <>
          <motion.div
            className="absolute"
            style={{
              left: "50%",
              top: "55%",
              width: 220,
              height: 120,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,170,80,0.55), rgba(255,170,80,0))",
              filter: "blur(8px)",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {progress < 0.45 && (
            <motion.div
              className="absolute"
              style={{ left: "50%", top: "30%", transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 1.6], y: -20 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <span className="text-3xl">💨</span>
            </motion.div>
          )}
        </>
      );
    case "pastry":
      // sprinkle confetti
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const colors = ["#ea5d7c", "#f5b93b", "#86d8a6", "#a78bfa", "#3aa1d0"];
            return (
              <motion.span
                key={i}
                className="absolute w-1.5 h-3 rounded-sm"
                style={{
                  left: `${48 + Math.random() * 4}%`,
                  top: "30%",
                  background: colors[i % colors.length],
                }}
                animate={{ y: 80, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
              />
            );
          })}
        </>
      );
    case "pet":
      return (
        <motion.span
          className="absolute"
          style={{ left: "50%", top: "30%", transform: "translate(-50%, -50%)", fontSize: 36 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          🐾
        </motion.span>
      );
    default:
      return null;
  }
}

/**
 * The combining workbench — player adds each required ingredient to the
 * prep bowl by clicking it, then triggers the station action to start the
 * actual timer. Makes recipes feel like a craft, not a single button.
 */
function CombiningPanel({
  recipe,
  added,
  station,
  onAdd,
  onCancel,
  onGo,
}: {
  recipe: Recipe;
  added: Partial<Record<IngredientId, number>>;
  station: StationId;
  onAdd: (id: IngredientId) => void;
  onCancel: () => void;
  onGo: () => void;
}) {
  const required = Object.entries(recipe.ingredients) as [IngredientId, number][];
  const done = required.every(([k, n]) => (added[k] ?? 0) >= n);
  const totalAdded = required.reduce((s, [k]) => s + (added[k] ?? 0), 0);

  return (
    <div className="panel max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FoodArt
          id={recipe.id}
          size={48}
          withShadow={false}
          emoji={recipe.emoji}
          plushAnimal={recipe.plushAnimal}
          plushTheme={recipe.plushTheme}
        />
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg text-cocoa-600 truncate">
            Combining: {recipe.name}
          </div>
          <div className="text-[11px] text-cocoa-400">
            Tap each ingredient to add it to the bowl.
          </div>
        </div>
        <button className="btn-icon" onClick={onCancel}>
          ✕
        </button>
      </div>

      {/* Bowl preview */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-40 h-24 rounded-b-[48px] rounded-t-lg bg-gradient-to-b from-[#e8c88a] to-[#a9773d] border border-[#7a4f20] shadow-inner overflow-hidden">
          <div className="absolute inset-0 flex flex-wrap gap-1 items-end justify-center p-1">
            {required.flatMap(([k, n]) =>
              Array.from({ length: Math.min(n, added[k] ?? 0) }).map((_, i) => (
                <motion.span
                  key={`${k}-${i}`}
                  initial={{ y: -20, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className="text-2xl leading-none"
                >
                  {INGREDIENTS[k].emoji}
                </motion.span>
              )),
            )}
            {totalAdded === 0 && (
              <span className="text-[11px] text-cocoa-50/80 self-center">
                empty bowl
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ingredient list with add buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {required.map(([k, n]) => {
          const have = added[k] ?? 0;
          const full = have >= n;
          return (
            <button
              key={k}
              disabled={full}
              onClick={() => onAdd(k)}
              className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left ${
                full
                  ? "bg-mint-100 border-mint-300 text-cocoa-500"
                  : "bg-white border-cream-200 hover:bg-cream-100"
              }`}
            >
              <span className="text-2xl">{INGREDIENTS[k].emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-cocoa-700 truncate">
                  {INGREDIENTS[k].name}
                </span>
                <span className="block text-[11px] text-cocoa-400">
                  {have}/{n} {full ? "✓" : "tap to add"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Action */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-cream-100 text-cocoa-600 font-bold"
        >
          Back
        </button>
        <button
          disabled={!done}
          onClick={onGo}
          className={`flex-[2] py-2 rounded-xl font-bold ${
            done
              ? "bg-mint-500 text-white"
              : "bg-cream-100 text-cocoa-400"
          }`}
        >
          {done ? STATION_ACTION[station] : "Add all ingredients first"}
        </button>
      </div>
    </div>
  );
}

function Sparkles() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i * 36 * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute text-xl"
            style={{
              left: `${50 + Math.cos(a) * 38}%`,
              top: `${50 + Math.sin(a) * 38}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.7] }}
            transition={{ duration: 1, delay: i * 0.05 }}
          >
            ✨
          </motion.span>
        );
      })}
    </>
  );
}
