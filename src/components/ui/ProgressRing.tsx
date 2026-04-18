"use client";

export function ProgressRing({
  value, // 0..1
  size = 48,
  stroke = 6,
  trackColor = "rgba(139, 90, 43, 0.18)",
  color = "#7c5236",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  const color =
    v > 0.6 ? "#4ec47e" : v > 0.3 ? "#f0b000" : "#d24268";
  return (
    <div className={`h-2 w-full rounded-full bg-cocoa-100/60 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-150 ease-linear"
        style={{ width: `${v * 100}%`, background: color }}
      />
    </div>
  );
}
