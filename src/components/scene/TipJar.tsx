"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "@/game/store";

/**
 * Cute glass jar that fills with coins. Whenever a TipEvent is queued in
 * the store, a coin tosses across the screen, lands in the jar, and a
 * floating "+$5" sparkle pops above it.
 */
export function TipJar({ size = 92 }: { size?: number }) {
  const tipJar = useGame((s) => s.tipJar);
  const tipEvents = useGame((s) => s.tipEvents);
  const acknowledgeTip = useGame((s) => s.acknowledgeTip);

  // Auto-clear events after their animation
  useEffect(() => {
    if (tipEvents.length === 0) return;
    const timers = tipEvents.map((t) =>
      window.setTimeout(() => acknowledgeTip(t.id), 1800),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [tipEvents, acknowledgeTip]);

  // Visualize fill as a function of tipJar — caps visually but keeps growing in number
  const fillPct = Math.min(0.85, 0.1 + tipJar / 200);

  return (
    <div className="relative" style={{ width: size, height: size * 1.35 }}>
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <defs>
          <linearGradient id="jar-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(220,232,240,0.6)" />
          </linearGradient>
          <linearGradient id="jar-coins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe09a" />
            <stop offset="100%" stopColor="#c98933" />
          </linearGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="50" cy="124" rx="28" ry="3.4" fill="#000" opacity="0.18" />

        {/* lid */}
        <rect x="22" y="14" width="56" height="10" rx="3" fill="#7c5236" />
        <rect x="20" y="20" width="60" height="6" rx="2" fill="#5a3922" />
        {/* slot */}
        <rect x="42" y="14" width="16" height="3" rx="1.5" fill="#1a0a04" />
        {/* label */}
        <rect x="28" y="74" width="44" height="20" rx="3" fill="#fff" stroke="#d4b88a" />
        <text x="50" y="88" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7c5236">
          TIPS
        </text>

        {/* glass body */}
        <path
          d="M22 26 Q22 22 28 22 L72 22 Q78 22 78 26 L78 116 Q78 122 72 122 L28 122 Q22 122 22 116 Z"
          fill="url(#jar-glass)"
          stroke="rgba(124, 82, 54, 0.35)"
          strokeWidth="1.5"
        />
        {/* glass highlight */}
        <rect x="28" y="30" width="6" height="80" rx="3" fill="#fff" opacity="0.7" />

        {/* coins fill */}
        <clipPath id="jar-clip">
          <path d="M24 28 L76 28 L76 120 L24 120 Z" />
        </clipPath>
        <g clipPath="url(#jar-clip)">
          <rect
            x="24"
            y={120 - fillPct * 92}
            width="52"
            height={fillPct * 92}
            fill="url(#jar-coins)"
          />
          {/* a few coin discs on top */}
          {fillPct > 0.15 && (
            <>
              <ellipse cx="38" cy={120 - fillPct * 92 + 4} rx="6" ry="2" fill="#ffd14a" />
              <ellipse cx="56" cy={120 - fillPct * 92 + 6} rx="7" ry="2" fill="#ffe09a" />
              <ellipse cx="64" cy={120 - fillPct * 92 + 3} rx="4" ry="1.5" fill="#ffd14a" />
            </>
          )}
        </g>
      </svg>

      {/* total */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cocoa-600 text-cream-50 text-xs font-bold shadow-soft tabular-nums">
        ${tipJar}
      </div>

      {/* coin animations */}
      <AnimatePresence>
        {tipEvents.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: -90, y: -60, scale: 0.6, opacity: 0 }}
            animate={{
              x: [-90, 10, 0],
              y: [-60, -30, 30],
              scale: [0.6, 1.2, 0.7],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl pointer-events-none"
          >
            🪙
          </motion.div>
        ))}
        {tipEvents.map((t) => (
          <motion.div
            key={`txt-${t.id}`}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -30, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-mint-500 text-white text-xs font-black shadow-soft pointer-events-none whitespace-nowrap"
          >
            +${t.amount}!
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
