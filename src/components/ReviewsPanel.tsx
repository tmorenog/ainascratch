"use client";

import { Modal } from "./ui/Modal";
import { Stars } from "./ui/Stars";
import { useGame } from "@/game/store";

export function ReviewsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reviews = useGame((s) => s.reviews);
  const stats = useGame((s) => s.stats);

  return (
    <Modal open={open} onClose={onClose} title="Reviews & Progress ⭐">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Stat label="Orders served" value={stats.ordersCompleted} />
        <Stat label="Best streak" value={stats.bestStreak} emoji="🔥" />
        <Stat label="Avg stars" value={stats.averageStars.toFixed(1)} emoji="⭐" />
        <Stat label="Total tips" value={`$${stats.totalTips}`} emoji="🪙" />
      </div>

      {reviews.length === 0 ? (
        <div className="text-center text-cocoa-400 py-10">
          No reviews yet — serve your first customer!
        </div>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-cream-200 bg-white/85 p-3 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-2xl">
                {r.customerEmoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-cocoa-600">{r.customerName}</div>
                  <Stars value={r.stars} />
                </div>
                <div className="text-sm text-cocoa-500">&ldquo;{r.text}&rdquo;</div>
                {r.tip > 0 && (
                  <div className="text-xs text-mint-500 font-bold mt-0.5">
                    + ${r.tip} tip
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string | number; emoji?: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white/85 p-3 text-center">
      <div className="text-xs uppercase font-bold tracking-wider text-cocoa-400">{label}</div>
      <div className="font-display text-2xl text-cocoa-600">
        {emoji && <span className="mr-1">{emoji}</span>}
        {value}
      </div>
    </div>
  );
}
