"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { RECIPES } from "@/game/recipes";
import { INGREDIENTS } from "@/game/ingredients";
import type { IngredientId, Recipe, RecipeCategory } from "@/game/types";
import { FoodArt } from "./foods/FoodArt";
import { useGame } from "@/game/store";
import { useT } from "@/game/i18n";

type TabId = RecipeCategory | "all" | "mine";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "📖" },
  { id: "drink", label: "Drinks", emoji: "🥤" },
  { id: "pastry", label: "Pastries", emoji: "🧁" },
  { id: "scratch", label: "Baked", emoji: "🥣" },
  { id: "pet", label: "Pet Treats", emoji: "🐾" },
  { id: "mine", label: "Mine", emoji: "🧪" },
];

export function RecipeBook({
  open,
  onClose,
  onInvent,
}: {
  open: boolean;
  onClose: () => void;
  onInvent?: () => void;
}) {
  const [tab, setTab] = useState<TabId>("all");
  const unlocked = useGame((s) => s.unlockedRecipeIds);
  const customRecipes = useGame((s) => s.customRecipes);
  const specialRecipeId = useGame((s) => s.specialRecipeId);
  const removeCustomRecipe = useGame((s) => s.removeCustomRecipe);
  const setSpecial = useGame((s) => s.setSpecial);
  const toggleRecommended = useGame((s) => s.toggleRecommended);
  const t = useT();

  const allRecipes: Recipe[] = [...RECIPES, ...customRecipes];
  const list =
    tab === "all"
      ? allRecipes
      : tab === "mine"
      ? customRecipes
      : allRecipes.filter((r) => r.category === tab);

  return (
    <Modal open={open} onClose={onClose} title="Recipe Book 📖" maxWidth="max-w-4xl">
      <div className="flex flex-wrap items-center gap-1.5 mb-3 sticky top-0 bg-cream-50/95 py-1 z-10">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-bold border transition ${
              tab === tb.id
                ? "bg-cocoa-400 text-white border-cocoa-400"
                : "bg-cream-100 text-cocoa-500 border-cream-200 hover:bg-cream-200"
            }`}
          >
            {tb.emoji} {tb.label}
          </button>
        ))}
        <div className="flex-1" />
        {onInvent && (
          <button
            onClick={onInvent}
            className="rounded-full px-3 py-1.5 text-sm font-bold bg-berry-500 text-white shadow-soft hover:bg-berry-600"
          >
            + 🧪 {t("inventRecipe")}
          </button>
        )}
      </div>

      {tab === "mine" && list.length === 0 && (
        <div className="text-center text-cocoa-400 italic py-6">
          {t("noCreationsYet")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((r) => {
          const isUnlocked = r.isCustom || unlocked.includes(r.id);
          const isTheSpecial = r.id === specialRecipeId;
          return (
            <div
              key={r.id}
              className={`relative rounded-2xl border p-3 bg-white/85 shadow-soft ${
                isTheSpecial
                  ? "border-amber-300 ring-2 ring-amber-200"
                  : "border-cream-200"
              } ${!isUnlocked ? "opacity-60" : ""}`}
            >
              {isTheSpecial && (
                <div className="absolute -top-2 -right-2 rounded-full bg-amber-400 text-white text-[11px] font-bold px-2 py-0.5 shadow-soft">
                  ⭐ {t("chefsSpecial")}
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {isUnlocked ? (
                    <FoodArt id={r.id} size={72} emoji={r.emoji} />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-xl bg-cream-100 flex items-center justify-center text-3xl">
                      🔒
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-lg text-cocoa-600 truncate">
                      {r.name}
                    </div>
                    <span className="chip !py-0 !px-2 !text-xs">🪙 ${r.price}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap mt-0.5">
                    {r.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-berry-100 text-berry-700 border border-berry-200 font-bold">
                        🧪 {t("yourCreations")}
                      </span>
                    )}
                    {r.isRecommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mint-100 text-mint-700 border border-mint-200 font-bold">
                        👍 {t("recommended")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-cocoa-400 italic">
                    {isUnlocked
                      ? r.description
                      : `Unlocks at level ${r.unlockLevel ?? "?"}`}
                  </div>
                </div>
              </div>
              {isUnlocked && (
                <>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(Object.entries(r.ingredients) as [IngredientId, number][]).map(
                      ([k, n]) => (
                        <span
                          key={k}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 border border-cream-200 text-cocoa-500"
                        >
                          {INGREDIENTS[k].emoji} {n} {INGREDIENTS[k].unit}
                          {n > 1 ? "s" : ""}
                        </span>
                      ),
                    )}
                  </div>
                  <ol className="mt-2 text-xs text-cocoa-500 space-y-1 list-decimal list-inside">
                    {r.steps.map((s, i) => (
                      <li key={i}>
                        {s.label}{" "}
                        <span className="text-cocoa-300">
                          · {(s.durationMs / 1000).toFixed(0)}s
                        </span>
                      </li>
                    ))}
                  </ol>
                  {r.funFact && (
                    <div className="mt-2 text-xs text-cocoa-400 italic">
                      ✨ {r.funFact}
                    </div>
                  )}
                  {r.isCustom && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() =>
                          setSpecial(isTheSpecial ? null : r.id)
                        }
                        className={`text-[11px] px-2 py-1 rounded-lg font-bold transition ${
                          isTheSpecial
                            ? "bg-amber-400 text-white"
                            : "bg-cream-200 text-cocoa-600 hover:bg-cream-300"
                        }`}
                      >
                        ⭐ {isTheSpecial ? t("chefsSpecial") : t("markSpecial")}
                      </button>
                      <button
                        onClick={() => toggleRecommended(r.id)}
                        className={`text-[11px] px-2 py-1 rounded-lg font-bold transition ${
                          r.isRecommended
                            ? "bg-mint-400 text-white"
                            : "bg-cream-200 text-cocoa-600 hover:bg-cream-300"
                        }`}
                      >
                        👍 {t("markRecommended")}
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => removeCustomRecipe(r.id)}
                        className="text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100"
                      >
                        🗑️ {t("removeRecipe")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
