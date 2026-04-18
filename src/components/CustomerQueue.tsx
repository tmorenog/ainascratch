"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { RECIPE_BY_ID } from "@/game/recipes";
import { ProgressBar } from "./ui/ProgressRing";
import { FoodArt } from "./foods/FoodArt";
import type { Customer } from "@/game/types";

export function CustomerQueue({ now }: { now: number }) {
  const customers = useGame((s) => s.customers);
  const ready = useGame((s) => s.ready);
  const serveCustomer = useGame((s) => s.serveCustomer);
  const dismissCustomer = useGame((s) => s.dismissCustomer);
  const isOpen = useGame((s) => s.isOpen);

  return (
    <section className="panel">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl md:text-2xl text-cocoa-600">
          Customers
        </h2>
        <div className="text-sm font-semibold text-cocoa-400">
          {isOpen ? `${customers.length} waiting` : "Shop closed"}
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-8 text-cocoa-400">
          <div className="text-4xl mb-2">🌼</div>
          {isOpen
            ? "The bell is ringing gently. A friendly face will arrive soon…"
            : "Open your shop to welcome customers!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence initial={false}>
            {customers.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                now={now}
                readyCounts={countReady(ready)}
                onServe={() => serveCustomer(c.id)}
                onDismiss={() => dismissCustomer(c.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function countReady(ready: { recipeId: string }[]): Record<string, number> {
  const m: Record<string, number> = {};
  ready.forEach((r) => (m[r.recipeId] = (m[r.recipeId] ?? 0) + 1));
  return m;
}

function CustomerCard({
  customer,
  now,
  readyCounts,
  onServe,
  onDismiss,
}: {
  customer: Customer;
  now: number;
  readyCounts: Record<string, number>;
  onServe: () => void;
  onDismiss: () => void;
}) {
  const elapsed = now - customer.arrivedAt;
  const patience = 1 - elapsed / customer.patienceMs;

  const orderCounts: Record<string, number> = {};
  customer.order.forEach((id) => (orderCounts[id] = (orderCounts[id] ?? 0) + 1));
  const canServe = Object.entries(orderCounts).every(
    ([id, n]) => (readyCounts[id] ?? 0) >= n,
  );

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="rounded-2xl border border-cream-200 bg-white/85 p-3 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-soft shrink-0"
          style={{ background: customer.color }}
        >
          {customer.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-cocoa-600 truncate">{customer.name}</div>
            {customer.hasPet && (
              <span className="chip !py-0 !px-2 !text-xs">
                {customer.hasPet === "dog" ? "🐶 pup" : "🐱 cat"}
              </span>
            )}
          </div>
          <div className="text-xs text-cocoa-400 italic truncate">&ldquo;{customer.greeting}&rdquo;</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {customer.order.map((id, i) => {
          const recipe = RECIPE_BY_ID[id];
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-xl bg-cream-100 border border-cream-200 px-2 py-1"
              title={recipe?.name}
            >
              <FoodArt id={id} size={36} withShadow={false} />
              <span className="text-xs font-bold text-cocoa-500 max-w-[90px] truncate">
                {recipe?.name ?? id}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <ProgressBar value={patience} />
        <div className="mt-1 flex items-center justify-between text-xs font-semibold text-cocoa-400">
          <span>{Math.max(0, Math.ceil((customer.patienceMs - elapsed) / 1000))}s patience</span>
          <button
            className="text-berry-500 hover:underline"
            onClick={onDismiss}
          >
            send away
          </button>
        </div>
      </div>

      <button
        className={`mt-3 w-full rounded-full font-bold py-2.5 shadow-soft transition ${
          canServe
            ? "bg-mint-500 text-white hover:bg-mint-400"
            : "bg-cream-200 text-cocoa-400 cursor-not-allowed"
        }`}
        disabled={!canServe}
        onClick={onServe}
      >
        {canServe ? "Serve order ✨" : "Still prepping…"}
      </button>
    </motion.div>
  );
}
