"use client";

import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { Stars } from "./ui/Stars";
import { useT } from "@/game/i18n";

interface TopbarProps {
  onOpenRecipes: () => void;
  onOpenSupermarket: () => void;
  onOpenReviews: () => void;
  onOpenSettings: () => void;
}

export function Topbar({
  onOpenRecipes,
  onOpenSupermarket,
  onOpenReviews,
  onOpenSettings,
}: TopbarProps) {
  const bakeryName = useGame((s) => s.bakeryName);
  const coins = useGame((s) => s.coins);
  const level = useGame((s) => s.level);
  const xp = useGame((s) => s.xp);
  const stats = useGame((s) => s.stats);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);
  const t = useT();

  const xpToNext = 30 + level * 25;

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-3 pt-3">
        <div className="panel !p-3 md:!p-4 flex items-center gap-3">
          {/* Bakery sign */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-cocoa-400"
                animate={{ rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center text-2xl">
                🧁
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-cocoa-300 font-bold">
                {t("welcomeTo")}
              </div>
              <div className="font-display font-black text-cocoa-600 text-lg md:text-2xl leading-tight truncate">
                {bakeryName || "Your Bakery"}
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* HUD */}
          <div className="hidden md:flex items-center gap-2">
            <div className="chip">
              <Stars value={stats.averageStars} size={14} />
              <span className="ml-1">
                {stats.reviewsCount === 0 ? "New!" : stats.averageStars.toFixed(1)}
              </span>
            </div>
            <div className="chip" title="Streak">🔥 {stats.streak}</div>
          </div>

          <div className="chip" title="Coins">
            🪙 <span className="tabular-nums">{coins}</span>
          </div>
          <div className="chip hidden sm:inline-flex" title="Level">
            <span>{t("level")} {level}</span>
            <span className="w-12 h-1.5 bg-cocoa-100 rounded-full overflow-hidden ml-1">
              <span
                className="block h-full bg-cocoa-400"
                style={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%` }}
              />
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button className="btn-icon" title={t("recipeBook")} onClick={onOpenRecipes}>📖</button>
            <button className="btn-icon" title={t("supermarket")} onClick={onOpenSupermarket}>🛒</button>
            <button className="btn-icon" title={t("reviews")} onClick={onOpenReviews}>⭐</button>
            <button className="btn-icon" title={t("settings")} onClick={onOpenSettings}>⚙️</button>
            <button
              className={`hidden md:inline-flex rounded-full px-4 py-2 font-bold shadow-soft transition ml-1 ${
                isOpen
                  ? "bg-berry-500 text-white hover:bg-berry-600"
                  : "bg-mint-500 text-white hover:bg-mint-400"
              }`}
              onClick={toggleStore}
            >
              {isOpen ? t("closeShop") : t("openShop")}
            </button>
          </div>
        </div>

        {/* Mobile open/close */}
        <div className="md:hidden mt-2 flex gap-2">
          <button
            className={`flex-1 rounded-full px-4 py-2 font-bold shadow-soft transition ${
              isOpen
                ? "bg-berry-500 text-white"
                : "bg-mint-500 text-white"
            }`}
            onClick={toggleStore}
          >
            {isOpen ? "Close Shop" : "Open Shop"}
          </button>
        </div>
      </div>
    </header>
  );
}
