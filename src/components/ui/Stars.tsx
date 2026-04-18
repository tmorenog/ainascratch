"use client";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <div className="inline-flex gap-0.5" aria-label={`${value} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < full ? "#f5b93b" : "none"}
          stroke="#c98933"
          strokeWidth="1.6"
          strokeLinejoin="round"
        >
          <path d="M12 2 l2.9 6.5 L22 9.3 l-5.5 4.7 L18 22 l-6 -3.5 L6 22 l1.5 -8 L2 9.3 l7.1 -0.8 z" />
        </svg>
      ))}
    </div>
  );
}
