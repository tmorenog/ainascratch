"use client";

import { motion } from "framer-motion";
import type { Customer, CustomerLookData } from "@/game/types";

const DEFAULT_LOOK: CustomerLookData = {
  hair: "short",
  hairColor: "#3a2418",
  skin: "#f3c8a4",
  shirt: "#7c5236",
};

/**
 * Cute, smooth SVG customer. Different hair styles + skin tones + shirts
 * give every archetype its own personality.
 */
export function CustomerCharacter({
  customer,
  size = 130,
  speaking = false,
  pet,
}: {
  customer: Customer;
  size?: number;
  speaking?: boolean;
  pet?: "dog" | "cat";
}) {
  const look = customer.look ?? DEFAULT_LOOK;
  const id = customer.id.replace(/[^a-z0-9]/gi, "");

  return (
    <div className="relative" style={{ width: size, height: size * 1.3 }}>
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <defs>
          <linearGradient id={`shirt-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(look.shirt, 0.18)} />
            <stop offset="100%" stopColor={look.shirt} />
          </linearGradient>
          <radialGradient id={`cheek-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={look.cheek ?? "#ffb3c2"} stopOpacity="0.7" />
            <stop offset="100%" stopColor={look.cheek ?? "#ffb3c2"} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="50" cy="125" rx="22" ry="3.4" fill="#000" opacity="0.16" />

        {/* shirt / torso */}
        <path
          d="M28 70 Q34 60 50 60 Q66 60 72 70 L74 110 Q60 116 50 116 Q40 116 26 110 Z"
          fill={`url(#shirt-${id})`}
        />
        {/* shirt collar shadow */}
        <path d="M40 60 Q50 66 60 60 L58 64 Q50 70 42 64 Z" fill="#000" opacity="0.08" />

        {/* arms */}
        <ellipse cx="28" cy="80" rx="4.5" ry="11" fill={`url(#shirt-${id})`} />
        <ellipse cx="72" cy="80" rx="4.5" ry="11" fill={`url(#shirt-${id})`} />
        <circle cx="28" cy="92" r="4" fill={look.skin} />
        <circle cx="72" cy="92" r="4" fill={look.skin} />

        {/* head */}
        <circle cx="50" cy="38" r="16" fill={look.skin} />
        <circle cx="40" cy="42" r="4" fill={`url(#cheek-${id})`} />
        <circle cx="60" cy="42" r="4" fill={`url(#cheek-${id})`} />
        {/* eyes */}
        <ellipse cx="44" cy="38" rx="1.3" ry="2" fill="#2b1a10" />
        <ellipse cx="56" cy="38" rx="1.3" ry="2" fill="#2b1a10" />
        <circle cx="44.4" cy="37.5" r="0.5" fill="#fff" />
        <circle cx="56.4" cy="37.5" r="0.5" fill="#fff" />
        {/* smile */}
        <path
          d="M44 44 Q50 48 56 44"
          fill="none"
          stroke="#3a1c10"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* hair */}
        <Hair look={look} />

        {/* pet — peeking next to them */}
        {pet === "dog" && <PuppyPeek />}
        {pet === "cat" && <KittyPeek />}
      </svg>

      {/* Speech bubble */}
      {speaking && customer.greeting && (
        <motion.div
          className="absolute left-full -translate-x-2 top-1 bg-white rounded-2xl rounded-bl-md shadow-soft border border-cream-200 px-3 py-1.5 text-xs text-cocoa-500 max-w-[180px]"
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          “{customer.greeting}”
        </motion.div>
      )}
    </div>
  );
}

function Hair({ look }: { look: CustomerLookData }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "short":
      return (
        <path
          d="M34 32 Q34 18 50 18 Q66 18 66 32 Q60 28 50 28 Q40 28 34 32 Z"
          fill={c}
        />
      );
    case "long":
      return (
        <g>
          <path d="M34 32 Q34 16 50 16 Q66 16 66 32 Q60 26 50 26 Q40 26 34 32 Z" fill={c} />
          <path d="M30 36 Q26 70 38 76 Q34 50 38 38 Z" fill={c} />
          <path d="M70 36 Q74 70 62 76 Q66 50 62 38 Z" fill={c} />
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx="50" cy="14" r="7" fill={c} />
          <path d="M34 32 Q34 18 50 18 Q66 18 66 32 Q60 28 50 28 Q40 28 34 32 Z" fill={c} />
        </g>
      );
    case "curly":
      return (
        <g>
          <circle cx="40" cy="22" r="7" fill={c} />
          <circle cx="50" cy="18" r="7" fill={c} />
          <circle cx="60" cy="22" r="7" fill={c} />
          <circle cx="34" cy="28" r="6" fill={c} />
          <circle cx="66" cy="28" r="6" fill={c} />
        </g>
      );
    case "buzz":
      return (
        <path
          d="M36 30 Q36 22 50 22 Q64 22 64 30 Q58 28 50 28 Q42 28 36 30 Z"
          fill={c}
          opacity="0.85"
        />
      );
    case "ponytail":
      return (
        <g>
          <path d="M34 32 Q34 16 50 16 Q66 16 66 32 Q60 26 50 26 Q40 26 34 32 Z" fill={c} />
          <path d="M68 30 Q82 36 80 56 Q72 50 68 38 Z" fill={c} />
        </g>
      );
    case "puff":
      return (
        <g>
          <ellipse cx="50" cy="18" rx="22" ry="14" fill={c} />
        </g>
      );
  }
}

function PuppyPeek() {
  return (
    <g transform="translate(74 96)">
      <ellipse cx="0" cy="14" rx="14" ry="3" fill="#000" opacity="0.15" />
      <path
        d="M-12 4 Q-14 -10 -2 -10 Q12 -10 12 4 Q12 14 -2 14 Q-12 14 -12 4 Z"
        fill="#a4693b"
      />
      <ellipse cx="-8" cy="-6" rx="4" ry="6" fill="#7c5236" transform="rotate(-20 -8 -6)" />
      <ellipse cx="8" cy="-6" rx="4" ry="6" fill="#7c5236" transform="rotate(20 8 -6)" />
      <circle cx="-3" cy="2" r="1" fill="#1a0a04" />
      <circle cx="5" cy="2" r="1" fill="#1a0a04" />
      <ellipse cx="1" cy="6" rx="2" ry="1.4" fill="#1a0a04" />
      <path d="M-2 8 Q1 10 4 8" stroke="#1a0a04" strokeWidth="0.8" fill="none" />
    </g>
  );
}

function KittyPeek() {
  return (
    <g transform="translate(74 96)">
      <ellipse cx="0" cy="14" rx="14" ry="3" fill="#000" opacity="0.15" />
      <path
        d="M-12 4 Q-14 -10 -2 -10 Q12 -10 12 4 Q12 14 -2 14 Q-12 14 -12 4 Z"
        fill="#cbcbcb"
      />
      <path d="M-10 -10 L-6 -2 L-2 -10 Z" fill="#cbcbcb" />
      <path d="M2 -10 L6 -2 L10 -10 Z" fill="#cbcbcb" />
      <circle cx="-3" cy="2" r="1.2" fill="#0d4a3a" />
      <circle cx="5" cy="2" r="1.2" fill="#0d4a3a" />
      <path d="M0 6 L2 6 L1 8 Z" fill="#1a0a04" />
      <path d="M-3 8 Q1 10 5 8" stroke="#1a0a04" strokeWidth="0.8" fill="none" />
      {/* whiskers */}
      <path d="M-4 8 L-12 7 M-4 9 L-12 10 M5 8 L13 7 M5 9 L13 10" stroke="#444" strokeWidth="0.4" />
    </g>
  );
}

function lighten(hex: string, amt: number): string {
  const v = hex.replace("#", "");
  const f = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(f.slice(0, 2), 16);
  const g = parseInt(f.slice(2, 4), 16);
  const b = parseInt(f.slice(4, 6), 16);
  const k = (n: number) => Math.max(0, Math.min(255, Math.round(n + (255 - n) * amt)));
  return `rgb(${k(r)}, ${k(g)}, ${k(b)})`;
}
