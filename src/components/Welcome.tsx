"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useGame } from "@/game/store";
import { pickFunnyName } from "@/game/reviews";
import type { Difficulty } from "@/game/types";
import { FoodArt } from "./foods/FoodArt";

const DIFFICULTIES: { id: Difficulty; title: string; desc: string; emoji: string }[] = [
  {
    id: "cozy",
    title: "Cozy Mode",
    desc: "Slow and sweet. Customers are very patient.",
    emoji: "🫖",
  },
  {
    id: "normal",
    title: "Just Right",
    desc: "A lovely flow of friendly customers.",
    emoji: "🧁",
  },
  {
    id: "rush",
    title: "Morning Rush",
    desc: "Lots of customers, less patience, more tips!",
    emoji: "⏰",
  },
];

export function Welcome() {
  const bakeryName = useGame((s) => s.bakeryName);
  const setBakeryName = useGame((s) => s.setBakeryName);
  const setDifficulty = useGame((s) => s.setDifficulty);
  const difficulty = useGame((s) => s.difficulty);
  const finishOnboarding = useGame((s) => s.finishOnboarding);

  const [name, setName] = useState(bakeryName || "");
  const [picked, setPicked] = useState<Difficulty>(difficulty);

  const floaters = ["glazed_donut", "chocolate_cupcake", "croissant", "hot_chocolate", "milkshake", "scratch_cookies"];

  const canStart = name.trim().length > 0;

  function handleStart() {
    setBakeryName(name.trim());
    setDifficulty(picked);
    finishOnboarding();
  }

  return (
    <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 py-8">
      {/* Floating food decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floaters.map((id, i) => (
          <motion.div
            key={id}
            className="absolute"
            style={{
              left: `${(i * 17 + 6) % 90}%`,
              top: `${(i * 29 + 5) % 80}%`,
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
              rotate: [0, 6, 0, -6, 0],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FoodArt id={id} size={70 + (i % 3) * 10} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="panel max-w-xl w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🧁</div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-cocoa-600 leading-tight">
            Aina&apos;s Bakery
          </h1>
          <p className="mt-1 text-cocoa-400 font-semibold">
            A cozy baking &amp; drink shop simulator
          </p>
        </div>

        <label className="block text-sm font-bold text-cocoa-500 mb-1">
          Name your bakery
        </label>
        <div className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 36))}
            placeholder="Bunkin Bonuts"
            className="flex-1 rounded-2xl border border-cream-300 bg-white/80 px-4 py-3 text-lg font-bold text-cocoa-600 placeholder-cocoa-200 shadow-innerwarm focus:outline-none focus:ring-2 focus:ring-cocoa-300"
          />
          <button
            type="button"
            className="btn-secondary whitespace-nowrap"
            onClick={() => setName(pickFunnyName())}
            title="Roll a funny name"
          >
            🎲 Funny name
          </button>
        </div>

        <div className="mt-6">
          <div className="text-sm font-bold text-cocoa-500 mb-2">Choose your pace</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => {
              const active = picked === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setPicked(d.id)}
                  className={`rounded-2xl p-3 text-left border-2 transition ${
                    active
                      ? "border-cocoa-400 bg-cream-100 shadow-soft"
                      : "border-cream-200 bg-white/60 hover:bg-cream-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-cocoa-600">
                    <span className="text-xl">{d.emoji}</span> {d.title}
                  </div>
                  <div className="text-xs text-cocoa-400 mt-1">{d.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-cocoa-400 max-w-[60%]">
            Progress saves automatically in your browser. No sign-in, no ads, just cozy baking.
          </p>
          <button
            className="btn-primary text-lg px-6 py-3 disabled:opacity-50"
            disabled={!canStart}
            onClick={handleStart}
          >
            Open the bakery →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
