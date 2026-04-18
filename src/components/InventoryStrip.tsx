"use client";

import { useGame } from "@/game/store";
import { INGREDIENT_LIST } from "@/game/ingredients";

export function InventoryStrip({ onOpenSupermarket }: { onOpenSupermarket: () => void }) {
  const inventory = useGame((s) => s.inventory);
  return (
    <section className="panel !p-3 md:!p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-lg md:text-xl text-cocoa-600">Pantry</div>
        <button className="btn-secondary !py-1.5 !px-3 text-sm" onClick={onOpenSupermarket}>
          🛒 Restock
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {INGREDIENT_LIST.map((ing) => {
          const v = inventory[ing.id] ?? 0;
          const low = v <= 2;
          return (
            <div
              key={ing.id}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold ${
                low
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-cream-100 border-cream-200 text-cocoa-500"
              }`}
              title={ing.name}
            >
              <span className="text-base leading-none">{ing.emoji}</span>
              <span className="tabular-nums">{v}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
