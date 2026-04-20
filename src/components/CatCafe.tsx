"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./ui/Modal";
import { useGame } from "@/game/store";
import { useT } from "@/game/i18n";
import { CAT_CAFE_UNLOCK_LEVEL } from "@/game/world3d";

/**
 * The cats themselves live in the 3D basement scene now — this modal is
 * the coffee brew panel you see when the baker interacts with the cafe's
 * counter. Each brew takes a few seconds and pays out coins + XP.
 */

interface Cat {
  id: string;
  name: string;
  personality: string;
}

const CATS: Cat[] = [
  { id: "mochi", name: "Mochi", personality: "Sleepy barista" },
  { id: "espresso", name: "Espresso", personality: "Scruffy bean fiend" },
  { id: "latte", name: "Latte", personality: "Queen of the cushion" },
  { id: "muffin", name: "Muffin", personality: "Keeps stealing biscotti" },
  { id: "biscuit", name: "Biscuit", personality: "Sun-patch napper" },
];

const DRINK_MENU = [
  { id: "cat_latte", name: "Whiskered Latte", emoji: "☕", price: 5, ms: 4000 },
  { id: "cat_mocha", name: "Purr-spresso", emoji: "🫘", price: 7, ms: 5000 },
  { id: "cat_matcha", name: "Meow-tcha", emoji: "🍵", price: 6, ms: 4500 },
  { id: "cat_cocoa", name: "Kitten Cocoa", emoji: "🍫", price: 5, ms: 4200 },
];

function LockedCafe({ level }: { level: number }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-6xl mb-3">🔒</div>
      <div className="font-display text-2xl text-cocoa-600">
        Cat Cafe locked
      </div>
      <div className="text-cocoa-400 mt-2">
        This cozy downstairs cafe opens at level {CAT_CAFE_UNLOCK_LEVEL}.
        You&apos;re on level {level} — keep baking, you&apos;re almost there!
      </div>
    </div>
  );
}

export function CatCafe({ open, onClose }: { open: boolean; onClose: () => void }) {
  const level = useGame((s) => s.level);
  const coins = useGame((s) => s.coins);
  const addCoins = useGame((s) => s.addCoins);
  const grantXp = useGame((s) => s.grantXp);
  useT();

  const unlocked = level >= CAT_CAFE_UNLOCK_LEVEL;

  const [brewingId, setBrewingId] = useState<string | null>(null);
  const [brewStart, setBrewStart] = useState(0);
  const [flyEarnings, setFlyEarnings] = useState<
    { id: number; text: string; x: number; y: number }[]
  >([]);
  const nowTick = useNowTick(brewingId !== null);

  const brewingDrink = useMemo(
    () => DRINK_MENU.find((d) => d.id === brewingId) ?? null,
    [brewingId],
  );
  const brewProgress = brewingDrink
    ? Math.min(1, (nowTick - brewStart) / brewingDrink.ms)
    : 0;
  const brewDone = brewProgress >= 1;

  function startBrew(id: string) {
    if (brewingId) return;
    setBrewingId(id);
    setBrewStart(Date.now());
  }

  function collect() {
    if (!brewingDrink || !brewDone) return;
    const earned = brewingDrink.price;
    addCoins(earned);
    grantXp(4);
    const fId = Date.now();
    setFlyEarnings((prev) => [
      ...prev,
      { id: fId, text: `+🪙 $${earned}`, x: 50 + Math.random() * 14 - 7, y: 50 },
    ]);
    setTimeout(() => {
      setFlyEarnings((prev) => prev.filter((e) => e.id !== fId));
    }, 1400);
    setBrewingId(null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`☕ Cat Cafe · Coffee Bar`}
      maxWidth="max-w-3xl"
    >
      {!unlocked ? (
        <LockedCafe level={level} />
      ) : (
        <div className="space-y-3 relative">
          <AnimatePresence>
            {flyEarnings.map((fe) => (
              <motion.div
                key={fe.id}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                exit={{ opacity: 0, y: -60 }}
                transition={{ duration: 1.2 }}
                className="absolute font-bold text-amber-600 z-10"
                style={{ left: `${fe.x}%`, top: `${fe.y}%` }}
              >
                {fe.text}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="rounded-2xl bg-cream-50 border border-cream-200 p-3 shadow-soft">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-display text-lg text-cocoa-600">
                  ☕ The Cat Cafe Bar
                </div>
                <div className="text-xs text-cocoa-400">
                  Brew a specialty drink. Each one pays tips plus a little XP.
                  The cats are right outside — feel free to wander!
                </div>
              </div>
              <div className="chip">
                🪙 <span className="ml-1 font-black tabular-nums">{coins}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DRINK_MENU.map((d) => {
                const isBrewing = brewingId === d.id;
                const isOther = brewingId !== null && !isBrewing;
                return (
                  <button
                    key={d.id}
                    onClick={() =>
                      isBrewing ? (brewDone ? collect() : undefined) : startBrew(d.id)
                    }
                    disabled={isOther}
                    className={`relative rounded-xl p-3 border-2 text-left transition ${
                      isBrewing
                        ? brewDone
                          ? "border-mint-400 bg-mint-50"
                          : "border-cocoa-400 bg-cream-100"
                        : "border-cream-200 bg-white/80 hover:bg-cream-100 disabled:opacity-50"
                    }`}
                  >
                    <div className="text-3xl">{d.emoji}</div>
                    <div className="font-bold text-cocoa-700 leading-tight">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-cocoa-500">
                      🪙 ${d.price} · ⏱ {(d.ms / 1000).toFixed(0)}s
                    </div>
                    {isBrewing && (
                      <div className="absolute left-2 right-2 bottom-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-berry-500 transition-[width] duration-100"
                          style={{ width: `${brewProgress * 100}%` }}
                        />
                      </div>
                    )}
                    {isBrewing && brewDone && (
                      <div className="absolute -top-2 -right-2 rounded-full bg-mint-400 text-white text-[11px] font-bold px-2 py-0.5 shadow-soft">
                        Tap to serve!
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 border border-cream-200 p-3">
            <div className="font-bold text-cocoa-600 mb-1">🐾 Our resident cats</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {CATS.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-1 rounded-full bg-cream-100 border border-cream-200 text-cocoa-600"
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-cocoa-400"> · {c.personality}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Re-renders at 10fps while brewing so the progress bar animates. */
function useNowTick(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}
