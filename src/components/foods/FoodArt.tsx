"use client";

import React from "react";

/**
 * Hand-built SVG food art for every recipe.
 * Each piece uses layered gradients, highlights and shadows to feel
 * tactile and appetizing even at small sizes. Keep the viewBox 0 0 100 100.
 *
 * To add a new food:
 *   1. Add a component below returning <g>...</g>
 *   2. Register it in FOOD_ART_BY_ID
 *   3. Make sure the recipe id matches the map key.
 */

const defs = (
  <defs>
    <radialGradient id="shine" cx="30%" cy="20%" r="60%">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="dough" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#f6d7a3" />
      <stop offset="100%" stopColor="#c08a4a" />
    </linearGradient>
    <linearGradient id="glaze" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffe6f2" />
      <stop offset="100%" stopColor="#f5a3c7" />
    </linearGradient>
    <linearGradient id="chocolate" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#7a3f20" />
      <stop offset="100%" stopColor="#3d1d0c" />
    </linearGradient>
    <linearGradient id="cream" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#f3e4c0" />
    </linearGradient>
    <linearGradient id="milk" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#e8d7b0" />
    </linearGradient>
    <linearGradient id="pink" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffd6e4" />
      <stop offset="100%" stopColor="#e87aa0" />
    </linearGradient>
    <linearGradient id="berry" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#c6407b" />
      <stop offset="100%" stopColor="#6f1c44" />
    </linearGradient>
    <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffe9a8" />
      <stop offset="100%" stopColor="#c98933" />
    </linearGradient>
    <linearGradient id="lemon" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#fff1a1" />
      <stop offset="100%" stopColor="#e8b700" />
    </linearGradient>
    <linearGradient id="leaf" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#8bd39c" />
      <stop offset="100%" stopColor="#2f7a43" />
    </linearGradient>
    <radialGradient id="cherry" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#ff9ca8" />
      <stop offset="60%" stopColor="#d32445" />
      <stop offset="100%" stopColor="#7a0d24" />
    </radialGradient>
    <linearGradient id="cup" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#c8d3de" />
    </linearGradient>
  </defs>
);

const Plate = ({ w = 90 }: { w?: number }) => (
  <ellipse
    cx="50"
    cy="82"
    rx={w / 2}
    ry={8}
    fill="#000"
    opacity="0.12"
  />
);

const Sprinkles = ({ seed = 0 }: { seed?: number }) => {
  const colors = ["#e87aa0", "#ffd166", "#6bc7c7", "#a66bd0", "#6bd075"];
  const rects = Array.from({ length: 10 }).map((_, i) => {
    const angle = ((i * 37 + seed * 11) % 360) * (Math.PI / 180);
    const r = 14 + ((i + seed) % 3) * 2;
    const x = 50 + Math.cos(angle) * r;
    const y = 45 + Math.sin(angle) * r * 0.6;
    return (
      <rect
        key={i}
        x={x - 1.2}
        y={y - 0.4}
        width="2.4"
        height="0.8"
        rx="0.4"
        fill={colors[i % colors.length]}
        transform={`rotate(${(i * 29 + seed * 17) % 180} ${x} ${y})`}
      />
    );
  });
  return <>{rects}</>;
};

/* ---------- Drinks ---------- */

const HotChocolateArt = () => (
  <g>
    <Plate w={70} />
    {/* mug */}
    <path
      d="M24 38 h44 v30 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z"
      fill="url(#cup)"
      stroke="#a6b3c0"
      strokeWidth="1.2"
    />
    <path d="M68 44 a10 10 0 0 1 0 20" fill="none" stroke="#a6b3c0" strokeWidth="3" />
    {/* chocolate */}
    <ellipse cx="46" cy="40" rx="22" ry="5" fill="url(#chocolate)" />
    {/* marshmallow */}
    <rect x="38" y="36" width="7" height="5" rx="1.5" fill="#fff" />
    <rect x="47" y="35" width="6" height="5" rx="1.5" fill="#fff" />
    {/* shine */}
    <ellipse cx="35" cy="48" rx="10" ry="3" fill="url(#shine)" />
  </g>
);

const MilkshakeArt = () => (
  <g>
    <Plate w={60} />
    {/* glass */}
    <path
      d="M30 26 h40 l-4 50 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6 z"
      fill="url(#pink)"
      stroke="#c66a8c"
      strokeWidth="1.2"
    />
    {/* cream */}
    <ellipse cx="50" cy="26" rx="20" ry="4" fill="#fff" />
    <path
      d="M36 26 q6 -12 14 -10 q8 -2 14 10"
      fill="url(#cream)"
      stroke="#e8d9ad"
      strokeWidth="0.6"
    />
    {/* cherry */}
    <circle cx="50" cy="16" r="4" fill="url(#cherry)" />
    <path d="M50 12 q2 -6 7 -7" fill="none" stroke="#2f7a43" strokeWidth="1.4" />
    {/* straw */}
    <rect x="55" y="12" width="3" height="25" rx="1.2" fill="#e87aa0" />
    <rect x="55" y="12" width="3" height="4" rx="1" fill="#fff" opacity="0.5" />
  </g>
);

const SmoothieArt = () => (
  <g>
    <Plate w={60} />
    <path
      d="M30 28 h40 l-3 46 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
      fill="#fdc270"
      stroke="#c68226"
      strokeWidth="1.2"
    />
    <ellipse cx="50" cy="28" rx="20" ry="4" fill="#fde5a6" />
    <circle cx="46" cy="34" r="2" fill="#ff7e6b" />
    <circle cx="54" cy="36" r="1.6" fill="#ffa84e" />
    <circle cx="50" cy="40" r="1.4" fill="#ff9ab0" />
    {/* leaf */}
    <path d="M54 22 q6 -6 12 -4 q-2 6 -10 8 z" fill="url(#leaf)" />
    <rect x="48" y="14" width="3" height="18" rx="1.2" fill="#4ec47e" />
  </g>
);

const LemonadeArt = () => (
  <g>
    <Plate w={60} />
    <path
      d="M30 28 h40 l-3 46 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
      fill="#fff2a8"
      stroke="#d8b500"
      strokeWidth="1.2"
      opacity="0.9"
    />
    {/* bubbles */}
    <circle cx="40" cy="50" r="1.8" fill="#fff" opacity="0.8" />
    <circle cx="55" cy="56" r="1.4" fill="#fff" opacity="0.7" />
    <circle cx="48" cy="62" r="1.2" fill="#fff" opacity="0.8" />
    <circle cx="60" cy="48" r="1" fill="#fff" opacity="0.7" />
    {/* lemon slice */}
    <circle cx="36" cy="32" r="6" fill="url(#lemon)" />
    <circle cx="36" cy="32" r="4" fill="#fff6c4" />
    <path
      d="M36 28 v8 M32 32 h8 M33 29 l6 6 M33 35 l6 -6"
      stroke="#e8b700"
      strokeWidth="0.8"
    />
    {/* straw */}
    <path
      d="M56 18 l-4 34"
      stroke="#ff6b9b"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </g>
);

const CoffeeArt = () => (
  <g>
    <Plate w={70} />
    <path
      d="M22 36 h52 v26 a14 14 0 0 1 -14 14 h-24 a14 14 0 0 1 -14 -14 z"
      fill="#fff"
      stroke="#bfc6ce"
      strokeWidth="1.2"
    />
    <path d="M74 44 a10 10 0 0 1 0 20" fill="none" stroke="#bfc6ce" strokeWidth="3" />
    <ellipse cx="48" cy="38" rx="26" ry="5" fill="url(#chocolate)" />
    {/* latte heart */}
    <path
      d="M40 38 q2 -5 8 -3 q6 -2 8 3 q0 5 -8 8 q-8 -3 -8 -8z"
      fill="#f3e4c0"
      opacity="0.95"
    />
  </g>
);

const TeaArt = () => (
  <g>
    <Plate w={72} />
    {/* saucer */}
    <ellipse cx="50" cy="74" rx="34" ry="6" fill="#fff" stroke="#d6c89c" strokeWidth="1" />
    {/* cup */}
    <path
      d="M26 40 h48 v22 a12 12 0 0 1 -12 12 h-24 a12 12 0 0 1 -12 -12 z"
      fill="#fff"
      stroke="#d6c89c"
      strokeWidth="1.2"
    />
    <path d="M74 46 a8 8 0 0 1 0 16" fill="none" stroke="#d6c89c" strokeWidth="3" />
    <ellipse cx="50" cy="42" rx="22" ry="4" fill="#c98b4a" />
    {/* lemon wedge */}
    <path d="M64 42 a6 6 0 0 1 -10 0 z" fill="url(#lemon)" />
    <path d="M60 42 v-4 M58 42 l3 -3 M62 42 l-3 -3" stroke="#e8b700" strokeWidth="0.7" />
  </g>
);

const MochaArt = () => (
  <g>
    <Plate w={70} />
    <path
      d="M22 36 h52 v26 a14 14 0 0 1 -14 14 h-24 a14 14 0 0 1 -14 -14 z"
      fill="url(#chocolate)"
      stroke="#2c1606"
      strokeWidth="1.2"
    />
    <path d="M74 44 a10 10 0 0 1 0 20" fill="none" stroke="#8b5a2b" strokeWidth="3" />
    <ellipse cx="48" cy="38" rx="26" ry="5" fill="#a46934" />
    {/* marshmallows */}
    <rect x="34" y="34" width="7" height="5" rx="1.5" fill="#fff" />
    <rect x="44" y="33" width="7" height="6" rx="1.5" fill="#fff" />
    <rect x="54" y="34" width="6" height="5" rx="1.5" fill="#fff" />
    {/* drizzle */}
    <path
      d="M34 38 q4 4 8 0 q4 4 8 0 q4 4 8 0"
      fill="none"
      stroke="#3d1d0c"
      strokeWidth="1.2"
    />
  </g>
);

const BerrySmoothieArt = () => (
  <g>
    <Plate w={60} />
    <path
      d="M30 28 h40 l-3 46 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
      fill="url(#berry)"
      stroke="#5c1836"
      strokeWidth="1.2"
    />
    <ellipse cx="50" cy="28" rx="20" ry="4" fill="url(#cream)" />
    <circle cx="46" cy="24" r="3" fill="#6f1c44" />
    <circle cx="54" cy="24" r="2.2" fill="#a2356d" />
    {/* mint */}
    <path d="M44 20 q6 -8 12 -4 q-2 6 -10 8 z" fill="url(#leaf)" />
    <rect x="54" y="14" width="3" height="20" rx="1.2" fill="#ea5d7c" />
  </g>
);

/* ---------- Pastries ---------- */

const GlazedDonutArt = () => (
  <g>
    <Plate w={85} />
    <circle cx="50" cy="52" r="30" fill="url(#dough)" />
    <circle cx="50" cy="52" r="9" fill="#f1c97a" />
    {/* glaze */}
    <path
      d="M20 52 a30 30 0 1 1 60 0 q-6 -8 -16 -3 q-8 6 -14 -4 q-10 7 -16 3 q-8 4 -14 4 z"
      fill="#fff"
      opacity="0.95"
    />
    <path
      d="M23 54 a27 27 0 0 1 54 0 a8 8 0 0 1 -12 -2 q-8 8 -16 -3 q-8 8 -14 3 q-6 4 -12 2 z"
      fill="url(#shine)"
    />
    <circle cx="50" cy="52" r="9" fill="#f1c97a" />
    {/* hole inner shadow */}
    <circle cx="50" cy="52" r="9" fill="none" stroke="#c9974f" strokeWidth="1.5" />
  </g>
);

const SprinkleDonutArt = () => (
  <g>
    <Plate w={85} />
    <circle cx="50" cy="52" r="30" fill="url(#dough)" />
    <circle cx="50" cy="52" r="9" fill="#f1c97a" />
    <path
      d="M20 52 a30 30 0 1 1 60 0 q-6 -8 -16 -3 q-8 6 -14 -4 q-10 7 -16 3 q-8 4 -14 4 z"
      fill="url(#pink)"
    />
    <circle cx="50" cy="52" r="9" fill="#f1c97a" />
    <circle cx="50" cy="52" r="9" fill="none" stroke="#c9974f" strokeWidth="1.5" />
    <Sprinkles seed={2} />
  </g>
);

const ChocolateCupcakeArt = () => (
  <g>
    <Plate w={80} />
    {/* wrapper */}
    <path
      d="M26 54 l5 28 a4 4 0 0 0 4 3 h30 a4 4 0 0 0 4 -3 l5 -28 z"
      fill="#d24268"
    />
    <path
      d="M28 54 l1 6 M34 54 l-1 6 M40 54 l1 6 M46 54 l-1 6 M52 54 l1 6 M58 54 l-1 6 M64 54 l1 6 M70 54 l-1 6"
      stroke="#9e1f49"
      strokeWidth="1"
    />
    {/* frosting dome */}
    <path
      d="M24 54 q0 -22 26 -22 q26 0 26 22 z"
      fill="url(#chocolate)"
    />
    <path
      d="M30 48 q6 -10 20 -10 q14 0 20 10 q-6 -4 -10 2 q-4 -6 -10 0 q-4 -6 -10 0 q-4 -6 -10 -2 z"
      fill="#5a2b0f"
      opacity="0.7"
    />
    {/* shine */}
    <ellipse cx="40" cy="40" rx="10" ry="3" fill="url(#shine)" />
    {/* cherry */}
    <circle cx="50" cy="28" r="5" fill="url(#cherry)" />
    <path d="M50 23 q2 -6 6 -8" fill="none" stroke="#2f7a43" strokeWidth="1.4" />
  </g>
);

const BlueberryMuffinArt = () => (
  <g>
    <Plate w={80} />
    {/* wrapper */}
    <path
      d="M26 58 l4 24 a4 4 0 0 0 4 3 h32 a4 4 0 0 0 4 -3 l4 -24 z"
      fill="#8b5a2b"
    />
    <path
      d="M28 58 l1 5 M34 58 l-1 5 M40 58 l1 5 M46 58 l-1 5 M52 58 l1 5 M58 58 l-1 5 M64 58 l1 5 M70 58 l-1 5"
      stroke="#5c3a1a"
      strokeWidth="1"
    />
    {/* muffin top */}
    <path
      d="M20 58 q6 -32 30 -32 q24 0 30 32 z"
      fill="url(#dough)"
    />
    {/* bumps */}
    <circle cx="34" cy="40" r="6" fill="#e4b879" />
    <circle cx="50" cy="32" r="7" fill="#e4b879" />
    <circle cx="66" cy="40" r="6" fill="#e4b879" />
    {/* blueberries */}
    <circle cx="34" cy="38" r="2.8" fill="#4a5bd4" />
    <circle cx="50" cy="30" r="3" fill="#3044bf" />
    <circle cx="62" cy="42" r="2.6" fill="#5267e0" />
    <circle cx="42" cy="46" r="2" fill="#3044bf" />
    <circle cx="58" cy="48" r="2.2" fill="#4a5bd4" />
    {/* shine */}
    <ellipse cx="42" cy="34" rx="8" ry="2" fill="url(#shine)" />
  </g>
);

const CinnamonRollArt = () => (
  <g>
    <Plate w={80} />
    <circle cx="50" cy="52" r="30" fill="url(#dough)" />
    {/* spiral */}
    <path
      d="M50 52 m-22 0 a22 22 0 1 1 44 0 a18 18 0 1 0 -36 0 a14 14 0 1 1 28 0 a10 10 0 1 0 -20 0 a6 6 0 1 1 12 0"
      fill="none"
      stroke="#a4693b"
      strokeWidth="2.4"
    />
    <path
      d="M50 52 m-22 0 a22 22 0 1 1 44 0 a18 18 0 1 0 -36 0 a14 14 0 1 1 28 0 a10 10 0 1 0 -20 0 a6 6 0 1 1 12 0"
      fill="none"
      stroke="#6b3d1b"
      strokeWidth="1"
      opacity="0.7"
    />
    {/* icing drizzle */}
    <path
      d="M28 40 q6 -2 10 2 q6 -4 12 2 q6 -4 12 2 q6 -4 10 -2"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <ellipse cx="40" cy="36" rx="10" ry="2.4" fill="url(#shine)" />
  </g>
);

const ButterCookieArt = () => (
  <g>
    <Plate w={80} />
    {/* flower cookie */}
    <g>
      <circle cx="30" cy="52" r="14" fill="url(#gold)" />
      <circle cx="70" cy="52" r="14" fill="url(#gold)" />
      <circle cx="50" cy="32" r="14" fill="url(#gold)" />
      <circle cx="50" cy="72" r="14" fill="url(#gold)" />
      <circle cx="50" cy="52" r="18" fill="url(#gold)" />
      <circle cx="50" cy="52" r="4" fill="#d48331" />
    </g>
    <ellipse cx="42" cy="44" rx="12" ry="3" fill="url(#shine)" />
  </g>
);

/* ---------- Scratch goods ---------- */

const ScratchDonutArt = () => (
  <g>
    <Plate w={85} />
    <circle cx="50" cy="52" r="30" fill="url(#dough)" />
    <circle cx="50" cy="52" r="9" fill="#f1c97a" />
    <circle cx="50" cy="52" r="9" fill="none" stroke="#c9974f" strokeWidth="1.5" />
    {/* cinnamon sugar texture */}
    {Array.from({ length: 60 }).map((_, i) => {
      const a = (i * 6 * Math.PI) / 180;
      const r = 14 + (i % 3) * 4;
      const x = 50 + Math.cos(a) * r;
      const y = 52 + Math.sin(a) * r;
      return <circle key={i} cx={x} cy={y} r="0.7" fill="#8b5a2b" opacity="0.55" />;
    })}
    <ellipse cx="42" cy="36" rx="12" ry="3" fill="url(#shine)" />
  </g>
);

const ScratchCookiesArt = () => (
  <g>
    <Plate w={85} />
    <circle cx="32" cy="58" r="18" fill="url(#dough)" />
    <circle cx="66" cy="56" r="20" fill="url(#dough)" />
    {/* chips */}
    <circle cx="28" cy="56" r="2.2" fill="#3d1d0c" />
    <circle cx="36" cy="62" r="2" fill="#3d1d0c" />
    <circle cx="30" cy="50" r="1.8" fill="#3d1d0c" />
    <circle cx="62" cy="52" r="2.4" fill="#3d1d0c" />
    <circle cx="70" cy="58" r="2.2" fill="#3d1d0c" />
    <circle cx="66" cy="64" r="2" fill="#3d1d0c" />
    <circle cx="58" cy="60" r="1.6" fill="#3d1d0c" />
    {/* crumbs */}
    <circle cx="50" cy="78" r="1.2" fill="#c08a4a" />
    <circle cx="46" cy="80" r="0.8" fill="#c08a4a" />
    <ellipse cx="30" cy="52" rx="7" ry="1.8" fill="url(#shine)" />
  </g>
);

const BerryPieArt = () => (
  <g>
    <Plate w={90} />
    {/* crust */}
    <ellipse cx="50" cy="56" rx="38" ry="12" fill="#d4a461" />
    <path
      d="M12 56 q0 -18 38 -18 q38 0 38 18 z"
      fill="url(#dough)"
    />
    {/* filling */}
    <path
      d="M18 44 q0 -10 32 -10 q32 0 32 10 q0 6 -32 6 q-32 0 -32 -6 z"
      fill="url(#berry)"
    />
    {/* lattice */}
    <path
      d="M22 40 q28 14 56 0 M22 36 q28 14 56 0"
      fill="none"
      stroke="url(#dough)"
      strokeWidth="3"
    />
    <path
      d="M32 30 q-4 20 6 28 M50 28 q0 22 0 30 M68 30 q4 20 -6 28"
      fill="none"
      stroke="url(#dough)"
      strokeWidth="3"
    />
    <ellipse cx="38" cy="54" rx="18" ry="1.6" fill="url(#shine)" />
  </g>
);

const DecoratedCakeArt = () => (
  <g>
    <Plate w={80} />
    {/* layers */}
    <rect x="22" y="54" width="56" height="22" rx="3" fill="url(#cream)" stroke="#e0c892" />
    <rect x="26" y="40" width="48" height="18" rx="3" fill="#fff" stroke="#e0c892" />
    <rect x="30" y="30" width="40" height="14" rx="3" fill="url(#pink)" stroke="#c66a8c" />
    {/* drip */}
    <path
      d="M30 44 q2 6 6 2 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 6 -2"
      fill="#d24268"
    />
    {/* topper */}
    <circle cx="50" cy="22" r="5" fill="url(#cherry)" />
    <path d="M50 18 q2 -4 6 -6" fill="none" stroke="#2f7a43" strokeWidth="1.4" />
    <Sprinkles seed={5} />
  </g>
);

const CroissantArt = () => (
  <g>
    <Plate w={85} />
    {/* body */}
    <path
      d="M18 60 q8 -26 32 -26 q24 0 32 26 q-10 6 -28 -4 q-18 10 -36 4 z"
      fill="url(#gold)"
      stroke="#b07626"
      strokeWidth="1"
    />
    {/* layered folds */}
    <path
      d="M26 54 q6 -8 14 -6 M40 48 q6 -10 18 -6 M56 48 q6 -10 12 -4"
      fill="none"
      stroke="#b07626"
      strokeWidth="1.4"
    />
    <path
      d="M26 58 q6 -4 12 -2 M44 54 q6 -6 14 -2 M58 54 q4 -6 10 -2"
      fill="none"
      stroke="#8b5a2b"
      strokeWidth="1"
      opacity="0.7"
    />
    <ellipse cx="44" cy="44" rx="14" ry="2" fill="url(#shine)" />
  </g>
);

const ChocolateCroissantArt = () => (
  <g>
    <Plate w={85} />
    <path
      d="M18 60 q8 -26 32 -26 q24 0 32 26 q-10 6 -28 -4 q-18 10 -36 4 z"
      fill="url(#gold)"
      stroke="#6b3f14"
      strokeWidth="1"
    />
    {/* chocolate peeking out the ends */}
    <path
      d="M16 58 q2 -8 8 -10 q3 5 2 12 z M84 58 q-2 -8 -8 -10 q-3 5 -2 12 z"
      fill="#3a1d0a"
    />
    {/* dark drizzle across the top */}
    <path
      d="M24 40 q10 -4 22 2 q12 6 30 -2"
      fill="none"
      stroke="#3a1d0a"
      strokeWidth="2.2"
    />
    <path
      d="M28 50 q8 -2 18 3 q12 6 26 -2"
      fill="none"
      stroke="#5a2b0f"
      strokeWidth="1.5"
      opacity="0.8"
    />
    <ellipse cx="44" cy="40" rx="12" ry="2" fill="url(#shine)" />
  </g>
);

const WhiteChocMuffinArt = () => (
  <g>
    <Plate w={80} />
    {/* wrapper */}
    <path
      d="M26 58 l4 24 a4 4 0 0 0 4 3 h32 a4 4 0 0 0 4 -3 l4 -24 z"
      fill="#e3b7d6"
    />
    <path
      d="M28 58 l1 5 M34 58 l-1 5 M40 58 l1 5 M46 58 l-1 5 M52 58 l1 5 M58 58 l-1 5 M64 58 l1 5 M70 58 l-1 5"
      stroke="#c289b4"
      strokeWidth="1"
    />
    {/* pale vanilla muffin top */}
    <path
      d="M20 58 q6 -32 30 -32 q24 0 30 32 z"
      fill="#fff5e2"
      stroke="#e3d2a8"
      strokeWidth="1"
    />
    {/* white choc chunks */}
    <circle cx="36" cy="42" r="3" fill="#fffbea" stroke="#e9d9a6" strokeWidth="0.8" />
    <circle cx="52" cy="34" r="3" fill="#fffbea" stroke="#e9d9a6" strokeWidth="0.8" />
    <circle cx="64" cy="44" r="2.6" fill="#fffbea" stroke="#e9d9a6" strokeWidth="0.8" />
    <circle cx="44" cy="48" r="2.4" fill="#fffbea" stroke="#e9d9a6" strokeWidth="0.8" />
    {/* sprinkles */}
    <Sprinkles seed={4} />
    <ellipse cx="42" cy="34" rx="8" ry="2" fill="url(#shine)" />
  </g>
);

const RedVelvetMuffinArt = () => (
  <g>
    <Plate w={80} />
    {/* wrapper */}
    <path
      d="M26 58 l4 24 a4 4 0 0 0 4 3 h32 a4 4 0 0 0 4 -3 l4 -24 z"
      fill="#fff7e6"
    />
    <path
      d="M28 58 l1 5 M34 58 l-1 5 M40 58 l1 5 M46 58 l-1 5 M52 58 l1 5 M58 58 l-1 5 M64 58 l1 5 M70 58 l-1 5"
      stroke="#ead7a8"
      strokeWidth="1"
    />
    {/* deep red cocoa muffin */}
    <path
      d="M20 58 q6 -32 30 -32 q24 0 30 32 z"
      fill="#b2253a"
      stroke="#7a1624"
      strokeWidth="1"
    />
    {/* cream-cheese swirl on top */}
    <path
      d="M28 40 q8 -18 22 -18 q14 0 22 18 q-6 -4 -12 2 q-6 -6 -10 0 q-6 -6 -10 0 q-6 -6 -12 -2 z"
      fill="#fffbea"
      stroke="#e9d9a6"
      strokeWidth="0.8"
    />
    {/* swirl lines */}
    <path
      d="M36 30 q6 -6 14 -6 q10 0 14 6"
      fill="none"
      stroke="#e3d2a8"
      strokeWidth="1"
    />
    <ellipse cx="44" cy="28" rx="8" ry="2" fill="url(#shine)" />
  </g>
);

const OliveOilCakeArt = () => (
  <g>
    <Plate w={90} />
    {/* round cake body */}
    <ellipse cx="50" cy="66" rx="34" ry="8" fill="#c89649" />
    <path
      d="M16 66 v-24 a34 8 0 0 0 68 0 v24 a34 8 0 0 1 -68 0 z"
      fill="#e2b868"
      stroke="#a77837"
      strokeWidth="1"
    />
    {/* crackly top */}
    <ellipse cx="50" cy="42" rx="34" ry="8" fill="#eec987" stroke="#a77837" strokeWidth="1" />
    <path
      d="M22 42 q8 -4 16 0 q8 -4 16 0 q8 -4 18 0"
      fill="none"
      stroke="#a77837"
      strokeWidth="1"
      opacity="0.7"
    />
    <path
      d="M28 44 q6 3 12 0 M46 46 q6 3 12 0 M62 44 q4 2 8 0"
      fill="none"
      stroke="#8a5a22"
      strokeWidth="0.8"
      opacity="0.6"
    />
    {/* lemon zest flecks */}
    <circle cx="34" cy="40" r="1.2" fill="#f5d24b" />
    <circle cx="46" cy="38" r="1.1" fill="#f5d24b" />
    <circle cx="58" cy="40" r="1.3" fill="#f5d24b" />
    <circle cx="66" cy="42" r="1" fill="#f5d24b" />
    {/* olive oil drizzle sheen */}
    <ellipse cx="46" cy="40" rx="16" ry="2" fill="url(#shine)" />
  </g>
);

const PineappleJuiceArt = () => (
  <g>
    <Plate w={60} />
    {/* glass */}
    <path
      d="M30 28 h40 l-3 46 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
      fill="#ffd761"
      stroke="#c08a0f"
      strokeWidth="1.2"
      opacity="0.95"
    />
    {/* bubbles */}
      <circle cx="40" cy="52" r="1.6" fill="#fff" opacity="0.8" />
    <circle cx="55" cy="58" r="1.2" fill="#fff" opacity="0.7" />
    <circle cx="48" cy="64" r="1.2" fill="#fff" opacity="0.8" />
    <circle cx="60" cy="50" r="1" fill="#fff" opacity="0.7" />
    {/* pineapple wedge on rim */}
    <path d="M22 30 q6 -8 14 -8 q-2 6 -2 10 q-8 2 -12 -2 z" fill="#ffd761" stroke="#c08a0f" strokeWidth="0.8" />
    <path d="M26 26 v-6 M30 24 v-6 M34 26 v-6" stroke="#2f7a43" strokeWidth="1.2" />
    {/* leafy umbrella */}
    <path d="M56 14 l10 -6 l-2 10 z" fill="#4ec47e" />
    <rect x="56" y="14" width="2" height="22" fill="#e87aa0" />
  </g>
);

const AlmondMilkArt = () => (
  <g>
    <Plate w={60} />
    {/* glass */}
    <path
      d="M30 28 h40 l-3 46 a6 6 0 0 1 -6 6 h-22 a6 6 0 0 1 -6 -6 z"
      fill="url(#milk)"
      stroke="#b7a577"
      strokeWidth="1.2"
    />
    {/* foam */}
    <ellipse cx="50" cy="28" rx="20" ry="4" fill="#fff" />
    <path d="M34 28 q6 -6 16 -5 q10 -1 16 5" fill="#fff" stroke="#e0d7b9" strokeWidth="0.6" />
    {/* almond silhouette in middle */}
    <path
      d="M44 50 q6 -10 12 0 q-6 10 -12 0 z"
      fill="#d9b78a"
      stroke="#8b6a3b"
      strokeWidth="0.6"
      opacity="0.9"
    />
    <path d="M50 44 v10" stroke="#8b6a3b" strokeWidth="0.5" opacity="0.6" />
    {/* straw */}
    <rect x="55" y="14" width="3" height="24" rx="1.2" fill="#b7a577" />
  </g>
);

const MunchkinsArt = () => (
  <g>
    <Plate w={90} />
    {/* paper cup */}
    <path
      d="M22 50 l4 28 a4 4 0 0 0 4 3 h40 a4 4 0 0 0 4 -3 l4 -28 z"
      fill="#fff"
      stroke="#c9b98a"
      strokeWidth="1.2"
    />
    <path
      d="M26 56 l2 20 M34 56 l1 22 M42 56 l1 22 M50 56 v22 M58 56 l-1 22 M66 56 l-1 22 M74 56 l-2 20"
      stroke="#e0d2a6"
      strokeWidth="0.8"
    />
    {/* munchkin balls piled at the top of the cup */}
    <circle cx="34" cy="46" r="7" fill="url(#dough)" stroke="#8b5a2b" strokeWidth="0.8" />
    <circle cx="48" cy="42" r="8" fill="url(#glaze)" stroke="#b5577c" strokeWidth="0.8" />
    <circle cx="62" cy="46" r="7" fill="url(#chocolate)" stroke="#3d1d0c" strokeWidth="0.8" />
    <circle cx="40" cy="38" r="6.5" fill="url(#dough)" stroke="#8b5a2b" strokeWidth="0.8" />
    <circle cx="56" cy="36" r="6.5" fill="url(#gold)" stroke="#b07626" strokeWidth="0.8" />
    {/* sprinkles on the pink one */}
    <rect x="44" y="38" width="2.5" height="1" fill="#ff4f85" transform="rotate(20 45 38)" />
    <rect x="50" y="40" width="2.5" height="1" fill="#4ec47e" transform="rotate(-25 51 40)" />
    <rect x="47" y="44" width="2.5" height="1" fill="#f5d24b" transform="rotate(45 48 44)" />
    <rect x="52" y="36" width="2.5" height="1" fill="#ffffff" transform="rotate(-5 53 36)" />
    {/* little glaze shines */}
    <ellipse cx="46" cy="40" rx="3" ry="1" fill="url(#shine)" />
    <ellipse cx="60" cy="44" rx="3" ry="1" fill="url(#shine)" />
  </g>
);

/* ---------- Pet treats ---------- */

const DogBoneArt = () => (
  <g>
    <Plate w={80} />
    <path
      d="M22 52 a8 8 0 1 1 6 -13 a8 8 0 1 1 10 6 l24 0 a8 8 0 1 1 10 -6 a8 8 0 1 1 6 13 a8 8 0 1 1 -6 13 a8 8 0 1 1 -10 -6 l-24 0 a8 8 0 1 1 -10 6 a8 8 0 1 1 -6 -13 z"
      fill="url(#dough)"
      stroke="#8b5a2b"
      strokeWidth="1.2"
    />
    <ellipse cx="50" cy="46" rx="18" ry="2.5" fill="url(#shine)" />
    <circle cx="40" cy="52" r="0.8" fill="#8b5a2b" />
    <circle cx="60" cy="52" r="0.8" fill="#8b5a2b" />
  </g>
);

const CatFishArt = () => (
  <g>
    <Plate w={80} />
    <path
      d="M18 52 l10 -10 q20 -8 44 4 l10 -4 l-6 10 l6 10 l-10 -4 q-24 12 -44 4 z"
      fill="url(#gold)"
      stroke="#b07626"
      strokeWidth="1.2"
    />
    <circle cx="66" cy="50" r="2" fill="#2b1c0c" />
    <circle cx="66" cy="50" r="0.7" fill="#fff" />
    <path d="M36 50 l18 0" stroke="#b07626" strokeWidth="0.8" />
    <path d="M42 50 q4 -4 8 0" fill="none" stroke="#8b5a2b" strokeWidth="0.8" />
    <ellipse cx="50" cy="44" rx="14" ry="2" fill="url(#shine)" />
  </g>
);

/* ---------- Registry ---------- */

const FOOD_ART_BY_ID: Record<string, React.FC> = {
  hot_chocolate: HotChocolateArt,
  milkshake: MilkshakeArt,
  smoothie: SmoothieArt,
  lemonade: LemonadeArt,
  pineapple_juice: PineappleJuiceArt,
  almond_milk: AlmondMilkArt,
  coffee: CoffeeArt,
  tea: TeaArt,
  mocha: MochaArt,
  berry_smoothie: BerrySmoothieArt,
  glazed_donut: GlazedDonutArt,
  sprinkle_donut: SprinkleDonutArt,
  munchkins: MunchkinsArt,
  chocolate_cupcake: ChocolateCupcakeArt,
  blueberry_muffin: BlueberryMuffinArt,
  cinnamon_roll: CinnamonRollArt,
  butter_cookie: ButterCookieArt,
  scratch_donut: ScratchDonutArt,
  scratch_cookies: ScratchCookiesArt,
  scratch_pie: BerryPieArt,
  decorated_cake: DecoratedCakeArt,
  croissant: CroissantArt,
  chocolate_croissant: ChocolateCroissantArt,
  white_choc_muffin: WhiteChocMuffinArt,
  red_velvet_muffin: RedVelvetMuffinArt,
  olive_oil_cake: OliveOilCakeArt,
  dog_bone: DogBoneArt,
  cat_fish: CatFishArt,
};

export function FoodArt({
  id,
  size = 80,
  className = "",
  withShadow = true,
  emoji,
}: {
  id: string;
  size?: number;
  className?: string;
  withShadow?: boolean;
  /** Fallback icon for custom recipes that don't have a hand-built SVG.
   *  Rendered as a big emoji sitting on a pastel plate. */
  emoji?: string;
}) {
  const Art = FOOD_ART_BY_ID[id];
  // Custom recipe path: pretty pastel plate + large emoji at the center.
  if (!Art && emoji) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label={id}
      >
        {defs}
        {withShadow && (
          <ellipse cx="50" cy="86" rx="30" ry="4" fill="#000" opacity="0.15" />
        )}
        {/* soft pastel plate */}
        <ellipse cx="50" cy="80" rx="36" ry="7" fill="#f3e4c0" />
        <ellipse cx="50" cy="54" rx="34" ry="26" fill="#fff5e2" stroke="#e3d2a8" strokeWidth="1" />
        <ellipse cx="50" cy="54" rx="24" ry="18" fill="#fffbea" />
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontSize="52"
          style={{ fontFamily: "system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'" }}
        >
          {emoji}
        </text>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={id}
    >
      {defs}
      {withShadow && (
        <ellipse cx="50" cy="86" rx="30" ry="4" fill="#000" opacity="0.15" />
      )}
      {Art ? <Art /> : <circle cx="50" cy="50" r="30" fill="#dab577" />}
    </svg>
  );
}
