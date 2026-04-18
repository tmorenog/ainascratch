"use client";

import { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { Topbar } from "./Topbar";
import { CustomerQueue } from "./CustomerQueue";
import { StationGrid } from "./StationGrid";
import { ReadyTray } from "./ReadyTray";
import { InventoryStrip } from "./InventoryStrip";
import { RecipeBook } from "./RecipeBook";
import { Supermarket } from "./Supermarket";
import { ReviewsPanel } from "./ReviewsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { useGame } from "@/game/store";

export function BakeryApp() {
  const [hydrated, setHydrated] = useState(false);
  const hasOnboarded = useGame((s) => s.hasOnboarded);
  const tick = useGame((s) => s.tick);

  const [now, setNow] = useState<number>(() => Date.now());
  const [openRecipes, setOpenRecipes] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  // Wait for zustand persist to hydrate so we don't flash the welcome screen.
  useEffect(() => {
    const unsub = useGame.persist.onFinishHydration(() => setHydrated(true));
    if (useGame.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Main game tick — drives customer patience, spawns, deliveries.
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated || !hasOnboarded) return;
    const loop = () => {
      const n = Date.now();
      setNow(n);
      tick(n);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [hydrated, hasOnboarded, tick]);

  if (!hydrated) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center">
        <div className="text-cocoa-400 font-bold animate-pulse">Warming the ovens…</div>
      </div>
    );
  }

  if (!hasOnboarded) return <Welcome />;

  return (
    <div className="min-h-[100svh] pb-10">
      <Topbar
        onOpenRecipes={() => setOpenRecipes(true)}
        onOpenSupermarket={() => setOpenMarket(true)}
        onOpenReviews={() => setOpenReviews(true)}
        onOpenSettings={() => setOpenSettings(true)}
      />

      <main className="mx-auto max-w-6xl px-3 pt-3 space-y-3">
        <CustomerQueue now={now} />
        <StationGrid now={now} />
        <ReadyTray />
        <InventoryStrip onOpenSupermarket={() => setOpenMarket(true)} />
      </main>

      <RecipeBook open={openRecipes} onClose={() => setOpenRecipes(false)} />
      <Supermarket open={openMarket} onClose={() => setOpenMarket(false)} />
      <ReviewsPanel open={openReviews} onClose={() => setOpenReviews(false)} />
      <SettingsPanel open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  );
}
