"use client";

import { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { Topbar } from "./Topbar";
import { RecipeBook } from "./RecipeBook";
import { Supermarket } from "./Supermarket";
import { ReviewsPanel } from "./ReviewsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { StationPicker } from "./StationPicker";
import { CounterPanel } from "./CounterPanel";
import { PantryPanel } from "./PantryPanel";
import { Bakery3D } from "./world/Bakery3D";
import { useGame } from "@/game/store";
import type { Hotspot } from "@/game/world";
import type { StationId } from "@/game/types";
import { FoodArt } from "./foods/FoodArt";
import { RECIPE_BY_ID } from "@/game/recipes";

export function BakeryApp() {
  const [hydrated, setHydrated] = useState(false);
  const hasOnboarded = useGame((s) => s.hasOnboarded);
  const tick = useGame((s) => s.tick);

  const [openRecipes, setOpenRecipes] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openCounter, setOpenCounter] = useState(false);
  const [openPantry, setOpenPantry] = useState(false);
  const [pickerStation, setPickerStation] = useState<StationId | null>(null);

  useEffect(() => {
    const unsub = useGame.persist.onFinishHydration(() => setHydrated(true));
    if (useGame.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Run the main game tick (customers, patience, deliveries) on a simple interval
  // so it keeps running even while modals are open. The 3D canvas has its own RAF.
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated || !hasOnboarded) return;
    const run = () => tick(Date.now());
    run();
    tickRef.current = window.setInterval(run, 120);
    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current);
    };
  }, [hydrated, hasOnboarded, tick]);

  function handleInteract(h: Hotspot) {
    if (h.kind === "station" && h.stationId) setPickerStation(h.stationId);
    else if (h.kind === "pantry") setOpenPantry(true);
    else if (h.kind === "supermarket") setOpenMarket(true);
    else if (h.kind === "counter") setOpenCounter(true);
    else if (h.kind === "bulletin") setOpenRecipes(true);
  }

  if (!hydrated) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center">
        <div className="text-cocoa-400 font-bold animate-pulse">Warming the ovens…</div>
      </div>
    );
  }

  if (!hasOnboarded) return <Welcome />;

  return (
    <div className="min-h-[100svh] flex flex-col">
      <Topbar
        onOpenRecipes={() => setOpenRecipes(true)}
        onOpenSupermarket={() => setOpenMarket(true)}
        onOpenReviews={() => setOpenReviews(true)}
        onOpenSettings={() => setOpenSettings(true)}
      />

      {/* 3D world takes the rest of the viewport */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <Bakery3D onInteract={handleInteract} />
        </div>

        {/* Left: active prep status */}
        <PrepHud />

        {/* Bottom ribbon: ready tray + control hints */}
        <GameHud onOpenCounter={() => setOpenCounter(true)} />

        {/* Desktop keyboard hint */}
        <div className="hidden md:block absolute top-2 right-3 text-xs text-cream-50 bg-cocoa-600/70 rounded-full px-3 py-1.5 shadow-soft">
          WASD to walk · Arrows / mouse-less turn · <b>E</b> or <b>Space</b> to interact
        </div>
      </main>

      {/* Modals */}
      <RecipeBook open={openRecipes} onClose={() => setOpenRecipes(false)} />
      <Supermarket open={openMarket} onClose={() => setOpenMarket(false)} />
      <ReviewsPanel open={openReviews} onClose={() => setOpenReviews(false)} />
      <SettingsPanel open={openSettings} onClose={() => setOpenSettings(false)} />
      <StationPicker stationId={pickerStation} onClose={() => setPickerStation(null)} />
      <CounterPanel open={openCounter} onClose={() => setOpenCounter(false)} />
      <PantryPanel
        open={openPantry}
        onClose={() => setOpenPantry(false)}
        onOpenSupermarket={() => setOpenMarket(true)}
      />
    </div>
  );
}

/** Shows the 4 stations as mini tiles with live progress rings + READY flags. */
function PrepHud() {
  const prep = useGame((s) => s.prep);
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 150);
    return () => window.clearInterval(id);
  }, []);

  const stations: { id: StationId; emoji: string }[] = [
    { id: "drink", emoji: "🥤" },
    { id: "pastry", emoji: "🧁" },
    { id: "scratch", emoji: "🥣" },
    { id: "pet", emoji: "🐾" },
  ];
  const active = stations.filter((s) => prep[s.id]);
  if (active.length === 0) return null;

  return (
    <div className="absolute top-2 left-28 md:top-3 md:left-44 flex gap-2 flex-wrap max-w-[60%]">
      {active.map((s) => {
        const slot = prep[s.id]!;
        const recipe = RECIPE_BY_ID[slot.recipeId];
        const p = Math.min(1, (now - slot.startedAt) / (slot.endsAt - slot.startedAt));
        const done = now >= slot.endsAt;
        return (
          <div
            key={s.id}
            className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-soft flex items-center gap-1.5 border ${
              done
                ? "bg-mint-500 text-white border-white animate-wiggle"
                : "bg-cream-50/95 text-cocoa-500 border-cream-200"
            }`}
          >
            <span>{s.emoji}</span>
            <span className="truncate max-w-[120px]">
              {done ? "READY!" : recipe?.name}
            </span>
            {!done && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: `conic-gradient(#7c5236 ${p * 360}deg, #e8d0a8 ${p * 360}deg)` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GameHud({ onOpenCounter }: { onOpenCounter: () => void }) {
  const ready = useGame((s) => s.ready);
  const customers = useGame((s) => s.customers);
  const isOpen = useGame((s) => s.isOpen);

  return (
    <div className="absolute bottom-0 inset-x-0 pointer-events-none">
      <div className="mx-auto max-w-6xl px-3 pb-3 md:pb-4 flex items-end justify-between gap-2">
        {/* Ready tray strip */}
        <div className="glass-case rounded-2xl p-2 pointer-events-auto min-w-[160px] max-w-[70%]">
          <div className="text-[10px] uppercase tracking-wider font-bold text-cocoa-500 mb-1">
            Ready tray · {ready.length}
          </div>
          {ready.length === 0 ? (
            <div className="text-xs text-cocoa-400">No treats yet — go prep something!</div>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto cozy-scroll">
              {ready.slice(0, 10).map((r) => (
                <div key={r.id} className="shrink-0">
                  <FoodArt id={r.recipeId} size={44} withShadow={false} />
                </div>
              ))}
              {ready.length > 10 && (
                <span className="text-xs text-cocoa-400 self-center">+{ready.length - 10}</span>
              )}
            </div>
          )}
        </div>

        {/* Customer bell button */}
        <button
          className={`pointer-events-auto rounded-full px-4 py-2 font-bold shadow-bakery border-2 transition ${
            customers.length > 0
              ? "bg-berry-500 text-white border-white animate-wiggle"
              : isOpen
                ? "bg-cream-50/90 text-cocoa-500 border-cream-200"
                : "bg-cream-50/70 text-cocoa-300 border-cream-200"
          }`}
          onClick={onOpenCounter}
        >
          🔔 {customers.length ? `${customers.length} waiting` : "Counter"}
        </button>
      </div>
    </div>
  );
}
