"use client";

import { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { Topbar } from "./Topbar";
import { RecipeBook } from "./RecipeBook";
import { Supermarket } from "./Supermarket";
import { ReviewsPanel } from "./ReviewsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { PantryPanel } from "./PantryPanel";
import { Bakery2D } from "./scene/Bakery2D";
import { OrderTicket } from "./scene/OrderTicket";
import { PrepScene } from "./scene/PrepScene";
import { LevelUpToast } from "./scene/LevelUpToast";
import { useGame } from "@/game/store";
import type { StationId } from "@/game/types";

export function BakeryApp() {
  const [hydrated, setHydrated] = useState(false);
  const hasOnboarded = useGame((s) => s.hasOnboarded);
  const tick = useGame((s) => s.tick);
  const customers = useGame((s) => s.customers);
  const ready = useGame((s) => s.ready);
  const isOpen = useGame((s) => s.isOpen);
  const toggleStore = useGame((s) => s.toggleStore);
  const serveCustomer = useGame((s) => s.serveCustomer);
  const dismissCustomer = useGame((s) => s.dismissCustomer);

  const [openRecipes, setOpenRecipes] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openPantry, setOpenPantry] = useState(false);
  const [prepStation, setPrepStation] = useState<StationId | null>(null);

  // The customer the player is currently focused on (the one whose order
  // shows in the bottom black ticket bar). Defaults to the first in queue.
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | null>(null);
  const focusedCustomer =
    customers.find((c) => c.id === focusedCustomerId) ??
    customers[0] ??
    null;
  // Live patience for the order ticket clock
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const unsub = useGame.persist.onFinishHydration(() => setHydrated(true));
    if (useGame.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Keep focused customer valid; if they leave, jump to the next one.
  useEffect(() => {
    if (focusedCustomerId && !customers.find((c) => c.id === focusedCustomerId)) {
      setFocusedCustomerId(customers[0]?.id ?? null);
    }
    if (!focusedCustomerId && customers[0]) {
      setFocusedCustomerId(customers[0].id);
    }
  }, [customers, focusedCustomerId]);

  // Game tick — patience, deliveries, spawns.
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated || !hasOnboarded) return;
    const run = () => {
      tick(Date.now());
      setNow(Date.now());
    };
    run();
    tickRef.current = window.setInterval(run, 120);
    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current);
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

  // Compute "can serve" for the focused customer
  let canServe = false;
  if (focusedCustomer) {
    const wanted = [...focusedCustomer.order];
    const tray = [...ready];
    const used: number[] = [];
    canServe = wanted.every((id) => {
      const i = tray.findIndex((r, idx) => r.recipeId === id && !used.includes(idx));
      if (i === -1) return false;
      used.push(i);
      return true;
    });
  }

  const patienceRatio = focusedCustomer
    ? Math.max(0, 1 - (now - focusedCustomer.arrivedAt) / focusedCustomer.patienceMs)
    : undefined;

  return (
    <div className="min-h-[100svh] flex flex-col">
      <Topbar
        onOpenRecipes={() => setOpenRecipes(true)}
        onOpenSupermarket={() => setOpenMarket(true)}
        onOpenReviews={() => setOpenReviews(true)}
        onOpenSettings={() => setOpenSettings(true)}
      />

      {/* Scene takes the rest of the viewport */}
      <main className="flex-1 relative overflow-hidden">
        <Bakery2D
          focusedCustomerId={focusedCustomerId}
          setFocusedCustomerId={setFocusedCustomerId}
          onInteract={(i) => {
            if (i.kind === "station" && i.stationId) setPrepStation(i.stationId);
            else if (i.kind === "pantry") setOpenPantry(true);
            else if (i.kind === "supermarket") setOpenMarket(true);
            else if (i.kind === "counter") {
              // Toggle shop if no customers yet — otherwise focus the first
              if (!isOpen && customers.length === 0) toggleStore();
              else if (customers[0]) setFocusedCustomerId(customers[0].id);
            }
          }}
        />

        {/* Persistent order ticket at the bottom */}
        <OrderTicket
          customer={focusedCustomer}
          patienceRatio={patienceRatio}
          canServe={canServe}
          onServe={() => {
            if (!focusedCustomer) return;
            const result = serveCustomer(focusedCustomer.id);
            if (result === "success" || result === "wrong") {
              setFocusedCustomerId(customers.find((c) => c.id !== focusedCustomer.id)?.id ?? null);
            }
          }}
        />

        {/* Send-away button beside ticket (small, only when focused) */}
        {focusedCustomer && (
          <button
            className="absolute bottom-3 right-3 md:right-6 z-30 text-xs text-cream-50 bg-cocoa-600/70 px-2 py-1 rounded-full"
            onClick={() => dismissCustomer(focusedCustomer.id)}
          >
            send away
          </button>
        )}

        {/* Open/close shop hint when there are no customers yet */}
        {customers.length === 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 text-center">
            <button
              onClick={() => toggleStore()}
              className={`rounded-full px-4 py-2 font-bold shadow-bakery ${
                isOpen ? "bg-berry-500 text-white" : "bg-mint-500 text-white"
              }`}
            >
              {isOpen ? "Close Shop" : "Open Shop"}
            </button>
            <div className="text-cocoa-400 text-xs mt-1">
              {isOpen ? "🌼 next customer coming soon" : "tap to welcome customers"}
            </div>
          </div>
        )}
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
      <PrepScene stationId={prepStation} onClose={() => setPrepStation(null)} />
      <LevelUpToast />
    </div>
  );
}
