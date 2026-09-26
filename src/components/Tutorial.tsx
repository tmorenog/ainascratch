"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { useT } from "@/game/i18n";
import type { TKey } from "@/game/i18n";

/**
 * Beginner tutorial that walks a fresh bakery through the core loop:
 * open shop → move around → talk to a customer → make their order →
 * serve them. Eight short cards; the player taps Next or Skip. The
 * current step lives on the game store (`tutorialStep`) so it survives
 * refreshes; `-1` means finished/skipped.
 *
 * A couple of steps auto-advance when the player does the thing (opens
 * the shop, opens a prep station, plates an item, serves a customer)
 * so the tutorial stays out of the way as soon as they get it.
 */

const STEPS: { titleKey: TKey; bodyKey: TKey }[] = [
  { titleKey: "tutorialTitle_1", bodyKey: "tutorialBody_1" },
  { titleKey: "tutorialTitle_2", bodyKey: "tutorialBody_2" },
  { titleKey: "tutorialTitle_3", bodyKey: "tutorialBody_3" },
  { titleKey: "tutorialTitle_4", bodyKey: "tutorialBody_4" },
  { titleKey: "tutorialTitle_5", bodyKey: "tutorialBody_5" },
  { titleKey: "tutorialTitle_6", bodyKey: "tutorialBody_6" },
  { titleKey: "tutorialTitle_7", bodyKey: "tutorialBody_7" },
  { titleKey: "tutorialTitle_8", bodyKey: "tutorialBody_8" },
];

export function Tutorial() {
  const step = useGame((s) => s.tutorialStep);
  const advance = useGame((s) => s.advanceTutorial);
  const skip = useGame((s) => s.skipTutorial);
  const isOpen = useGame((s) => s.isOpen);
  const customers = useGame((s) => s.customers);
  const prep = useGame((s) => s.prep);
  const ready = useGame((s) => s.ready);
  const stats = useGame((s) => s.stats);
  const t = useT();

  // Auto-advance triggers so the tutorial follows what the player is
  // actually doing. Each step advances when its condition first fires,
  // then stops watching (the step index changes and the effect re-runs).
  useEffect(() => {
    if (step === 1 && isOpen) advance();
  }, [step, isOpen, advance]);
  useEffect(() => {
    if (step === 3 && customers.length > 0) advance();
  }, [step, customers.length, advance]);
  useEffect(() => {
    if (step === 5) {
      const anyPrep = Object.values(prep).some(Boolean);
      const anyReady = ready.length > 0;
      if (anyPrep || anyReady) advance();
    }
  }, [step, prep, ready.length, advance]);
  useEffect(() => {
    if (step === 6 && ready.length > 0) advance();
  }, [step, ready.length, advance]);
  useEffect(() => {
    if (step === 7 && stats.ordersCompleted > 0) advance();
  }, [step, stats.ordersCompleted, advance]);

  // Done or skipped — render nothing.
  if (step < 0 || step >= STEPS.length) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        className="fixed inset-x-0 top-20 z-40 pointer-events-none flex justify-center px-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <div
          className="pointer-events-auto rounded-3xl border-2 border-cocoa-500 bg-cream-50 shadow-bakery max-w-[520px] w-full p-4"
          style={{
            boxShadow:
              "0 12px 30px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] uppercase tracking-wider font-bold text-cocoa-400">
              {t("tutorialStepLabel", { n: step + 1, total: STEPS.length })}
            </div>
            <button
              onClick={skip}
              className="text-[11px] px-2 py-1 rounded-full bg-cream-100 text-cocoa-500 font-bold hover:bg-cream-200"
            >
              {t("tutorialSkip")}
            </button>
          </div>
          <div className="font-display text-xl text-cocoa-700 leading-tight">
            {t(s.titleKey)}
          </div>
          <div className="mt-1 text-sm text-cocoa-500 leading-snug">
            {t(s.bodyKey)}
          </div>
          {/* Progress dots */}
          <div className="mt-3 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-berry-500"
                    : i < step
                      ? "w-2 bg-mint-500"
                      : "w-2 bg-cream-300"
                }`}
              />
            ))}
            <div className="flex-1" />
            <button
              onClick={advance}
              className={`rounded-full px-4 py-2 font-bold shadow-soft transition ${
                isLast
                  ? "bg-mint-500 text-white hover:bg-mint-400 animate-wiggle"
                  : "bg-cocoa-500 text-white hover:bg-cocoa-600"
              }`}
            >
              {isLast ? t("tutorialFinish") : t("tutorialNext")}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
