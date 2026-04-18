"use client";

import { Modal } from "./ui/Modal";
import { useGame } from "@/game/store";
import type { Difficulty } from "@/game/types";
import { useState } from "react";

const PACES: { id: Difficulty; label: string; emoji: string; desc: string }[] = [
  { id: "cozy", label: "Cozy", emoji: "🫖", desc: "Very patient customers." },
  { id: "normal", label: "Just right", emoji: "🧁", desc: "Balanced flow." },
  { id: "rush", label: "Rush", emoji: "⏰", desc: "Faster, bigger tips." },
];

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const bakeryName = useGame((s) => s.bakeryName);
  const setBakeryName = useGame((s) => s.setBakeryName);
  const difficulty = useGame((s) => s.difficulty);
  const setDifficulty = useGame((s) => s.setDifficulty);
  const resetGame = useGame((s) => s.resetGame);
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState(bakeryName);

  return (
    <Modal open={open} onClose={onClose} title="Settings ⚙️" maxWidth="max-w-lg">
      <label className="block text-sm font-bold text-cocoa-500 mb-1">
        Bakery name
      </label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 36))}
          className="flex-1 rounded-2xl border border-cream-300 bg-white/80 px-4 py-2 font-bold text-cocoa-600"
        />
        <button className="btn-primary" onClick={() => setBakeryName(name)}>Save</button>
      </div>

      <div className="mt-4">
        <div className="text-sm font-bold text-cocoa-500 mb-1">Pace</div>
        <div className="grid grid-cols-3 gap-2">
          {PACES.map((p) => {
            const active = difficulty === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setDifficulty(p.id)}
                className={`rounded-2xl p-2 text-left border-2 transition ${
                  active
                    ? "border-cocoa-400 bg-cream-100"
                    : "border-cream-200 bg-white/70 hover:bg-cream-100"
                }`}
              >
                <div className="font-bold text-cocoa-600">
                  {p.emoji} {p.label}
                </div>
                <div className="text-[11px] text-cocoa-400">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 p-3 rounded-2xl border border-berry-400/30 bg-berry-400/10">
        <div className="font-bold text-berry-600 mb-1">Start fresh</div>
        <div className="text-sm text-cocoa-500 mb-2">
          Deletes your save and takes you back to the welcome screen.
        </div>
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              className="btn-primary bg-berry-500 hover:bg-berry-600"
              onClick={() => {
                resetGame();
                onClose();
              }}
            >
              Yes, reset everything
            </button>
            <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={() => setConfirmReset(true)}>
            Reset save
          </button>
        )}
      </div>
    </Modal>
  );
}
