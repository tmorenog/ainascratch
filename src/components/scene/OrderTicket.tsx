"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Customer } from "@/game/types";
import { RECIPE_BY_ID } from "@/game/recipes";
import { FoodArt } from "../foods/FoodArt";
import { useGame } from "@/game/store";

/**
 * The black order ticket that lives along the bottom of the screen.
 * Shows the focused customer's name + greeting + each item they want.
 */
export function OrderTicket({
  customer,
  patienceRatio,
  onServe,
  canServe,
}: {
  customer: Customer | null;
  patienceRatio?: number;
  onServe?: () => void;
  canServe?: boolean;
}) {
  const customRecipes = useGame((s) => s.customRecipes);
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[min(720px,94vw)]">
      <AnimatePresence mode="wait">
        {customer ? (
          <motion.div
            key={customer.id}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="rounded-3xl border border-cocoa-600 shadow-bakery overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #211610 0%, #0e0805 100%)",
              boxShadow:
                "0 12px 30px -10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* faux chalkboard frame */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-soft"
                  style={{ background: customer.color }}
                >
                  {customer.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="font-display font-black text-white text-lg leading-none">
                      {customer.name}
                    </div>
                    <div className="text-cream-300/80 text-xs italic truncate">
                      “{customer.greeting}”
                    </div>
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider font-bold text-cream-300/70">
                    Today&apos;s order
                  </div>
                </div>
                {typeof patienceRatio === "number" && (
                  <PatienceClock ratio={Math.max(0, Math.min(1, patienceRatio))} />
                )}
                {onServe && (
                  <button
                    onClick={onServe}
                    disabled={!canServe}
                    className={`rounded-full px-4 py-2 font-bold text-sm shadow-soft transition shrink-0 ${
                      canServe
                        ? "bg-mint-500 text-white hover:bg-mint-400 animate-wiggle"
                        : "bg-cocoa-600/60 text-cream-300/60 cursor-not-allowed"
                    }`}
                  >
                    {canServe ? "Serve ✨" : "Prep first"}
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {customer.order.map((id, i) => {
                  const recipe =
                    RECIPE_BY_ID[id] ?? customRecipes.find((r) => r.id === id);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-2 py-1"
                    >
                      <FoodArt
                        id={id}
                        size={32}
                        withShadow={false}
                        emoji={recipe?.emoji}
                        plushAnimal={recipe?.plushAnimal}
                        plushTheme={recipe?.plushTheme}
                      />
                      <span className="text-xs font-bold text-cream-100">
                        {recipe?.name ?? id}
                      </span>
                    </div>
                  );
                })}
                {customer.hasPet && (
                  <div className="rounded-xl bg-white/5 border border-white/10 px-2 py-1 text-xs font-bold text-cream-100 flex items-center gap-1">
                    {customer.hasPet === "dog" ? "🐶" : "🐱"} pet treat please!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PatienceClock({ ratio }: { ratio: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = c * ratio;
  const color = ratio > 0.6 ? "#86d8a6" : ratio > 0.3 ? "#f5b93b" : "#ef6479";
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dasharray 120ms linear" }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">
        {Math.ceil(ratio * 99)}%
      </text>
    </svg>
  );
}
