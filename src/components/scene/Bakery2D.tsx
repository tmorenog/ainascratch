"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/store";
import type { StationId } from "@/game/types";
import { Baker } from "./Baker";
import { CustomerCharacter } from "./CustomerCharacter";
import {
  CounterProp,
  PantryShelf,
  ServiceCounter,
  SupermarketKiosk,
} from "./StationProps";
import { TipJar } from "./TipJar";

/**
 * Cute side-view bakery scene.
 *
 * The room is a fixed virtual width (1200) that scales to fit the screen.
 * The baker walks left/right along the floor; the player taps a station to
 * send the baker walking to it, then the corresponding action triggers.
 *
 * Customers spawn at the right side, walk in, and queue at the service
 * counter, each with a name tag and (optionally) a pet at their feet.
 */

// World coordinates (logical px) for each prop along the floor.
// The baker walks between them on the y = 360 baseline.
const WORLD_W = 1400;
const FLOOR_Y = 360;

const PROP_X = {
  pantry: 90,
  drink: 290,
  pastry: 460,
  scratch: 640,
  pet: 820,
  supermarket: 1010,
  counter: 1200,
} as const;

const STATION_PROPS: { id: StationId; x: number }[] = [
  { id: "drink", x: PROP_X.drink },
  { id: "pastry", x: PROP_X.pastry },
  { id: "scratch", x: PROP_X.scratch },
  { id: "pet", x: PROP_X.pet },
];

const CUSTOMER_QUEUE_X = [PROP_X.counter - 30, PROP_X.counter + 70, PROP_X.counter + 170];

interface SceneInteract {
  kind: "station" | "pantry" | "supermarket" | "counter";
  stationId?: StationId;
}

type WalkTarget = { x: number; afterArrival?: SceneInteract };

export function Bakery2D({
  onInteract,
  focusedCustomerId,
  setFocusedCustomerId,
}: {
  onInteract: (i: SceneInteract) => void;
  focusedCustomerId: string | null;
  setFocusedCustomerId: (id: string | null) => void;
}) {
  const customers = useGame((s) => s.customers);
  const isOpen = useGame((s) => s.isOpen);

  // Baker state
  const [bakerX, setBakerX] = useState(700);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const targetRef = useRef<WalkTarget | null>(null);
  const lastTsRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Step / scene scale to fit container
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calc = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const sw = w / WORLD_W;
      const sh = h / 540;
      setScale(Math.min(sw, sh));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const walkTo = useCallback((target: WalkTarget) => {
    targetRef.current = target;
  }, []);

  // RAF: walk toward target
  useEffect(() => {
    const SPEED = 360; // logical px / sec

    const loop = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.06, (ts - last) / 1000);
      lastTsRef.current = ts;

      const target = targetRef.current;
      if (target) {
        setBakerX((cur) => {
          const dx = target.x - cur;
          const dist = Math.abs(dx);
          if (dist < 4) {
            // Arrived
            targetRef.current = null;
            setWalking(false);
            if (target.afterArrival) onInteract(target.afterArrival);
            return target.x;
          }
          const dir = Math.sign(dx);
          setFacing(dir > 0 ? "right" : "left");
          setWalking(true);
          return cur + dir * Math.min(dist, SPEED * dt);
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [onInteract]);

  // Keyboard movement (desktop)
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    const onDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      keys[e.key.toLowerCase()] = true;
      // Tab through stations with 1..7
      if (e.key === "1") walkTo({ x: PROP_X.pantry, afterArrival: { kind: "pantry" } });
      else if (e.key === "2") walkTo({ x: PROP_X.drink, afterArrival: { kind: "station", stationId: "drink" } });
      else if (e.key === "3") walkTo({ x: PROP_X.pastry, afterArrival: { kind: "station", stationId: "pastry" } });
      else if (e.key === "4") walkTo({ x: PROP_X.scratch, afterArrival: { kind: "station", stationId: "scratch" } });
      else if (e.key === "5") walkTo({ x: PROP_X.pet, afterArrival: { kind: "station", stationId: "pet" } });
      else if (e.key === "6") walkTo({ x: PROP_X.supermarket, afterArrival: { kind: "supermarket" } });
      else if (e.key === "7") walkTo({ x: PROP_X.counter - 60, afterArrival: { kind: "counter" } });
      else if (e.key.toLowerCase() === "e" || e.key === " ") {
        // Interact with nearest hotspot
        const all = [
          { d: Math.abs(bakerX - PROP_X.pantry), action: { kind: "pantry" as const } },
          ...STATION_PROPS.map((s) => ({
            d: Math.abs(bakerX - s.x),
            action: { kind: "station" as const, stationId: s.id },
          })),
          { d: Math.abs(bakerX - PROP_X.supermarket), action: { kind: "supermarket" as const } },
          { d: Math.abs(bakerX - (PROP_X.counter - 60)), action: { kind: "counter" as const } },
        ];
        all.sort((a, b) => a.d - b.d);
        if (all[0].d < 110) onInteract(all[0].action);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    let stop = false;
    let lastTs = performance.now();
    const tick = (ts: number) => {
      if (stop) return;
      const dt = Math.min(0.06, (ts - lastTs) / 1000);
      lastTs = ts;
      const left = keys["a"] || keys["arrowleft"];
      const right = keys["d"] || keys["arrowright"];
      if (left || right) {
        targetRef.current = null; // cancel auto-walk
        setBakerX((x) => {
          const dx = (right ? 1 : 0) - (left ? 1 : 0);
          const next = Math.max(60, Math.min(WORLD_W - 60, x + dx * 360 * dt));
          if (dx !== 0) {
            setFacing(dx > 0 ? "right" : "left");
            setWalking(true);
          } else {
            setWalking(false);
          }
          return next;
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      stop = true;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [bakerX, onInteract, walkTo]);

  // Sort customers into queue slots
  const queued = useMemo(() => customers.slice(0, CUSTOMER_QUEUE_X.length), [customers]);

  // Highlighted hotspot (closest within range)
  const nearest = useMemo(() => {
    const all: Array<{ id: string; x: number; range: number }> = [
      { id: "pantry", x: PROP_X.pantry, range: 110 },
      { id: "drink", x: PROP_X.drink, range: 110 },
      { id: "pastry", x: PROP_X.pastry, range: 110 },
      { id: "scratch", x: PROP_X.scratch, range: 110 },
      { id: "pet", x: PROP_X.pet, range: 110 },
      { id: "supermarket", x: PROP_X.supermarket, range: 110 },
      { id: "counter", x: PROP_X.counter - 60, range: 130 },
    ];
    const inRange = all
      .map((p) => ({ ...p, d: Math.abs(bakerX - p.x) }))
      .filter((p) => p.d < p.range)
      .sort((a, b) => a.d - b.d);
    return inRange[0]?.id ?? null;
  }, [bakerX]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden">
      {/* Sky / wall + floor backdrop */}
      <Backdrop />

      {/* Scaled scene container */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: WORLD_W,
          height: 540,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Floor */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            top: FLOOR_Y + 80,
            background:
              "linear-gradient(180deg, #d4a878 0%, #a06c39 60%, #6b3d1b 100%)",
            backgroundImage: `
              repeating-linear-gradient(90deg,
                rgba(0,0,0,0.05) 0 1px, transparent 1px 80px),
              repeating-linear-gradient(0deg,
                rgba(255,255,255,0.07) 0 1px, transparent 1px 30px)`,
          }}
        />

        {/* Back wall details */}
        <BackWall />

        {/* Pantry shelf — back wall */}
        <Hotspot
          x={PROP_X.pantry}
          y={FLOOR_Y - 90}
          glow={nearest === "pantry"}
          label="Pantry"
          shortcutKey="1"
          onTap={() => walkTo({ x: PROP_X.pantry, afterArrival: { kind: "pantry" } })}
        >
          <PantryShelf size={170} glow={nearest === "pantry"} />
        </Hotspot>

        {/* Stations */}
        {STATION_PROPS.map((s, i) => (
          <Hotspot
            key={s.id}
            x={s.x}
            y={FLOOR_Y}
            glow={nearest === s.id}
            label={STATION_LABEL[s.id]}
            shortcutKey={`${i + 2}`}
            onTap={() =>
              walkTo({ x: s.x, afterArrival: { kind: "station", stationId: s.id } })
            }
          >
            <CounterProp stationId={s.id} size={170} glow={nearest === s.id} />
          </Hotspot>
        ))}

        {/* Supermarket */}
        <Hotspot
          x={PROP_X.supermarket}
          y={FLOOR_Y - 50}
          glow={nearest === "supermarket"}
          label="Market"
          shortcutKey="6"
          onTap={() =>
            walkTo({ x: PROP_X.supermarket, afterArrival: { kind: "supermarket" } })
          }
        >
          <SupermarketKiosk size={170} glow={nearest === "supermarket"} />
        </Hotspot>

        {/* Service counter (right side) */}
        <Hotspot
          x={PROP_X.counter}
          y={FLOOR_Y}
          glow={nearest === "counter"}
          label="Counter"
          shortcutKey="7"
          width={360}
          onTap={() =>
            walkTo({ x: PROP_X.counter - 60, afterArrival: { kind: "counter" } })
          }
        >
          <ServiceCounter size={360} glow={nearest === "counter"} />
        </Hotspot>

        {/* Tip jar perched on the counter top */}
        <div
          className="absolute"
          style={{ left: PROP_X.counter + 100, top: FLOOR_Y - 70, transform: "translate(-50%, 0)" }}
        >
          <TipJar size={84} />
        </div>

        {/* Customers — queued at counter */}
        <AnimatePresence>
          {queued.map((c, idx) => {
            const slotX = CUSTOMER_QUEUE_X[idx] ?? CUSTOMER_QUEUE_X[CUSTOMER_QUEUE_X.length - 1];
            const focused = c.id === focusedCustomerId;
            return (
              <motion.div
                key={c.id}
                className="absolute"
                style={{
                  left: slotX,
                  top: FLOOR_Y - 30,
                  transform: "translate(-50%, -100%)",
                  zIndex: 5 - idx,
                }}
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 200, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                <button
                  onClick={() => {
                    setFocusedCustomerId(c.id);
                    walkTo({ x: PROP_X.counter - 60, afterArrival: { kind: "counter" } });
                  }}
                  className={`group relative ${focused ? "ring-4 ring-mint-400 rounded-2xl" : ""}`}
                >
                  <CustomerCharacter
                    customer={c}
                    size={150}
                    speaking={focused || idx === 0}
                    pet={c.hasPet}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cocoa-600 text-cream-50 text-[11px] font-bold shadow-soft whitespace-nowrap">
                    {c.name}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Baker character */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: bakerX,
            top: FLOOR_Y - 16,
            transform: "translate(-50%, -100%)",
            zIndex: 10,
          }}
          animate={{ left: bakerX }}
          transition={{ type: "tween", duration: 0 }}
        >
          <Baker
            facing={facing}
            walking={walking}
            size={150}
          />
        </motion.div>

        {/* "Closed" sign overlay if shop is closed */}
        {!isOpen && customers.length === 0 && (
          <div
            className="absolute"
            style={{ left: PROP_X.counter + 60, top: 60 }}
          >
            <div className="bg-berry-500 text-white font-display font-black text-xl px-4 py-2 rounded-2xl shadow-bakery rotate-[-6deg] border-2 border-white">
              CLOSED — tap the counter
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STATION_LABEL: Record<StationId, string> = {
  drink: "Drinks",
  pastry: "Pastry",
  oven: "Oven",
  scratch: "Bake",
  pet: "Pets",
};

function Hotspot({
  x,
  y,
  glow,
  label,
  shortcutKey,
  width = 170,
  children,
  onTap,
}: {
  x: number;
  y: number;
  glow: boolean;
  label: string;
  shortcutKey?: string;
  width?: number;
  children: React.ReactNode;
  onTap: () => void;
}) {
  return (
    <button
      className="absolute group"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -100%)",
      }}
      onClick={onTap}
    >
      <div className="relative">
        {children}
        {/* hint pill */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 -bottom-2 px-2.5 py-1 rounded-full text-xs font-bold border shadow-soft transition ${
            glow
              ? "bg-mint-400 text-white border-white animate-wiggle"
              : "bg-cream-50/90 text-cocoa-500 border-cream-200 opacity-75 group-hover:opacity-100"
          }`}
        >
          {label}
          {shortcutKey && (
            <span className="ml-1 opacity-60 hidden md:inline text-[10px]">[{shortcutKey}]</span>
          )}
        </div>
      </div>
    </button>
  );
}

function Backdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, #fde6c7 0%, #fbeed0 38%, #f3d5a0 60%, #e1b478 80%)",
      }}
    >
      {/* Soft sun glow */}
      <div
        className="absolute"
        style={{
          left: "75%",
          top: "8%",
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, rgba(255,237,170,0.85), rgba(255,237,170,0))",
          filter: "blur(2px)",
        }}
      />
      {/* warm vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(124,82,54,0.3) 100%)",
        }}
      />
    </div>
  );
}

function BackWall() {
  // Decorative back wall: framed photos, hanging lights, bunting
  return (
    <div className="absolute left-0 right-0 top-0" style={{ height: FLOOR_Y - 60 }}>
      {/* wallpaper texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fff5dc 0%, #f5dba9 100%)",
          opacity: 0.5,
        }}
      />
      {/* horizontal trim */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: 0,
          height: 12,
          background: "linear-gradient(180deg, #c98933, #7c5236)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      />
      {/* hanging bunting */}
      <svg
        viewBox="0 0 1400 60"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 top-2"
        style={{ height: 50, width: "100%" }}
      >
        <path
          d="M0 6 Q200 26 400 6 Q600 26 800 6 Q1000 26 1200 6 Q1300 16 1400 6"
          fill="none"
          stroke="#7c5236"
          strokeWidth="2"
        />
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 50 + i * 100;
          const y = 12 + (i % 3) * 4;
          const colors = ["#ea5d7c", "#f5b93b", "#86d8a6", "#a78bfa", "#3aa1d0"];
          return (
            <polygon
              key={i}
              points={`${x - 8},${y} ${x + 8},${y} ${x},${y + 18}`}
              fill={colors[i % colors.length]}
              stroke="#fff"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
      {/* framed photos */}
      <Frame x={140} y={70}>🌻</Frame>
      <Frame x={370} y={86}>🥐</Frame>
      <Frame x={560} y={70}>🍰</Frame>
      <Frame x={740} y={88}>🐰</Frame>
      <Frame x={920} y={70}>🍓</Frame>
      <Frame x={1170} y={86}>🌷</Frame>
      {/* window middle */}
      <div
        className="absolute"
        style={{
          left: 240,
          top: 110,
          width: 100,
          height: 90,
          background:
            "linear-gradient(180deg, #aee4ff 0%, #e9f8ff 60%, #cfe9c9 100%)",
          border: "6px solid #7c5236",
          borderRadius: 8,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent calc(50% - 1px), #7c5236 50%, transparent calc(50% + 1px)), linear-gradient(90deg, transparent calc(50% - 1px), #7c5236 50%, transparent calc(50% + 1px))",
          }}
        />
      </div>
    </div>
  );
}

function Frame({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute rounded-md flex items-center justify-center text-2xl"
      style={{
        left: x,
        top: y,
        width: 64,
        height: 64,
        background: "#fff",
        boxShadow: "inset 0 0 0 4px #7c5236, 0 4px 8px rgba(0,0,0,0.15)",
      }}
    >
      {children}
    </div>
  );
}
