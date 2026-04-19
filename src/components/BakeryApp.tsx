"use client";

import { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { Topbar } from "./Topbar";
import { RecipeBook } from "./RecipeBook";
import { Supermarket } from "./Supermarket";
import { ReviewsPanel } from "./ReviewsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { PantryPanel } from "./PantryPanel";
import { PrepScene } from "./scene/PrepScene";
import { LevelUpToast } from "./scene/LevelUpToast";
import { BakeryWorld3D } from "./three/BakeryWorld3D";
import { DialogPanel } from "./three/DialogPanel";
import { FurnitureShop } from "./three/FurnitureShop";
import { FURNITURE_CATALOG } from "@/game/world3d";
import { useGame } from "@/game/store";
import { CozyMusic } from "@/game/music";
import type { Customer, StationId } from "@/game/types";

export function BakeryApp() {
  const [hydrated, setHydrated] = useState(false);
  const hasOnboarded = useGame((s) => s.hasOnboarded);
  const tick = useGame((s) => s.tick);
  const customers = useGame((s) => s.customers);
  const ready = useGame((s) => s.ready);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);
  const serveCustomer = useGame((s) => s.serveCustomer);
  const buyFurniture = useGame((s) => s.buyFurniture);

  const [openRecipes, setOpenRecipes] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openPantry, setOpenPantry] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const [prepStation, setPrepStation] = useState<StationId | null>(null);
  const [dialogCustomer, setDialogCustomer] = useState<Customer | null>(null);
  const [placingKind, setPlacingKind] = useState<string | null>(null);

  // Cozy background music — starts on first user gesture
  const musicRef = useRef<CozyMusic | null>(null);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    const m = new CozyMusic();
    m.restoreMutedFromStorage();
    setMuted(m.muted);
    musicRef.current = m;
    const boot = () => {
      m.start();
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("keydown", boot);
    };
    window.addEventListener("pointerdown", boot);
    window.addEventListener("keydown", boot);
    return () => {
      m.stop();
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("keydown", boot);
    };
  }, []);
  const toggleMute = () => {
    musicRef.current?.toggleMute();
    setMuted(musicRef.current?.muted ?? false);
  };

  useEffect(() => {
    const unsub = useGame.persist.onFinishHydration(() => setHydrated(true));
    if (useGame.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Game tick — patience, deliveries, spawns.
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

  // Cancel placement with Escape
  useEffect(() => {
    if (!placingKind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlacingKind(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placingKind]);

  if (!hydrated) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center">
        <div className="text-cocoa-400 font-bold animate-pulse">
          Warming the ovens…
        </div>
      </div>
    );
  }

  if (!hasOnboarded) return <Welcome />;

  // Compute "can serve" for the dialog customer
  let canServe = false;
  if (dialogCustomer) {
    const wanted = [...dialogCustomer.order];
    const tray = [...ready];
    const used: number[] = [];
    canServe = wanted.every((id) => {
      const i = tray.findIndex((r, idx) => r.recipeId === id && !used.includes(idx));
      if (i === -1) return false;
      used.push(i);
      return true;
    });
  }

  return (
    <div className="min-h-[100svh] flex flex-col">
      <Topbar
        onOpenRecipes={() => setOpenRecipes(true)}
        onOpenSupermarket={() => setOpenMarket(true)}
        onOpenReviews={() => setOpenReviews(true)}
        onOpenSettings={() => setOpenSettings(true)}
      />

      <main className="flex-1 relative overflow-hidden">
        <BakeryWorld3D
          inputPaused={
            !!dialogCustomer ||
            prepStation !== null ||
            openMarket ||
            openPantry ||
            openRecipes ||
            openReviews ||
            openSettings ||
            openShop
          }
          placingFurniture={placingKind}
          onPlaceFurniture={(kind, x, z) => {
            const entry = FURNITURE_CATALOG.find((f) => f.id === kind);
            if (!entry) return;
            const ok = buyFurniture(kind, x, z, 0, entry.price);
            if (ok) setPlacingKind(null);
          }}
          onInteract={(hs, customer) => {
            if (hs.kind === "station" && hs.stationId) {
              setPrepStation(hs.stationId);
            } else if (hs.kind === "pantry") {
              setOpenPantry(true);
            } else if (hs.kind === "supermarket") {
              setOpenMarket(true);
            } else if (hs.kind === "door") {
              // Just a friendly "you're heading out back" — walking
              // forward takes you into the outdoor area automatically.
            } else if (hs.kind === "counter-customer") {
              if (customer) setDialogCustomer(customer);
              else if (!isOpen && customers.length === 0) toggleStore();
            }
          }}
        />

        {/* HUD: open/close + shop buttons */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => toggleStore()}
            className={`rounded-full px-4 py-2 font-bold shadow-bakery ${
              isOpen ? "bg-berry-500 text-white" : "bg-mint-500 text-white"
            }`}
          >
            {isOpen ? "Close Shop" : "Open Shop"}
          </button>
          <button
            onClick={() => setOpenShop(true)}
            className="rounded-full px-4 py-2 bg-cream-50 text-cocoa-700 font-bold shadow-bakery"
          >
            🛋️ Furniture
          </button>
          <button
            onClick={toggleMute}
            className="rounded-full px-4 py-2 bg-cream-50 text-cocoa-700 font-bold shadow-bakery"
            title={muted ? "Unmute music" : "Mute music"}
          >
            {muted ? "🔇 Music" : "🎵 Music"}
          </button>
        </div>
      </main>

      {/* Modals */}
      <RecipeBook open={openRecipes} onClose={() => setOpenRecipes(false)} />
      <Supermarket open={openMarket} onClose={() => setOpenMarket(false)} />
      <ReviewsPanel open={openReviews} onClose={() => setOpenReviews(false)} />
      <SettingsPanel open={openSettings} onClose={() => setOpenSettings(false)} />
      <PantryPanel
        open={openPantry}
        onClose={() => setOpenPantry(false)}
        onOpenSupermarket={() => setOpenMarket(true)}
      />
      <PrepScene
        stationId={prepStation}
        onClose={() => setPrepStation(null)}
      />
      <DialogPanel
        customer={dialogCustomer}
        canServe={canServe}
        onClose={() => setDialogCustomer(null)}
        onServe={() => {
          if (!dialogCustomer) return;
          serveCustomer(dialogCustomer.id);
          setDialogCustomer(null);
        }}
      />
      <FurnitureShop
        open={openShop}
        onClose={() => setOpenShop(false)}
        onPickKind={(kind) => setPlacingKind(kind)}
      />
      <LevelUpToast />
    </div>
  );
}
