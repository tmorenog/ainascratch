"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { RECIPES } from "@/game/recipes";
import { INGREDIENTS } from "@/game/ingredients";
import type { IngredientId, RecipeCategory } from "@/game/types";
import { FoodArt } from "./foods/FoodArt";
import { useGame } from "@/game/store";

const TABS: { id: RecipeCategory | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "📖" },
  { id: "drink", label: "Drinks", emoji: "🥤" },
  { id: "pastry", label: "Pastries", emoji: "🧁" },
  { id: "scratch", label: "Baked", emoji: "🥣" },
  { id: "pet", label: "Pet Treats", emoji: "🐾" },
];

export function RecipeBook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<RecipeCategory | "all">("all");
  const unlocked = useGame((s) => s.unlockedRecipeIds);

  const list = tab === "all" ? RECIPES : RECIPES.filter((r) => r.category === tab);

  return (
    <Modal open={open} onClose={onClose} title="Recipe Book 📖" maxWidth="max-w-4xl">
      <div className="flex flex-wrap gap-1.5 mb-3 sticky top-0 bg-cream-50/95 py-1 z-10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-bold border transition ${
              tab === t.id
                ? "bg-cocoa-400 text-white border-cocoa-400"
                : "bg-cream-100 text-cocoa-500 border-cream-200 hover:bg-cream-200"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((r) => {
          const isUnlocked = unlocked.includes(r.id);
          return (
            <div
              key={r.id}
              className={`rounded-2xl border border-cream-200 p-3 bg-white/85 shadow-soft ${
                !isUnlocked ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {isUnlocked ? (
                    <FoodArt id={r.id} size={72} />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-xl bg-cream-100 flex items-center justify-center text-3xl">
                      🔒
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg text-cocoa-600 truncate">
                      {r.name}
                    </div>
                    <span className="chip !py-0 !px-2 !text-xs">🪙 ${r.price}</span>
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
                </>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
