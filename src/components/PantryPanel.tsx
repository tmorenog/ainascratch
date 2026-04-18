"use client";

import { Modal } from "./ui/Modal";
import { useGame } from "@/game/store";
import { INGREDIENT_LIST } from "@/game/ingredients";

/**
 * Lightweight pantry view shown when the player walks to the pantry shelf.
 * Surfaces what's on hand plus a quick link to the supermarket.
 */
export function PantryPanel({
  open,
  onClose,
  onOpenSupermarket,
}: {
  open: boolean;
  onClose: () => void;
  onOpenSupermarket: () => void;
}) {
  const inventory = useGame((s) => s.inventory);
  const pending = useGame((s) => s.pendingSupply);

  return (
    <Modal open={open} onClose={onClose} title="Pantry Shelf 🧺" maxWidth="max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {INGREDIENT_LIST.map((ing) => {
          const v = inventory[ing.id] ?? 0;
          const low = v <= 2;
          return (
            <div
              key={ing.id}
              className={`rounded-2xl border p-2 text-center shadow-soft ${
                low
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white/85 border-cream-200 text-cocoa-500"
              }`}
            >
              <div className="text-2xl">{ing.emoji}</div>
              <div className="font-bold text-sm truncate">{ing.name}</div>
              <div className="text-xs tabular-nums">
                {v} {ing.unit}
                {v === 1 ? "" : "s"}
              </div>
            </div>
          );
        })}
      </div>

      {pending.length > 0 && (
        <div className="mt-3 rounded-2xl border border-cream-200 bg-white/85 p-3">
          <div className="text-xs font-bold text-cocoa-500 mb-1">Deliveries on the way</div>
          {pending.map((o) => (
            <div key={o.id} className="text-sm text-cocoa-500">
              🚚 ${o.totalCost} · {Object.keys(o.items).length} ingredient
              {Object.keys(o.items).length === 1 ? "" : "s"}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          className="btn-primary"
          onClick={() => {
            onClose();
            onOpenSupermarket();
          }}
        >
          🛒 Call the supermarket
        </button>
      </div>
    </Modal>
  );
}
