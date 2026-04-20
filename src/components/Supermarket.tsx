"use client";

import { useMemo, useState } from "react";
import { Modal } from "./ui/Modal";
import { INGREDIENT_LIST, INGREDIENTS } from "@/game/ingredients";
import type { IngredientId } from "@/game/types";
import { useGame } from "@/game/store";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/game/i18n";

export function Supermarket({ open, onClose }: { open: boolean; onClose: () => void }) {
  const coins = useGame((s) => s.coins);
  const inventory = useGame((s) => s.inventory);
  const pending = useGame((s) => s.pendingSupply);
  const orderSupplies = useGame((s) => s.orderSupplies);
  const t = useT();

  const [cart, setCart] = useState<Partial<Record<IngredientId, number>>>({});

  const totalCost = useMemo(
    () =>
      (Object.entries(cart) as [IngredientId, number][]).reduce(
        (sum, [k, n]) => sum + INGREDIENTS[k].pricePerUnit * (n ?? 0),
        0,
      ),
    [cart],
  );

  function addOne(id: IngredientId) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function subOne(id: IngredientId) {
    setCart((c) => {
      const v = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (v <= 0) delete next[id];
      else next[id] = v;
      return next;
    });
  }
  function addPack(id: IngredientId, amt: number) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + amt }));
  }
  function checkout() {
    if (totalCost <= 0 || totalCost > coins) return;
    orderSupplies(cart);
    setCart({});
  }

  return (
    <Modal open={open} onClose={onClose} title={t("supermarketTitle")} maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="chip">🪙 {t("youHave")}: <span className="ml-1 tabular-nums font-black">{coins}</span></div>
        {pending.length > 0 && (
          <div className="chip">{t("deliveryArrivingSoon", { count: pending.length })}</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {INGREDIENT_LIST.map((ing) => {
          const qty = cart[ing.id] ?? 0;
          return (
            <div
              key={ing.id}
              className="rounded-2xl border border-cream-200 bg-white/85 p-3 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-2xl">
                  {ing.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-cocoa-600">{ing.name}</div>
                  <div className="text-xs text-cocoa-400">
                    🪙 ${ing.pricePerUnit} / {ing.unit} · you have {inventory[ing.id] ?? 0}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <button className="btn-secondary !px-3 !py-1.5" onClick={() => subOne(ing.id)}>–</button>
                <span className="min-w-[1.5rem] text-center font-bold">{qty}</span>
                <button className="btn-secondary !px-3 !py-1.5" onClick={() => addOne(ing.id)}>+</button>
                <div className="flex-1" />
                <button className="btn-secondary !px-2 !py-1 !text-xs" onClick={() => addPack(ing.id, 5)}>+5</button>
                <button className="btn-secondary !px-2 !py-1 !text-xs" onClick={() => addPack(ing.id, 10)}>+10</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-4 bg-cream-50/95 backdrop-blur pt-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-cocoa-400 font-bold uppercase tracking-wide">{t("totalLabel")}</div>
          <div className="font-display text-2xl text-cocoa-600">🪙 ${totalCost}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setCart({})}>{t("clearCart")}</button>
          <button
            className="btn-primary disabled:opacity-50"
            disabled={totalCost <= 0 || totalCost > coins}
            onClick={checkout}
          >
            {t("placeOrder")}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            className="mt-4 rounded-2xl border border-cream-200 bg-white/85 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-xs font-bold text-cocoa-500 mb-1">
              {t("incomingDeliveries")}
            </div>
            {pending.map((o) => (
              <div key={o.id} className="text-sm text-cocoa-500">
                🚚 ${o.totalCost} · {Object.keys(o.items).length} ingredient{Object.keys(o.items).length === 1 ? "" : "s"}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
