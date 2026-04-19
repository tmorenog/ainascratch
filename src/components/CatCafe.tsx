"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./ui/Modal";
import { useGame } from "@/game/store";
import { useT } from "@/game/i18n";
import { CAT_CAFE_UNLOCK_LEVEL } from "@/game/world3d";

/**
 * A cozy basement cat cafe. Unlocks at level 20. Inside is a warm lamplit
 * room with five resident cats napping and stretching. The chef can brew
 * quick coffees for the cats' humans — each brew costs no ingredients,
 * takes a handful of seconds, and pays out a few coins + XP. Think of it
 * as a mini side-game that rewards returning visits.
 */

interface Cat {
  id: string;
  name: string;
  personality: string;
  color: string;
  accent: string;
  pose: "sit" | "loaf" | "sleep" | "stretch";
  x: number; // %
  y: number; // %
  flip?: boolean;
}

const CATS: Cat[] = [
  {
    id: "mochi",
    name: "Mochi",
    personality: "Sleepy barista",
    color: "#f0e1c0",
    accent: "#c8a674",
    pose: "loaf",
    x: 18,
    y: 62,
  },
  {
    id: "espresso",
    name: "Espresso",
    personality: "Scruffy bean fiend",
    color: "#6b4a33",
    accent: "#3d2a1e",
    pose: "sit",
    x: 44,
    y: 45,
  },
  {
    id: "latte",
    name: "Latte",
    personality: "Queen of the cushion",
    color: "#fff4ec",
    accent: "#f7dfc4",
    pose: "sleep",
    x: 72,
    y: 58,
    flip: true,
  },
  {
    id: "muffin",
    name: "Muffin",
    personality: "Keeps stealing biscotti",
    color: "#caa980",
    accent: "#a07a4a",
    pose: "sit",
    x: 30,
    y: 78,
  },
  {
    id: "biscuit",
    name: "Biscuit",
    personality: "Sun-patch napper",
    color: "#e3b36a",
    accent: "#a07a1a",
    pose: "stretch",
    x: 58,
    y: 80,
    flip: true,
  },
];

const DRINK_MENU = [
  { id: "cat_latte", name: "Whiskered Latte", emoji: "☕", price: 5, ms: 4000 },
  { id: "cat_mocha", name: "Purr-spresso", emoji: "🫘", price: 7, ms: 5000 },
  { id: "cat_matcha", name: "Meow-tcha", emoji: "🍵", price: 6, ms: 4500 },
  { id: "cat_cocoa", name: "Kitten Cocoa", emoji: "🍫", price: 5, ms: 4200 },
];

function CatSvg({ cat, petted }: { cat: Cat; petted: boolean }) {
  const { color, accent, pose } = cat;
  const scale = petted ? 1.1 : 1;
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={110}
      height={110}
      style={{
        transform: `scaleX(${cat.flip ? -1 : 1})`,
      }}
      animate={{ scale }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      {/* shadow */}
      <ellipse cx="50" cy="88" rx="22" ry="3" fill="#000" opacity="0.18" />
      {pose === "sit" && (
        <g>
          {/* body */}
          <ellipse cx="50" cy="66" rx="22" ry="18" fill={color} />
          {/* front legs */}
          <rect x="40" y="72" width="6" height="14" rx="3" fill={color} />
          <rect x="54" y="72" width="6" height="14" rx="3" fill={color} />
          {/* tail */}
          <path
            d="M72 70 q14 -4 8 -18"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* head */}
          <circle cx="50" cy="42" r="16" fill={color} />
          {/* ears */}
          <path d="M38 30 L34 18 L46 26 Z" fill={color} />
          <path d="M62 30 L66 18 L54 26 Z" fill={color} />
          <path d="M40 28 L39 22 L44 26 Z" fill={accent} />
          <path d="M60 28 L61 22 L56 26 Z" fill={accent} />
          {/* face */}
          <ellipse cx="50" cy="45" rx="2.6" ry="1.8" fill="#f7b8c8" />
          <path
            d="M46 48 q4 2 8 0"
            fill="none"
            stroke="#3d1d0c"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* eyes (closed gently) */}
          <path d="M42 40 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M54 40 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
          {/* whiskers */}
          <line x1="38" y1="46" x2="28" y2="45" stroke="#7a3f20" strokeWidth="0.6" />
          <line x1="62" y1="46" x2="72" y2="45" stroke="#7a3f20" strokeWidth="0.6" />
        </g>
      )}
      {pose === "loaf" && (
        <g>
          {/* loaf body */}
          <ellipse cx="50" cy="70" rx="26" ry="12" fill={color} />
          {/* tail curled */}
          <path
            d="M74 72 q10 -4 6 -12"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="50" cy="52" r="14" fill={color} />
          <path d="M39 42 L36 32 L46 40 Z" fill={color} />
          <path d="M61 42 L64 32 L54 40 Z" fill={color} />
          <path d="M41 40 L40 35 L44 39 Z" fill={accent} />
          <path d="M59 40 L60 35 L56 39 Z" fill={accent} />
          <ellipse cx="50" cy="55" rx="2.4" ry="1.6" fill="#f7b8c8" />
          <path d="M47 58 q3 1.5 6 0" fill="none" stroke="#3d1d0c" strokeWidth="1" strokeLinecap="round" />
          <path d="M42 50 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M54 50 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}
      {pose === "sleep" && (
        <g>
          {/* curled body */}
          <ellipse cx="50" cy="70" rx="28" ry="14" fill={color} />
          <ellipse cx="50" cy="68" rx="22" ry="10" fill={accent} opacity="0.4" />
          {/* tail wrapped around */}
          <path
            d="M22 68 q-4 -10 10 -14 q14 -4 22 4"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* head tucked */}
          <circle cx="68" cy="62" r="12" fill={color} />
          <path d="M58 54 L56 45 L64 52 Z" fill={color} />
          <path d="M76 54 L80 45 L72 52 Z" fill={color} />
          {/* eyes (Zs) */}
          <path d="M62 60 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M70 60 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
          {/* Z Z */}
          <text x="76" y="42" fontSize="8" fill="#7a3f20" fontWeight="bold">
            z
          </text>
          <text x="82" y="36" fontSize="6" fill="#7a3f20" fontWeight="bold">
            z
          </text>
        </g>
      )}
      {pose === "stretch" && (
        <g>
          {/* stretched body */}
          <ellipse cx="50" cy="70" rx="30" ry="10" fill={color} />
          {/* legs */}
          <rect x="24" y="72" width="6" height="12" rx="3" fill={color} />
          <rect x="38" y="72" width="6" height="12" rx="3" fill={color} />
          <rect x="58" y="72" width="6" height="12" rx="3" fill={color} />
          <rect x="72" y="72" width="6" height="12" rx="3" fill={color} />
          {/* arched back */}
          <path d="M24 70 q26 -20 52 0" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          {/* head low */}
          <circle cx="22" cy="66" r="11" fill={color} />
          <path d="M14 56 L12 48 L20 54 Z" fill={color} />
          <path d="M28 56 L30 48 L22 54 Z" fill={color} />
          <path d="M18 66 q2 1 4 0" fill="none" stroke="#3d1d0c" strokeWidth="1" strokeLinecap="round" />
          <path d="M15 62 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M23 62 q2 -2 4 0" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
          {/* tail up and curled */}
          <path
            d="M76 68 q12 -10 4 -22"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      )}
    </motion.svg>
  );
}

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
  const t = useT();

  const unlocked = level >= CAT_CAFE_UNLOCK_LEVEL;

  const [brewingId, setBrewingId] = useState<string | null>(null);
  const [brewStart, setBrewStart] = useState(0);
  const [pettedCat, setPettedCat] = useState<string | null>(null);
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

  function petCat(id: string) {
    setPettedCat(id);
    grantXp(1);
    setTimeout(() => setPettedCat((curr) => (curr === id ? null : curr)), 900);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`🐱 Cat Cafe · Downstairs ☕`}
      maxWidth="max-w-5xl"
    >
      {!unlocked ? (
        <LockedCafe level={level} />
      ) : (
        <div className="space-y-3">
          {/* Cozy room — a panel with gradient, bookshelf, lamp, cats */}
          <div className="relative rounded-2xl overflow-hidden border border-cream-300 shadow-soft h-[380px]">
            {/* Warm wallpaper */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #f5dec5 0%, #e9c8a7 50%, #8c5a36 100%)",
              }}
            />
            {/* Floor band */}
            <div
              className="absolute left-0 right-0 bottom-0 h-[120px]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #7a4f20 0 28px, #6b4217 28px 30px)",
              }}
            />
            {/* Bookshelf */}
            <div className="absolute left-6 top-6 w-32 h-44 bg-[#5c3a22] rounded-md shadow-inner">
              <div className="absolute inset-0 flex flex-col justify-between p-1">
                {["#ef6464", "#f5b93b", "#7fd6ff", "#a6f0a1"].map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-1 h-9 items-end"
                    style={{ background: "transparent" }}
                  >
                    {[0, 1, 2, 3, 4].map((_, j) => (
                      <div
                        key={j}
                        className="rounded-sm shadow-sm"
                        style={{
                          width: 9 + (j % 3) * 3,
                          height: 28 + ((i + j) % 3) * 4,
                          background:
                            [c, "#fff", "#d4a56a", "#ec4899", "#a855f7"][
                              (i + j) % 5
                            ],
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Hanging lamp */}
            <div className="absolute right-14 top-0 w-0.5 h-16 bg-[#5c3a22]" />
            <div
              className="absolute right-12 top-16 w-14 h-10 rounded-b-full"
              style={{ background: "radial-gradient(circle at 50% 30%, #ffeab6, #f5b93b)" }}
            />
            {/* Cushion rug */}
            <div className="absolute left-[48%] bottom-20 -translate-x-1/2 w-64 h-14 rounded-[50%] bg-[#f7b8c8] opacity-80 shadow-inner" />
            <div className="absolute left-[48%] bottom-24 -translate-x-1/2 w-44 h-8 rounded-[50%] bg-[#eb74a5] opacity-70" />
            {/* Cats */}
            {CATS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => petCat(cat.id)}
                className="absolute"
                style={{ left: `${cat.x}%`, top: `${cat.y}%`, transform: "translate(-50%, -50%)" }}
                title={`${cat.name} — ${cat.personality}`}
              >
                <CatSvg cat={cat} petted={pettedCat === cat.id} />
                <div className="text-center -mt-2">
                  <div className="inline-block rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-cocoa-600 shadow-soft">
                    {cat.name}
                  </div>
                </div>
              </button>
            ))}
            {/* Floating earnings (hearts when petting, coins when brewing) */}
            <AnimatePresence>
              {flyEarnings.map((fe) => (
                <motion.div
                  key={fe.id}
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 1.2 }}
                  className="absolute font-bold text-amber-600"
                  style={{ left: `${fe.x}%`, top: `${fe.y}%` }}
                >
                  {fe.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {pettedCat && (
              <motion.div
                key={pettedCat}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.1 }}
                exit={{ opacity: 0 }}
                className="absolute text-2xl"
                style={{
                  left: `${CATS.find((c) => c.id === pettedCat)?.x ?? 50}%`,
                  top: `${(CATS.find((c) => c.id === pettedCat)?.y ?? 50) - 6}%`,
                }}
              >
                💖
              </motion.div>
            )}
          </div>

          {/* Coffee bar */}
          <div className="rounded-2xl bg-cream-50 border border-cream-200 p-3 shadow-soft">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-display text-lg text-cocoa-600">
                  ☕ The Cat Cafe Bar
                </div>
                <div className="text-xs text-cocoa-400">
                  Brew a specialty drink. Each one pays tips plus a little XP.
                  Tap a cat to give it a scritch!
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

          {/* Friends list */}
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
