"use client";

import type { StationId } from "@/game/types";

/**
 * SVG counter props for each station.  Each is a standalone SVG that
 * renders the counter base + the equipment that lives on it. They share
 * a 200 x 220 viewBox so they line up cleanly side-by-side.
 */

interface CounterProps {
  size?: number;
  glow?: boolean;
}

interface ResolvedCounter {
  size: number;
  glow?: boolean;
}

const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#a4693b" />
      <stop offset="100%" stopColor="#6b3d1b" />
    </linearGradient>
    <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f3e0c2" />
      <stop offset="100%" stopColor="#d6b986" />
    </linearGradient>
    <linearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#fff7d6" stopOpacity="0" />
    </linearGradient>
  </defs>
);

function Base({ id, glow }: { id: string; glow?: boolean }) {
  return (
    <>
      {/* glow halo */}
      {glow && (
        <ellipse
          cx="100"
          cy="200"
          rx="105"
          ry="22"
          fill={`url(#${id}-glow)`}
          opacity="0.7"
        />
      )}
      {/* shadow */}
      <ellipse cx="100" cy="208" rx="92" ry="6" fill="#000" opacity="0.18" />
      {/* counter body */}
      <rect x="14" y="120" width="172" height="80" rx="6" fill={`url(#${id}-wood)`} />
      {/* counter top */}
      <rect x="6" y="110" width="188" height="16" rx="6" fill={`url(#${id}-top)`} />
      <rect x="6" y="110" width="188" height="3" rx="2" fill="#fff" opacity="0.45" />
      {/* drawer fronts */}
      <rect x="22" y="138" width="74" height="50" rx="4" fill="#000" opacity="0.07" />
      <rect x="104" y="138" width="74" height="50" rx="4" fill="#000" opacity="0.07" />
      <rect x="54" y="158" width="14" height="3" rx="1" fill="#f5d99a" opacity="0.7" />
      <rect x="136" y="158" width="14" height="3" rx="1" fill="#f5d99a" opacity="0.7" />
    </>
  );
}

export function CounterProp({
  stationId,
  size = 200,
  glow,
}: { stationId: StationId; size?: number; glow?: boolean }) {
  if (stationId === "drink") return <DrinkBar size={size} glow={glow} />;
  if (stationId === "pastry") return <PastryCase size={size} glow={glow} />;
  if (stationId === "scratch") return <ScratchOven size={size} glow={glow} />;
  if (stationId === "pet") return <PetNook size={size} glow={glow} />;
  return null;
}

export function PantryShelf({ size = 200, glow }: CounterProps) {
  const id = "pantry";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      {glow && <ellipse cx="100" cy="200" rx="105" ry="22" fill={`url(#${id}-glow)`} />}
      <ellipse cx="100" cy="208" rx="88" ry="6" fill="#000" opacity="0.18" />
      {/* shelf cabinet */}
      <rect x="20" y="20" width="160" height="180" rx="6" fill="url(#pantry-wood)" />
      <rect x="20" y="20" width="160" height="180" rx="6" fill="none" stroke="#3f2614" strokeWidth="2" />
      {/* shelves */}
      {[60, 100, 140].map((y) => (
        <rect key={y} x="20" y={y} width="160" height="4" fill="#3f2614" />
      ))}
      {/* jars on shelves */}
      <Jar x={40} y={26} color="#fff8ec" emoji="🌾" />
      <Jar x={80} y={26} color="#ffe0a8" emoji="🍬" />
      <Jar x={120} y={26} color="#ffd6e4" emoji="🧁" />
      <Jar x={160} y={26} color="#fff" emoji="🥛" />
      <Jar x={40} y={66} color="#ffe6d2" emoji="🍫" />
      <Jar x={80} y={66} color="#fff8ec" emoji="🥚" />
      <Jar x={120} y={66} color="#ffd1c4" emoji="🍓" />
      <Jar x={160} y={66} color="#fef3a7" emoji="🍋" />
      <Jar x={40} y={106} color="#e6d3a7" emoji="🌰" />
      <Jar x={80} y={106} color="#bb8861" emoji="☕" />
      <Jar x={120} y={106} color="#cdf0c7" emoji="🍃" />
      <Jar x={160} y={106} color="#fff" emoji="🐾" />
      {/* basket on bottom */}
      <rect x="40" y="150" width="120" height="40" rx="6" fill="#c1955a" />
      <path d="M40 152 L160 152 M40 158 L160 158 M40 164 L160 164 M40 170 L160 170 M40 176 L160 176 M40 182 L160 182" stroke="#7c5236" strokeWidth="0.7" />
      <text x="100" y="178" textAnchor="middle" fontSize="22">🧺</text>
    </svg>
  );
}

function Jar({ x, y, color, emoji }: { x: number; y: number; color: string; emoji: string }) {
  return (
    <g>
      <rect x={x - 12} y={y + 4} width="24" height="28" rx="4" fill={color} stroke="#7c5236" strokeWidth="0.6" />
      <rect x={x - 13} y={y + 2} width="26" height="6" rx="2" fill="#7c5236" />
      <text x={x} y={y + 24} textAnchor="middle" fontSize="14">{emoji}</text>
    </g>
  );
}

function DrinkBar({ size, glow }: ResolvedCounter) {
  const id = "drink";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      <Base id={id} glow={glow} />
      {/* espresso machine */}
      <rect x="50" y="62" width="100" height="50" rx="6" fill="#cbd5e0" />
      <rect x="50" y="62" width="100" height="10" rx="6" fill="#94a3b8" />
      <rect x="58" y="74" width="38" height="20" rx="3" fill="#1f2937" />
      <rect x="62" y="78" width="6" height="6" fill="#86d8a6" />
      <rect x="72" y="78" width="6" height="6" fill="#f5b93b" />
      {/* portafilter */}
      <rect x="78" y="100" width="16" height="6" fill="#3f2614" />
      <rect x="84" y="106" width="4" height="8" fill="#3f2614" />
      {/* mug under */}
      <rect x="78" y="106" width="20" height="14" rx="2" fill="#fff" stroke="#bfc6ce" />
      {/* milk pitcher */}
      <path d="M120 86 L120 110 Q120 114 124 114 L138 114 Q142 114 142 110 L142 86 Z" fill="#fff" stroke="#bfc6ce" />
      <rect x="138" y="92" width="8" height="3" fill="#bfc6ce" />
      {/* steam */}
      <ellipse cx="84" cy="58" rx="6" ry="2" fill="#fff" opacity="0.7" />
      <ellipse cx="92" cy="50" rx="5" ry="2" fill="#fff" opacity="0.55" />
    </svg>
  );
}

function PastryCase({ size, glow }: ResolvedCounter) {
  const id = "pastry";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      <Base id={id} glow={glow} />
      {/* glass case */}
      <rect x="20" y="60" width="160" height="50" rx="6" fill="#e8f6ff" opacity="0.55" stroke="#bfd5e0" />
      <rect x="20" y="60" width="160" height="6" fill="#fff" opacity="0.8" />
      {/* pastries inside */}
      <circle cx="48" cy="92" r="12" fill="#dab577" />
      <circle cx="48" cy="92" r="4" fill="#f1c97a" />
      <path d="M30 92 a18 18 0 0 1 36 0 q-4 -4 -10 0 q-4 -4 -8 0 q-4 -4 -10 0 z" fill="#ffd6e4" />
      <ellipse cx="100" cy="86" rx="14" ry="10" fill="#7a3f20" />
      <ellipse cx="100" cy="80" rx="12" ry="6" fill="#fff" opacity="0.6" />
      <circle cx="100" cy="78" r="3" fill="#d32445" />
      <ellipse cx="148" cy="92" rx="16" ry="10" fill="#dab577" />
      {/* blueberries */}
      <circle cx="142" cy="86" r="2" fill="#3044bf" />
      <circle cx="148" cy="84" r="2" fill="#4a5bd4" />
      <circle cx="154" cy="86" r="2" fill="#3044bf" />
    </svg>
  );
}

function ScratchOven({ size, glow }: ResolvedCounter) {
  const id = "scratch";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      <Base id={id} glow={glow} />
      {/* mixing bowl on top-left */}
      <ellipse cx="46" cy="106" rx="22" ry="6" fill="#000" opacity="0.15" />
      <path d="M22 90 Q46 70 70 90 L66 108 Q46 116 26 108 Z" fill="#e8d7b0" stroke="#b07626" />
      <ellipse cx="46" cy="90" rx="24" ry="6" fill="#fff8ec" />
      <path d="M40 86 q6 4 12 -2" fill="none" stroke="#b07626" strokeWidth="1" />
      {/* oven */}
      <rect x="98" y="60" width="84" height="58" rx="6" fill="#7a3f20" />
      <rect x="106" y="76" width="68" height="34" rx="4" fill="#1f0d04" />
      <rect x="106" y="76" width="68" height="34" rx="4" fill="url(#oven-glow)" opacity="0.6" />
      <defs>
        <linearGradient id="oven-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb14a" />
          <stop offset="100%" stopColor="#7a2d05" />
        </linearGradient>
      </defs>
      <rect x="106" y="68" width="68" height="6" rx="2" fill="#3f2614" />
      <circle cx="170" cy="64" r="3" fill="#f5b93b" />
      {/* tray inside */}
      <rect x="116" y="92" width="48" height="14" rx="2" fill="#3f2614" />
      <circle cx="124" cy="98" r="4" fill="#dab577" />
      <circle cx="138" cy="98" r="4" fill="#dab577" />
      <circle cx="152" cy="98" r="4" fill="#dab577" />
    </svg>
  );
}

function PetNook({ size, glow }: ResolvedCounter) {
  const id = "pet";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      <Base id={id} glow={glow} />
      {/* basket of treats */}
      <ellipse cx="60" cy="110" rx="32" ry="6" fill="#000" opacity="0.15" />
      <path d="M30 90 L90 90 L86 108 Q60 114 34 108 Z" fill="#c1955a" stroke="#7c5236" />
      {/* treats */}
      <path d="M40 76 a4 4 0 1 1 4 -6 a4 4 0 1 1 6 0 l8 0 a4 4 0 1 1 6 0 a4 4 0 1 1 4 6 a4 4 0 1 1 -4 6 a4 4 0 1 1 -6 0 l-8 0 a4 4 0 1 1 -6 0 a4 4 0 1 1 -4 -6 z" fill="#dab577" />
      <path d="M64 80 l8 -6 q12 -4 24 4 l6 -2 l-4 6 l4 6 l-6 -2 q-12 8 -24 4 z" fill="#dab577" />
      <text x="148" y="100" fontSize="40" textAnchor="middle">🐾</text>
    </svg>
  );
}

export function SupermarketKiosk({ size = 200, glow }: CounterProps) {
  const id = "sm";
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <Defs id={id} />
      {glow && <ellipse cx="100" cy="200" rx="105" ry="22" fill={`url(#${id}-glow)`} />}
      <ellipse cx="100" cy="208" rx="88" ry="6" fill="#000" opacity="0.18" />
      {/* sign post */}
      <rect x="92" y="50" width="16" height="120" fill="#7c5236" />
      {/* sign */}
      <rect x="20" y="20" width="160" height="50" rx="8" fill="#4ec47e" stroke="#2f7a43" strokeWidth="2" />
      <rect x="20" y="20" width="160" height="14" rx="6" fill="#86d8a6" />
      <text x="100" y="55" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#fff">
        🛒 Market
      </text>
      {/* base */}
      <rect x="60" y="160" width="80" height="40" rx="4" fill="#7c5236" />
      <rect x="60" y="160" width="80" height="6" fill="#a47551" />
    </svg>
  );
}

export function ServiceCounter({
  size = 420,
  glow,
}: { size?: number; glow?: boolean }) {
  return (
    <svg viewBox="0 0 420 260" width={size} height={size * (260 / 420)}>
      <defs>
        <linearGradient id="sc-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a4693b" />
          <stop offset="100%" stopColor="#5a3922" />
        </linearGradient>
        <linearGradient id="sc-wood-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5326" />
          <stop offset="100%" stopColor="#4a2c14" />
        </linearGradient>
        <linearGradient id="sc-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e0c2" />
          <stop offset="100%" stopColor="#c19659" />
        </linearGradient>
        <linearGradient id="sc-top-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2c188" />
          <stop offset="100%" stopColor="#a07434" />
        </linearGradient>
        <linearGradient id="sc-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff7d6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* L-SHAPED counter, sideways.
          Back leg runs horizontally along the top.
          Front leg juts toward the viewer on the left end, creating a chunky L. */}

      {glow && <ellipse cx="210" cy="244" rx="210" ry="22" fill="url(#sc-glow)" />}
      <ellipse cx="210" cy="250" rx="200" ry="8" fill="#000" opacity="0.2" />

      {/* Back leg base (horizontal) */}
      <rect x="90" y="120" width="330" height="100" rx="6" fill="url(#sc-wood)" />
      {/* Front leg base (juts forward/down) */}
      <rect x="10" y="160" width="140" height="90" rx="6" fill="url(#sc-wood-front)" />
      {/* Inside corner accent so the L reads clearly */}
      <path
        d="M90 160 L150 160 L150 220 L90 220 Z"
        fill="#000"
        opacity="0.12"
      />

      {/* Paneling - back leg */}
      <path
        d="M116 140 L116 212 M158 140 L158 212 M200 140 L200 212 M242 140 L242 212 M284 140 L284 212 M326 140 L326 212 M368 140 L368 212"
        stroke="#3f2614"
        strokeWidth="0.7"
      />
      {/* Paneling - front leg */}
      <path
        d="M42 180 L42 240 M84 180 L84 240 M126 180 L126 240"
        stroke="#2a1708"
        strokeWidth="0.7"
      />

      {/* Counter top - back leg */}
      <rect x="80" y="104" width="340" height="22" rx="6" fill="url(#sc-top)" />
      <rect x="80" y="104" width="340" height="3" fill="#fff" opacity="0.5" />
      {/* Counter top - front leg (slightly warmer/darker to imply it's closer to the floor viewer) */}
      <rect x="0" y="144" width="150" height="22" rx="6" fill="url(#sc-top-front)" />
      <rect x="0" y="144" width="150" height="3" fill="#fff" opacity="0.45" />
      {/* L-joint top */}
      <rect x="80" y="124" width="70" height="22" fill="url(#sc-top-front)" />

      {/* Register sits on the back leg */}
      <rect x="120" y="70" width="70" height="38" rx="4" fill="#fff" stroke="#bfc6ce" />
      <rect x="120" y="70" width="70" height="10" rx="4" fill="#86d8a6" />
      <rect x="128" y="86" width="54" height="16" rx="2" fill="#1f2937" />
      <text x="147" y="98" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#86d8a6">$</text>

      {/* Bell on the corner */}
      <circle cx="340" cy="88" r="16" fill="#f5b93b" stroke="#a87a3c" strokeWidth="2" />
      <circle cx="340" cy="88" r="7" fill="#fff" opacity="0.5" />
      <rect x="334" y="104" width="12" height="6" fill="#a87a3c" />

      {/* Receipt paper on the front leg top */}
      <rect x="22" y="128" width="48" height="16" rx="2" fill="#fff" stroke="#d4b88a" />
      <path d="M26 132 L66 132 M26 136 L60 136 M26 140 L62 140" stroke="#d4b88a" strokeWidth="0.6" />
    </svg>
  );
}
