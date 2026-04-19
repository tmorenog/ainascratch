"use client";

import { motion } from "framer-motion";

/**
 * The baker character — a small, friendly chef in an apron with a tall hat.
 * Faces left or right based on `facing`, and gently bobs while walking.
 *
 * All vector — no pixels — so it scales smoothly on every device.
 */
export function Baker({
  facing = "right",
  walking = false,
  size = 130,
  bakeryColor = "#e0a3b5",
}: {
  facing?: "left" | "right";
  walking?: boolean;
  size?: number;
  bakeryColor?: string;
}) {
  return (
    <motion.div
      style={{ width: size, height: size * 1.25 }}
      animate={walking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={{ duration: 0.45, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 100 130"
        width="100%"
        height="100%"
        style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
      >
        <defs>
          <linearGradient id="bk-apron" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff8ec" />
            <stop offset="100%" stopColor="#f3e0c2" />
          </linearGradient>
          <linearGradient id="bk-hat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e6e6e6" />
          </linearGradient>
          <linearGradient id="bk-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(bakeryColor, 0.18)} />
            <stop offset="100%" stopColor={bakeryColor} />
          </linearGradient>
          <radialGradient id="bk-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb3c2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffb3c2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="50" cy="125" rx="22" ry="3.4" fill="#000" opacity="0.16" />

        {/* legs */}
        <rect x="40" y="100" width="8" height="20" rx="3" fill="#3f2614" />
        <rect x="52" y="100" width="8" height="20" rx="3" fill="#3f2614" />
        <ellipse cx="44" cy="123" rx="6" ry="2.4" fill="#1f120a" />
        <ellipse cx="56" cy="123" rx="6" ry="2.4" fill="#1f120a" />

        {/* shirt under apron */}
        <path
          d="M30 70 Q34 60 50 60 Q66 60 70 70 L72 100 Q60 105 50 105 Q40 105 28 100 Z"
          fill="url(#bk-shirt)"
        />

        {/* apron */}
        <path
          d="M34 66 Q42 56 50 56 Q58 56 66 66 L70 110 Q60 116 50 116 Q40 116 30 110 Z"
          fill="url(#bk-apron)"
          stroke="#d4b88a"
          strokeWidth="0.6"
        />
        {/* apron pocket */}
        <rect x="42" y="92" width="16" height="8" rx="2" fill="#d4b88a" opacity="0.4" />
        <rect x="42" y="92" width="16" height="8" rx="2" fill="none" stroke="#a87a3c" strokeWidth="0.5" />
        {/* apron strap */}
        <path d="M40 56 L34 50 M60 56 L66 50" stroke="#d4b88a" strokeWidth="2" strokeLinecap="round" />

        {/* arms */}
        <motion.g
          animate={walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
          style={{ originX: "30%", originY: "60%" }}
          transition={{ duration: 0.45, repeat: walking ? Infinity : 0 }}
        >
          <ellipse cx="30" cy="80" rx="4.5" ry="12" fill="url(#bk-shirt)" />
          <circle cx="30" cy="92" r="4" fill="#f3c8a4" />
        </motion.g>
        <motion.g
          animate={walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
          style={{ originX: "70%", originY: "60%" }}
          transition={{ duration: 0.45, repeat: walking ? Infinity : 0 }}
        >
          <ellipse cx="70" cy="80" rx="4.5" ry="12" fill="url(#bk-shirt)" />
          <circle cx="70" cy="92" r="4" fill="#f3c8a4" />
        </motion.g>

        {/* head */}
        <circle cx="50" cy="38" r="16" fill="#f3c8a4" />
        {/* cheeks */}
        <circle cx="40" cy="42" r="4" fill="url(#bk-cheek)" />
        <circle cx="60" cy="42" r="4" fill="url(#bk-cheek)" />
        {/* eyes */}
        <ellipse cx="44" cy="38" rx="1.3" ry="2" fill="#2b1a10" />
        <ellipse cx="56" cy="38" rx="1.3" ry="2" fill="#2b1a10" />
        <circle cx="44.4" cy="37.5" r="0.5" fill="#fff" />
        <circle cx="56.4" cy="37.5" r="0.5" fill="#fff" />
        {/* smile */}
        <path d="M44 44 Q50 48 56 44" fill="none" stroke="#3a1c10" strokeWidth="1.6" strokeLinecap="round" />

        {/* chef hat */}
        <ellipse cx="50" cy="20" rx="14" ry="6" fill="url(#bk-hat)" />
        <path
          d="M36 22 Q34 12 44 10 Q46 4 50 6 Q54 4 56 10 Q66 12 64 22 Z"
          fill="url(#bk-hat)"
          stroke="#d6d6d6"
          strokeWidth="0.4"
        />
        <ellipse cx="50" cy="22" rx="14" ry="2.2" fill="#000" opacity="0.05" />

        {/* apron string ribbon at side */}
        <path d="M70 100 Q76 102 78 108" stroke="#d4b88a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
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
